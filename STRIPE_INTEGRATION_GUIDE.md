# Stripe Integration Setup Guide

This guide explains how to set up and use the Stripe payment integration in TradeBridge, including Stripe Connect for marketplace payments and QR code checkout.

## Overview

The Stripe integration enables:

- **Stripe Connect**: Lenders can connect their Stripe accounts to receive payments directly
- **QR Code Payments**: Product QR codes link directly to checkout for quick payments
- **Marketplace Payments**: Platform takes a 10% fee, remainder goes to the lender's connected account
- **Secure Checkout**: Stripe handles all payment processing and PCI compliance

## Prerequisites

1. A Stripe account (test or live mode)
2. Stripe API keys (publishable and secret)
3. PostgreSQL database with the `users` table

## Setup Instructions

### 1. Database Migration

Run the SQL migration to add the `stripe_account_id` column to your users table:

```bash
# Execute the migration file
psql -d your_database -f add_stripe_account_migration.sql
```

Or manually in your Supabase SQL editor:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id ON users(stripe_account_id);
COMMENT ON COLUMN users.stripe_account_id IS 'Stripe Connect account ID (acct_xxx) for receiving payments';
```

### 2. Environment Variables

Add the following to your `.env.local` file (already configured with your test keys):

For production, replace with live mode keys:

- Get your keys from: https://dashboard.stripe.com/apikeys

### 3. Install Dependencies

Dependencies are already installed, but if needed:

```bash
cd frontend
npm install stripe
```

## How It Works

### Stripe Connect Flow (For Lenders)

1. **Lender visits Profile page** → Sees "Connect Stripe Account" card
2. **Click "Connect Stripe Account"** → Creates a Stripe Express account
3. **Redirected to Stripe Onboarding** → Completes identity verification and banking details
4. **Returns to TradeBridge** → Account marked as connected, can now receive payments

API Endpoints:

- `POST /api/stripe/connect` - Create/onboard Stripe account
- `GET /api/stripe/connect` - Check account connection status

### QR Code Payment Flow (For Borrowers)

1. **Lender shares product QR code** → Generated via Share button on product page
2. **Borrower scans QR code** → Opens `/pay/qr?productId=123&days=1`
3. **Automatic checkout creation** → Server creates Stripe Checkout Session
4. **Redirect to Stripe Checkout** → Borrower enters payment details
5. **Payment processed** → 90% to lender, 10% platform fee
6. **Redirect to success page** → Booking confirmed

API Endpoints:

- `POST /api/stripe/create-checkout-session` - Create payment session
- Frontend pages:
  - `/pay/qr` - QR payment starter (redirects to checkout)
  - `/payments/success` - Payment confirmation page
  - `/payments/cancel` - Payment cancellation page

### Payment Distribution

When a payment is made:

- **Platform Fee**: 10% (`application_fee_amount`)
- **Lender Receives**: 90% (via `transfer_data.destination`)
- Funds are automatically transferred to the lender's connected Stripe account

## Testing

### Test Mode Setup

The integration is configured with test mode keys. Use these test card numbers:

**Successful Payment:**

```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Declined Payment:**

```
Card: 4000 0000 0000 0002
```

**Requires Authentication (3D Secure):**

```
Card: 4000 0025 0000 3155
```

More test cards: https://stripe.com/docs/testing

### Testing the Flow

#### Test Stripe Connect (Lender):

1. Start the dev server:

   ```bash
   cd frontend
   npm run dev
   ```

2. Login to the application
3. Navigate to `/profile`
4. Click "Connect Stripe Account"
5. Complete the test onboarding flow (use fake but realistic data)
6. Verify "Stripe Account Connected" status appears

#### Test QR Payment (Borrower):

1. As a lender, create/view a product
2. Click the Share button
3. Download or scan the QR code (use your phone's camera or QR scanner app)
4. Should redirect to `/pay/qr?productId=123`
5. Automatically redirects to Stripe Checkout
6. Use test card `4242 4242 4242 4242`
7. Complete payment
8. Redirected to `/payments/success`

**Manual URL test:**

```
http://localhost:3000/pay/qr?productId=1&days=3
```

### Check Stripe Dashboard

Monitor payments in your Stripe dashboard:

- Test mode: https://dashboard.stripe.com/test/payments
- Connect accounts: https://dashboard.stripe.com/test/connect/accounts

## File Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── stripe/
│   │       ├── connect/route.ts              # Stripe Connect onboarding
│   │       └── create-checkout-session/route.ts  # Checkout session creation
│   ├── pay/
│   │   └── qr/page.tsx                       # QR payment starter page
│   ├── payments/
│   │   ├── success/page.tsx                  # Payment success page
│   │   └── cancel/page.tsx                   # Payment cancellation page
│   └── profile/page.tsx                      # Profile with Stripe Connect card
├── components/
│   ├── shared/
│   │   └── StripeConnectCard.tsx             # Stripe Connect UI component
│   └── ui/
│       └── social-sharing.tsx                # Updated QR generation (payment links)
└── .env.local                                # Environment variables
```

## Security Considerations

✅ **Implemented:**

- Secret key never exposed to client
- Server-side checkout session creation
- Payment amounts validated server-side
- Connected account validation before payment

⚠️ **Recommended additions:**

- Webhook handler for payment confirmation (`/api/stripe/webhook`)
- Store payment metadata in database
- Idempotency keys for payment creation
- Rate limiting on payment endpoints

## Troubleshooting

### "Seller hasn't connected Stripe account"

- Lender must complete Stripe Connect onboarding first
- Check database: `SELECT stripe_account_id FROM users WHERE uuid = 'xxx'`
- Verify account status in Stripe Dashboard

### "Failed to create checkout session"

- Check server logs for detailed error
- Verify `STRIPE_SECRET_KEY` is set correctly
- Ensure product exists and has valid price
- Check lender has `stripe_account_id` set

### QR code doesn't redirect to checkout

- Verify QR contains correct URL format: `/pay/qr?productId=123`
- Check browser console for errors
- Test URL manually in browser first

### Webhook signature verification fails

- Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Next Steps

### Recommended Enhancements:

1. **Webhook Handler** - Confirm payments and update bookings

   ```typescript
   // app/api/stripe/webhook/route.ts
   // Handle events: payment_intent.succeeded, account.updated, etc.
   ```

2. **Payment History** - Show transaction history in dashboard
3. **Refunds** - Add refund functionality for cancelled bookings
4. **Payout Schedule** - Show lenders when they'll receive funds
5. **Multi-currency** - Support multiple currencies based on location
6. **Subscription Plans** - Add premium lender subscriptions

## Support Resources

- Stripe Documentation: https://stripe.com/docs
- Stripe Connect: https://stripe.com/docs/connect
- Test Cards: https://stripe.com/docs/testing
- Stripe Support: https://support.stripe.com

## Platform Fees

Current configuration:

- **Application Fee**: 10% of transaction
- **Stripe Processing Fee**: ~2.9% + $0.30 (deducted from lender's amount)

To change the platform fee, edit `create-checkout-session/route.ts`:

```typescript
application_fee_amount: Math.round(totalAmount * 0.15), // Change to 15%
```

---

**Note**: This integration is configured in test mode. Before going live:

1. Switch to live mode API keys
2. Complete Stripe account verification
3. Set up webhooks for production URL
4. Review and accept Stripe Connect agreement
5. Test thoroughly with real bank accounts (in test mode)
