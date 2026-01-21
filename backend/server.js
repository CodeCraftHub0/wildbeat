const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Stripe = require('stripe');

const app = express();
const PORT = 3001;

// Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

const ADMIN_EMAIL = 'iliceumuhoza11@gmail.com';
const dbPath = path.join(__dirname, 'wildbeat.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  db.get('SELECT u.* FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > datetime("now")', [token], (err, user) => {
    if (err || !user) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Wildbeat Safari API is running!', version: '2.0.0' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Wildbeat Safari API', version: '2.0.0', endpoints: ['tours', 'bookings', 'reviews', 'gallery', 'donations'] });
});

// ===== PAYMENT PROCESSING =====

// Create payment intent for Stripe
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, donation_type_id, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      description: description || `Wildbeat Safari - ${donation_type_id}`,
      metadata: {
        donation_type_id: donation_type_id
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm donation after payment
app.post('/api/confirm-donation', async (req, res) => {
  try {
    const { payment_intent_id, donation_type_id, name, email, message, payment_method } = req.body;

    if (!payment_intent_id || !donation_type_id || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    db.get('SELECT * FROM donation_types WHERE id = ?', [donation_type_id], (err, donationType) => {
      if (err || !donationType) {
        return res.status(404).json({ error: 'Donation type not found' });
      }

      db.run(
        'INSERT INTO donations (donation_type_id, name, email, amount, payment_method, transaction_id, status, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [donation_type_id, name, email, donationType.amount, payment_method || 'stripe', payment_intent_id, 'completed', message],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to save donation' });
          }

          res.json({
            success: true,
            id: this.lastID,
            message: 'Donation confirmed successfully'
          });
        }
      );
    });
  } catch (error) {
    console.error('Confirm donation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== TOURS API =====

app.get('/api/tours', (req, res) => {
  db.all('SELECT * FROM tours ORDER BY created_at', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const tours = rows.map(row => ({
      ...row,
      highlights: row.highlights ? row.highlights.split(',') : []
    }));
    res.json(tours);
  });
});

app.get('/api/tours/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM tours WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Tour not found' });
    const tour = {
      ...row,
      highlights: row.highlights ? row.highlights.split(',') : []
    };
    res.json(tour);
  });
});

// ===== BOOKINGS API =====

app.post('/api/bookings', authenticateToken, (req, res) => {
  const { tour_id, name, email, phone, date, guests, special_requests, total_price } = req.body;
  db.run(
    'INSERT INTO bookings (tour_id, name, email, phone, date, guests, special_requests, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [tour_id, name, email, phone, date, guests, special_requests, total_price],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Booking created successfully' });
    }
  );
});

app.get('/api/bookings', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM bookings ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ===== REVIEWS API =====

app.get('/api/reviews', (req, res) => {
  db.all('SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/reviews', (req, res) => {
  const { tour_id, name, email, rating, review_text } = req.body;
  db.run(
    'INSERT INTO reviews (tour_id, name, email, rating, review_text, approved) VALUES (?, ?, ?, ?, ?, 1)',
    [tour_id, name, email, rating, review_text],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Review posted successfully' });
    }
  );
});

// ===== GALLERY API =====

app.post('/api/gallery', (req, res) => {
  const { title, image_url, category, alt_text } = req.body;
  db.run(
    'INSERT INTO gallery (title, image_url, category, alt_text) VALUES (?, ?, ?, ?)',
    [title, image_url, category, alt_text],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Photo uploaded successfully' });
    }
  );
});

app.get('/api/gallery', (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM gallery ORDER BY created_at DESC';
  let params = [];
  if (category && category !== 'all') {
    query = 'SELECT * FROM gallery WHERE category = ? ORDER BY created_at DESC';
    params = [category];
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ===== DONATION TYPES API =====

app.get('/api/donation-types', (req, res) => {
  db.all('SELECT * FROM donation_types WHERE is_active = 1 ORDER BY sort_order ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const types = rows.map(row => ({
      ...row,
      benefits: row.benefits ? row.benefits.split(',') : []
    }));
    res.json(types);
  });
});

app.get('/api/donation-types/all', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM donation_types ORDER BY sort_order ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const types = rows.map(row => ({
      ...row,
      benefits: row.benefits ? row.benefits.split(',') : []
    }));
    res.json(types);
  });
});

app.post('/api/donation-types', authenticateToken, requireAdmin, (req, res) => {
  const { id, title, amount, description, icon_color, benefits, is_active, sort_order } = req.body;
  const benefitsStr = Array.isArray(benefits) ? benefits.join(',') : benefits;
  if (id) {
    db.run(
      'UPDATE donation_types SET title = ?, amount = ?, description = ?, icon_color = ?, benefits = ?, is_active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, amount, description, icon_color, benefitsStr, is_active ? 1 : 0, sort_order, id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, message: 'Donation type updated successfully' });
      }
    );
  } else {
    db.run(
      'INSERT INTO donation_types (title, amount, description, icon_color, benefits, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, amount, description, icon_color, benefitsStr, 1, sort_order || 0],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Donation type created successfully' });
      }
    );
  }
});

app.delete('/api/donation-types/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  db.run('UPDATE donation_types SET is_active = 0 WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Donation type deactivated successfully' });
  });
});

// ===== STRIPE PAYMENT API =====

app.post('/api/payments/create-intent', (req, res) => {
  const { amount, email, name } = req.body;
  if (!amount || amount < 1) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    receipt_email: email,
    metadata: { donor_name: name, donor_email: email }
  }, (err, paymentIntent) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ clientSecret: paymentIntent.client_secret });
  });
});

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_demo');
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'payment_intent.succeeded') {
    console.log('✅ Payment succeeded:', event.data.object.id);
  }
  res.json({ received: true });
});

// ===== DONATIONS API =====

app.post('/api/donations', (req, res) => {
  const { donation_type_id, name, email, amount, payment_method, transaction_id, message } = req.body;
  db.run(
    'INSERT INTO donations (donation_type_id, name, email, amount, payment_method, transaction_id, status, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [donation_type_id, name, email, amount, payment_method || 'stripe', transaction_id, 'completed', message],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Donation processed successfully' });
    }
  );
});

app.get('/api/donations', authenticateToken, requireAdmin, (req, res) => {
  db.all(
    `SELECT d.*, dt.title as donation_type_title, dt.amount as donation_type_amount 
     FROM donations d 
     LEFT JOIN donation_types dt ON d.donation_type_id = dt.id 
     ORDER BY d.created_at DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get('/api/donations/stats', authenticateToken, requireAdmin, (req, res) => {
  db.all(
    `SELECT 
       dt.id,
       dt.title,
       COUNT(d.id) as count,
       SUM(d.amount) as total,
       dt.amount as type_amount
     FROM donation_types dt
     LEFT JOIN donations d ON dt.id = d.donation_type_id AND d.status = 'completed'
     GROUP BY dt.id
     ORDER BY dt.sort_order ASC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ===== MISC ENDPOINTS =====

app.get('/approve-review/:token', (req, res) => {
  const { token } = req.params;
  db.run(
    'UPDATE reviews SET approved = 1 WHERE approval_token = ?',
    [token],
    function(err) {
      if (err) {
        return res.send('<h1>Error approving review</h1>');
      }
      if (this.changes === 0) {
        return res.send('<h1>Review not found or already approved</h1>');
      }
      res.send(`
        <html>
          <head><title>Review Approved</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: #D4A574;">✅ Review Approved!</h1>
            <p>The review has been approved and is now live on your website.</p>
            <a href="http://localhost:5174/reviews" style="background: #D4A574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Reviews</a>
          </body>
        </html>
      `);
    }
  );
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Wildbeat Safari API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Wildbeat Safari API running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🔗 Test API: http://localhost:${PORT}/api/`);
  console.log(`💳 Payment processing: Stripe enabled`);
});
