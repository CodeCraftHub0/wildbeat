import fs from 'fs';

const file = 'backend/server.js';
let content = fs.readFileSync(file, 'utf8');

const stripePaymentCode = `// ===== STRIPE PAYMENT API =====

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
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }
  if (event.type === 'payment_intent.succeeded') {
    console.log('✅ Payment succeeded:', event.data.object.id);
  }
  res.json({ received: true });
});

`;

content = content.replace(
  "// ===== DONATIONS API =====",
  stripePaymentCode + "// ===== DONATIONS API ====="
);

fs.writeFileSync(file, content);
console.log('✅ Added Stripe payment endpoints!');
