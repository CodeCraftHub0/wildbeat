const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Stripe = require('stripe');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo');

// Middleware
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : undefined;

const corsOptions = allowedOrigins
  ? { origin: allowedOrigins, credentials: true }
  : { origin: '*' };

app.use(cors(corsOptions));
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
const ADMIN_PASSCODE = '181950';
const dbPath = path.join(__dirname, 'wildbeat.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Database helpers
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) {
      return reject(err);
    }
    resolve(rows);
  });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) {
      return reject(err);
    }
    resolve(row);
  });
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) {
      return reject(err);
    }
    resolve({ id: this.lastID, changes: this.changes });
  });
});

const parseJSON = (value, fallback = {}) => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const generateReference = (prefix = 'WB') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  db.get('SELECT u.* FROM users u JOIN sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > datetime("now")', [token], (err, user) => {
    if (err || !user) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    req.token = token;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role
});

const createSession = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  await dbRun(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, datetime("now", "+7 days"))',
    [userId, token]
  );
  return token;
};

// ===== AUTH API =====

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, adminCode } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const normalizedAdminCode = typeof adminCode === 'string' ? adminCode.trim() : '';
    const isAdminSignup = normalizedAdminCode === ADMIN_PASSCODE || email === ADMIN_EMAIL;

    if (normalizedAdminCode && normalizedAdminCode !== ADMIN_PASSCODE && email !== ADMIN_EMAIL) {
      return res.status(400).json({ error: 'Invalid admin code' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = isAdminSignup ? 'admin' : 'guest';

    await dbRun(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role]
    );

    res.status(201).json({ message: 'Account created successfully', role });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await dbRun('DELETE FROM sessions WHERE user_id = ?', [user.id]);
    const token = await createSession(user.id);

    res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.token;
    if (token) {
      await dbRun('DELETE FROM sessions WHERE token = ?', [token]);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to log out' });
  }
});

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

// ===== SUPPORT PAGE CONTENT API =====

app.get('/api/support-page', async (req, res) => {
  try {
    const settings = await dbGet('SELECT * FROM support_page_settings WHERE id = 1');
    const causes = await dbAll('SELECT * FROM support_causes WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
    const donationTypesRaw = await dbAll('SELECT * FROM donation_types WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
    const paymentMethodsRaw = await dbAll('SELECT * FROM support_payment_methods WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');

    const donationTypes = donationTypesRaw.map((row) => ({
      ...row,
      benefits: row.benefits ? row.benefits.split(',') : []
    }));

    const paymentMethods = paymentMethodsRaw.map(({ config, ...method }) => method);

    res.json({
      settings,
      causes,
      donationTypes,
      paymentMethods
    });
  } catch (error) {
    console.error('Support page fetch error:', error);
    res.status(500).json({ error: 'Failed to load support page data' });
  }
});

app.put('/api/support-page/settings', authenticateToken, requireAdmin, async (req, res) => {
  const {
    hero_kicker,
    hero_title,
    hero_subtitle,
    hero_description,
    hero_cta_label,
    hero_cta_link,
    stats_label_one,
    stats_value_one,
    stats_label_two,
    stats_value_two,
    stats_label_three,
    stats_value_three,
    custom_title,
    custom_description,
    custom_button_label,
    custom_button_link
  } = req.body;

  try {
    const existing = await dbGet('SELECT id FROM support_page_settings WHERE id = 1');

    if (existing) {
      await dbRun(
        `UPDATE support_page_settings SET
          hero_kicker = ?,
          hero_title = ?,
          hero_subtitle = ?,
          hero_description = ?,
          hero_cta_label = ?,
          hero_cta_link = ?,
          stats_label_one = ?,
          stats_value_one = ?,
          stats_label_two = ?,
          stats_value_two = ?,
          stats_label_three = ?,
          stats_value_three = ?,
          custom_title = ?,
          custom_description = ?,
          custom_button_label = ?,
          custom_button_link = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1`,
        [
          hero_kicker,
          hero_title,
          hero_subtitle,
          hero_description,
          hero_cta_label,
          hero_cta_link,
          stats_label_one,
          stats_value_one,
          stats_label_two,
          stats_value_two,
          stats_label_three,
          stats_value_three,
          custom_title,
          custom_description,
          custom_button_label,
          custom_button_link
        ]
      );
    } else {
      await dbRun(
        `INSERT INTO support_page_settings (
          id,
          hero_kicker,
          hero_title,
          hero_subtitle,
          hero_description,
          hero_cta_label,
          hero_cta_link,
          stats_label_one,
          stats_value_one,
          stats_label_two,
          stats_value_two,
          stats_label_three,
          stats_value_three,
          custom_title,
          custom_description,
          custom_button_label,
          custom_button_link
        ) VALUES (
          1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )`,
        [
          hero_kicker,
          hero_title,
          hero_subtitle,
          hero_description,
          hero_cta_label,
          hero_cta_link,
          stats_label_one,
          stats_value_one,
          stats_label_two,
          stats_value_two,
          stats_label_three,
          stats_value_three,
          custom_title,
          custom_description,
          custom_button_label,
          custom_button_link
        ]
      );
    }

    const updated = await dbGet('SELECT * FROM support_page_settings WHERE id = 1');
    res.json({ message: 'Support page settings saved', settings: updated });
  } catch (error) {
    console.error('Support settings error:', error);
    res.status(500).json({ error: 'Failed to save support settings' });
  }
});

app.get('/api/support-causes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const causes = await dbAll('SELECT * FROM support_causes ORDER BY sort_order ASC, id ASC');
    res.json(causes);
  } catch (error) {
    console.error('Support causes fetch error:', error);
    res.status(500).json({ error: 'Failed to load support causes' });
  }
});

app.post('/api/support-causes', authenticateToken, requireAdmin, async (req, res) => {
  const { id, title, description, icon, sort_order = 0, is_active = 1 } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    if (id) {
      await dbRun(
        `UPDATE support_causes SET
          title = ?,
          description = ?,
          icon = ?,
          sort_order = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [title, description, icon, sort_order, is_active ? 1 : 0, id]
      );
      res.json({ message: 'Support area updated', id });
    } else {
      const result = await dbRun(
        'INSERT INTO support_causes (title, description, icon, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
        [title, description, icon, sort_order, is_active ? 1 : 0]
      );
      res.json({ message: 'Support area created', id: result.id });
    }
  } catch (error) {
    console.error('Support cause save error:', error);
    res.status(500).json({ error: 'Failed to save support area' });
  }
});

app.delete('/api/support-causes/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await dbRun('UPDATE support_causes SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    res.json({ message: 'Support area deactivated' });
  } catch (error) {
    console.error('Support cause delete error:', error);
    res.status(500).json({ error: 'Failed to deactivate support area' });
  }
});

app.get('/api/support-payment-methods', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const methods = await dbAll('SELECT * FROM support_payment_methods ORDER BY sort_order ASC, id ASC');
    res.json(methods.map((method) => ({
      ...method,
      config: parseJSON(method.config, {})
    })));
  } catch (error) {
    console.error('Support payment methods fetch error:', error);
    res.status(500).json({ error: 'Failed to load payment methods' });
  }
});

app.post('/api/support-payment-methods', authenticateToken, requireAdmin, async (req, res) => {
  const {
    id,
    name,
    tagline,
    description,
    integration_key,
    button_label,
    icon,
    currency = 'USD',
    config,
    sort_order = 0,
    is_active = 1
  } = req.body;

  if (!name || !integration_key) {
    return res.status(400).json({ error: 'Name and integration key are required' });
  }

  const configString = typeof config === 'string' ? config : JSON.stringify(config || {});

  try {
    if (id) {
      await dbRun(
        `UPDATE support_payment_methods SET
          name = ?,
          tagline = ?,
          description = ?,
          integration_key = ?,
          button_label = ?,
          icon = ?,
          currency = ?,
          config = ?,
          sort_order = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          name,
          tagline,
          description,
          integration_key,
          button_label,
          icon,
          currency,
          configString,
          sort_order,
          is_active ? 1 : 0,
          id
        ]
      );
      res.json({ message: 'Payment method updated', id });
    } else {
      const result = await dbRun(
        `INSERT INTO support_payment_methods (
          name,
          tagline,
          description,
          integration_key,
          button_label,
          icon,
          currency,
          config,
          sort_order,
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          tagline,
          description,
          integration_key,
          button_label,
          icon,
          currency,
          configString,
          sort_order,
          is_active ? 1 : 0
        ]
      );
      res.json({ message: 'Payment method created', id: result.id });
    }
  } catch (error) {
    console.error('Support payment method save error:', error);
    res.status(500).json({ error: 'Failed to save payment method' });
  }
});

app.delete('/api/support-payment-methods/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await dbRun('UPDATE support_payment_methods SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    res.json({ message: 'Payment method deactivated' });
  } catch (error) {
    console.error('Support payment method delete error:', error);
    res.status(500).json({ error: 'Failed to deactivate payment method' });
  }
});


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

// ===== PAYMENT API =====

app.post('/api/payments/initiate', async (req, res) => {
  const {
    method_id,
    donation_type_id,
    amount,
    currency,
    name,
    email,
    phone,
    message,
    return_url
  } = req.body;

  if (!method_id) {
    return res.status(400).json({ error: 'Payment method is required' });
  }

  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Donor name is required' });
  }

  try {
    const method = await dbGet('SELECT * FROM support_payment_methods WHERE id = ?', [method_id]);

    if (!method || !method.is_active) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    const config = parseJSON(method.config, {});
    const selectedCurrency = (currency || method.currency || 'USD').toString().toUpperCase();
    const reference = generateReference('WB');

    switch (method.integration_key) {
      case 'stripe_card': {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(numericAmount * 100),
          currency: selectedCurrency.toLowerCase(),
          receipt_email: email,
          metadata: {
            donor_name: name,
            donor_email: email,
            donation_type_id: donation_type_id || '',
            reference
          }
        });

        return res.json({
          type: 'stripe',
          provider: 'stripe',
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          reference
        });
      }

      case 'flutterwave_mobile':
      case 'flutterwave_wallet':
      case 'flutterwave_card': {
        if (!process.env.FLUTTERWAVE_SECRET_KEY) {
          return res.status(500).json({ error: 'Flutterwave secret key is not configured' });
        }

        const payload = {
          tx_ref: reference,
          amount: numericAmount.toString(),
          currency: selectedCurrency,
          redirect_url: return_url || process.env.FLUTTERWAVE_REDIRECT_URL || 'https://wildbeat.example.com/support/thank-you',
          customer: {
            email,
            name,
            phonenumber: phone
          },
          customizations: {
            title: 'Wildbeat Support',
            description: `Donation via ${method.name}`
          }
        };

        if (config.payment_options) {
          payload.payment_options = config.payment_options;
        }

        if (config.meta) {
          payload.meta = config.meta;
        }

        if (config.subaccounts) {
          payload.subaccounts = config.subaccounts;
        }

        const flutterwaveResponse = await axios.post(
          'https://api.flutterwave.com/v3/payments',
          payload,
          {
            headers: {
              Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!flutterwaveResponse.data || flutterwaveResponse.data.status !== 'success') {
          throw new Error('Flutterwave payment creation failed');
        }

        return res.json({
          type: 'redirect',
          provider: 'flutterwave',
          reference,
          link: flutterwaveResponse.data.data.link
        });
      }

      case 'mpesa_stk': {
        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

        if (!consumerKey || !consumerSecret) {
          return res.status(500).json({ error: 'M-Pesa credentials are not configured' });
        }

        const mpesaBaseUrl = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
        const authResponse = await axios.get(
          `${mpesaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`,
          { auth: { username: consumerKey, password: consumerSecret } }
        );

        const accessToken = authResponse.data?.access_token;
        if (!accessToken) {
          throw new Error('Failed to obtain M-Pesa access token');
        }

        const businessShortcode = config.business_shortcode || process.env.MPESA_SHORTCODE;
        const passkey = config.passkey || process.env.MPESA_PASSKEY;
        const callbackUrl = config.callback || process.env.MPESA_CALLBACK_URL;

        if (!businessShortcode || !passkey || !callbackUrl) {
          return res.status(500).json({ error: 'M-Pesa configuration missing shortcode, passkey, or callback URL' });
        }

        if (!phone) {
          return res.status(400).json({ error: 'Phone number is required for M-Pesa payments' });
        }

        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const password = Buffer.from(`${businessShortcode}${passkey}${timestamp}`).toString('base64');

        const mpesaPayload = {
          BusinessShortCode: businessShortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.round(numericAmount),
          PartyA: phone,
          PartyB: businessShortcode,
          PhoneNumber: phone,
          CallBackURL: callbackUrl,
          AccountReference: donation_type_id ? `DONATION-${donation_type_id}` : 'WILDBEAT',
          TransactionDesc: message || `Wildbeat Support - ${method.name}`
        };

        const stkResponse = await axios.post(
          `${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`,
          mpesaPayload,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const responseBody = stkResponse.data || {};
        if (responseBody.ResponseCode !== '0') {
          throw new Error(responseBody.errorMessage || 'M-Pesa STK push failed');
        }

        return res.json({
          type: 'mpesa',
          provider: 'mpesa',
          reference: responseBody.CheckoutRequestID,
          response: responseBody
        });
      }

      default:
        return res.status(400).json({ error: `Unsupported payment integration: ${method.integration_key}` });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: error.message || 'Failed to initiate payment' });
  }
});

// Legacy Stripe payment intent endpoint (maintained for backward compatibility)
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
  const { donation_type_id, name, email, amount, payment_method, transaction_id, message, status = 'completed' } = req.body;
  db.run(
    'INSERT INTO donations (donation_type_id, name, email, amount, payment_method, transaction_id, status, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [donation_type_id, name, email, amount, payment_method || 'stripe', transaction_id, status, message],
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
