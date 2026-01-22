      # Payment Providers Configuration

The Support page now pulls its layout and donation options from the backend database and supports multiple payment providers. This guide explains the required environment variables, setup steps, and testing tips for card, mobile money, and M-Pesa payments.

## 1. Install backend dependencies

```bash
cd backend
npm install
```

> New dependency: [`axios`](https://www.npmjs.com/package/axios) is required for calling external payment APIs.

## 2. Database bootstrap

Run the existing setup script to create the support content tables and seed sample data (hero copy, focus areas, payment methods):

```bash
cd backend
npm run setup-db
```

You can re-run the script safely; it uses `INSERT OR IGNORE` for seed data.

## 3. Environment variables

Add the following variables to `backend/.env` (create the file if it does not exist). Replace the placeholders with live or sandbox credentials for your providers.

```env
# Stripe (optional — still supported through /api/payments/create-intent)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Flutterwave (cards, digital wallets, regional mobile money, M-Pesa via redirect)
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxx
FLUTTERWAVE_REDIRECT_URL=https://your-frontend-domain/support/thank-you

# Safaricom M-Pesa STK Push (direct mobile money)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_lipa_na_mpesa_passkey
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://your-backend-domain/api/mpesa/callback
# Optional: default sandbox endpoint
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
```

### Notes

- `FLUTTERWAVE_REDIRECT_URL` should point to a thank-you page on your frontend that can read the Flutterwave `status` query parameter.
- The default seed data uses Flutterwave for card and digital wallet payments, so you only need the Flutterwave secrets to cover Visa, Mastercard, Apple Pay, Google Pay, and regional mobile wallets.
- M-Pesa STK Push requires the Safaricom sandbox or production credentials. Ensure the phone number provided by the donor is in international format (e.g., `2547XXXXXXXX`).

## 4. Admin tools

The admin dashboard now includes **Support Page Manager** at `/admin/support`. From there, administrators can:

- Edit hero titles, subtitles, statistics, and custom amount card copy.
- Add, reorder, and deactivate "Why Your Support Matters" focus cards.
- Add or deactivate payment methods and update their integration JSON payloads.

All content changes are stored in SQLite tables (`support_page_settings`, `support_causes`, `support_payment_methods`).

## 5. Support page behaviour

- Frontend route: `/support`
- Data source: `GET /api/support-page`
- Payment flow: `POST /api/payments/initiate` chooses the correct provider and returns either a redirect URL, an M-Pesa STK reference, or a Stripe client secret.
- Donations are recorded immediately via `POST /api/donations` with status `processing` or `pending` depending on the provider.

## 6. Testing checklist

1. **Seed data** – run `npm run setup-db` after pulling new code.
2. **Start services**
   ```bash
   # Backend
   cd backend
   npm run start

   # Frontend (new terminal)
   npm run dev
   ```
3. **Verify support content** – visit [`http://localhost:5174/support`](http://localhost:5174/support) and confirm the layout matches the provided design.
4. **Check admin editing** – log in as an admin and open [`http://localhost:5174/admin/support`](http://localhost:5174/admin/support) to update text and payment methods.
5. **Flutterwave sandbox** – initiate a donation using "Pay with Card" or "Pay with Mobile Money" and ensure you are redirected to the Flutterwave checkout link.
6. **M-Pesa sandbox** – use a test phone number and confirm that the API returns a `CheckoutRequestID`. Authorize the STK push in the Safaricom simulator.
7. **Database audit** – after each test donation, run `SELECT * FROM donations ORDER BY created_at DESC;` using the SQLite CLI or a GUI to confirm `transaction_id`, `payment_method`, and `status` values.

## 7. Troubleshooting tips

- **Missing Flutterwave key**: `/api/payments/initiate` returns `500` with `Flutterwave secret key is not configured` — double-check `FLUTTERWAVE_SECRET_KEY`.
- **M-Pesa token failure**: ensure sandbox credentials are correct and the server can reach `sandbox.safaricom.co.ke`.
- **Invalid JSON config**: when editing payment methods, the "Integration config" field must contain valid JSON (the admin UI validates this before saving).
- **CORS/redirect issues**: Flutterwave requires your redirect URL to match the one configured in their dashboard.

With these settings in place, guests can donate via card, mobile money, M-Pesa STK Push, or other digital wallets, and administrators can curate the entire support experience without code changes.
