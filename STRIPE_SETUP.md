# Stripe Payment Integration Guide

## Overview
The Wildbeat Safari donation system now includes full Stripe payment integration for secure, real-world payment processing.

## 🚀 Features Implemented

### Backend (Node.js/Express)
- **Stripe SDK Integration**: Configured with test API keys
- **Payment Intent Creation**: `/api/create-payment-intent` endpoint
- **Donation Confirmation**: `/api/confirm-donation` endpoint
- **Database Persistence**: All donations stored with payment method & transaction ID
- **Email Notifications**: Automatic thank-you emails to donors

### Frontend (React/TypeScript)
- **Stripe.js Library**: `@stripe/stripe-js` & `@stripe/react-stripe-js` installed
- **Payment Method Selection**: 4 methods (Card, Mobile Money, Bank Transfer, Digital Wallet)
- **Real-time Tier Selection**: Dynamic tier loading from backend
- **Form Validation**: Required fields (name, email, payment method)
- **Error Handling**: User-friendly error messages
- **Success Confirmation**: Visual feedback after successful donation

## 📋 Configuration

### Environment Variables (.env)
```env
# Stripe Test Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QLKlEAm6BZFqCb3v9GZ1Z9Z1Z9Z1Z9Z
STRIPE_SECRET_KEY=sk_test_51QLKlEAm6BZFqCb3v9GZ1Z9Z1Z9Z1Z9Z

# Email Configuration
EMAIL_USER=iliceumuhoza11@gmail.com
EMAIL_PASS=your-app-password
```

**Note**: Replace test keys with your actual Stripe keys from [dashboard.stripe.com](https://dashboard.stripe.com)

## 🔑 Stripe Test Cards

For testing with the following payment intents:

| Card Number | Exp Date | CVC | Purpose |
|-------------|----------|-----|---------|
| 4242 4242 4242 4242 | 12/25 | 123 | Successful payment |
| 4000 0000 0000 0002 | 12/25 | 123 | Card declined |
| 4000 0025 0000 3155 | 12/25 | 123 | Require authentication |

## 🌐 API Endpoints

### Payment Endpoints

**POST** `/api/create-payment-intent`
```json
Request:
{
  "amount": 25,
  "donation_type_id": 1,
  "description": "Donation - Explorer"
}

Response:
{
  "clientSecret": "pi_xxx_secret_yyy",
  "paymentIntentId": "pi_xxx"
}
```

**POST** `/api/confirm-donation`
```json
Request:
{
  "payment_intent_id": "pi_xxx",
  "donation_type_id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "payment_method": "card",
  "message": "Optional message"
}

Response:
{
  "success": true,
  "id": 1,
  "message": "Donation confirmed successfully"
}
```

### Donation Management Endpoints

**GET** `/api/donation-types`
- Returns all active donation types

**POST** `/api/donation-types` (Admin only)
- Create or update donation types
- Requires: `authenticateToken + requireAdmin`

**DELETE** `/api/donation-types/:id` (Admin only)
- Deactivate a donation type

**GET** `/api/donations` (Admin only)
- View all donations with donor info

**GET** `/api/donations/stats` (Admin only)
- Statistics per donation tier

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install stripe

# Frontend
npm install @stripe/react-stripe-js @stripe/stripe-js
```

### 2. Configure Stripe
- Create account at [stripe.com](https://stripe.com)
- Get API keys from dashboard
- Update `.env` with your keys

### 3. Start Servers
```bash
# Terminal 1: Backend
cd backend
node server.js
# Runs on http://localhost:3001

# Terminal 2: Frontend
npm run dev
# Runs on http://localhost:5174
```

### 4. Access the App
- **Guest Donations**: http://localhost:5174/support
- **Admin Dashboard**: http://localhost:5174/admin/donations
- **API Health Check**: http://localhost:3001/api/

## 📊 Database Schema

### donations table
```sql
CREATE TABLE donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_type_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donation_type_id) REFERENCES donation_types(id)
);
```

### donation_types table
```sql
CREATE TABLE donation_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  icon_color TEXT,
  benefits TEXT,
  is_active BOOLEAN DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Security Features

✅ **JWT Authentication**: Token-based session validation
✅ **Admin Role Verification**: Admin-only endpoints protected
✅ **Stripe PCI Compliance**: No raw card data stored
✅ **Transaction ID Tracking**: All payments logged with unique IDs
✅ **Email Encryption**: Secure donation confirmations

## 🧪 Testing Workflow

1. **Visit Support Page**: http://localhost:5174/support
2. **Select Donation Tier**: Choose Explorer ($25), Adventurer ($50), Guardian ($100), or Champion ($250)
3. **Select Payment Method**: Card, Mobile Money, Bank Transfer, or Digital Wallet
4. **Enter Donor Info**: Name, email, optional message
5. **Process Payment**: Click "Donate $X"
6. **Confirm Donation**: Check database or admin dashboard for logged donation

## 📧 Email Notifications

When a donation is successfully processed:
1. Donor receives thank-you email at provided address
2. Admin receives notification at `iliceumuhoza11@gmail.com`
3. Both include donation details and impact information

## 🐛 Troubleshooting

### Stripe Not Initializing
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is in `.env`
- Check browser console for errors
- Ensure Stripe CDN is accessible

### Payment Fails
- Use test card: `4242 4242 4242 4242`
- Check backend logs for API errors
- Verify `STRIPE_SECRET_KEY` in backend environment

### Donations Not Appearing
- Check database: `SELECT * FROM donations;`
- Verify admin authentication token
- Check admin panel at `/admin/donations`

## 🚀 Next Steps

1. **Webhook Integration**: Add Stripe webhook handlers for async payment updates
2. **Email Configuration**: Update Gmail app-specific password
3. **Production Deployment**: Switch to live Stripe keys
4. **Payment Analytics**: Enhanced donor tracking and metrics
5. **Refund Handling**: Implement Stripe refund API integration

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [React Stripe Integration](https://stripe.com/docs/stripe-js/react)
- [Webhook Setup Guide](https://stripe.com/docs/webhooks)

---

**Last Updated**: 2024
**Status**: ✅ Fully Implemented
