# Quick Test Guide - Stripe Integration

## Prerequisites
✅ Stripe SDK installed
✅ Environment variables set in `.env.local`
✅ Database migration run (add `stripe_account_id` column)
✅ Dev server running

## Testing Steps

### Step 1: Run the Database Migration

Open your Supabase SQL editor or PostgreSQL client and run:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id ON users(stripe_account_id);
```

### Step 2: Start the Development Server

```powershell
cd frontend
npm run dev
```

Open http://localhost:3000

### Step 3: Test Stripe Connect (Lender Setup)

1. **Login to your account** (or create one)
2. **Navigate to Profile**: Click on your profile or go to `/profile`
3. **Find "Payment Account (Stripe)" card**
4. **Click "Connect Stripe Account"** button
5. **Stripe Onboarding opens in new tab**
   - Use test data (this is test mode)
   - Country: United States
   - Email: Any email (e.g., test@example.com)
   - Phone: Any (e.g., 555-555-5555)
   - Business details: Can skip or fill with test data
6. **Complete onboarding**
7. **Return to TradeBridge** - Should see "Stripe Account Connected" ✓

### Step 4: Test QR Payment Flow

#### Option A: Using QR Code (Recommended)

1. **Create or view a product** (as the lender from Step 3)
2. **Click the Share button** on the product
3. **Download the QR Code** from the share dialog
4. **Scan QR with your phone** (or use online QR reader)
   - Should redirect to: `http://localhost:3000/pay/qr?productId=X&days=1`
5. **Automatically redirects to Stripe Checkout**
6. **Enter test card details**:
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP: 12345
   ```
7. **Click "Pay"**
8. **Redirected to success page** ✓

#### Option B: Manual URL Test

Open this URL directly (replace `1` with actual product ID):
```
http://localhost:3000/pay/qr?productId=1&days=3
```

Should auto-redirect to Stripe Checkout.

### Step 5: Verify Payment in Stripe Dashboard

1. Open [Stripe Test Dashboard](https://dashboard.stripe.com/test/payments)
2. You should see the payment
3. Check **Connect → Accounts** to see the connected lender account
4. Verify payment split:
   - Platform fee: 10%
   - Transfer to connected account: 90%

## Test Scenarios

### Scenario 1: Seller Without Stripe Account
1. View a product from a seller who hasn't connected Stripe
2. Try to scan QR or go to `/pay/qr?productId=X`
3. Should see error: "This seller hasn't connected their Stripe account yet"

### Scenario 2: Different Rental Duration
Test with different day counts:
```
/pay/qr?productId=1&days=1   → 1 day rental
/pay/qr?productId=1&days=7   → 7 days rental
/pay/qr?productId=1&days=30  → 30 days rental
```

Price should multiply correctly.

### Scenario 3: Payment Cancellation
1. Start payment flow
2. On Stripe Checkout, click back arrow or cancel
3. Should redirect to `/payments/cancel` page
4. Can try again

### Scenario 4: Failed Payment
Use decline test card:
```
Card: 4000 0000 0000 0002
```
Should show payment declined error.

## Verification Checklist

- [ ] Stripe SDK installed (`node_modules/stripe` exists)
- [ ] Environment variables set (check `.env.local`)
- [ ] Database column added (`stripe_account_id` in `users` table)
- [ ] Dev server running without errors
- [ ] Can login to application
- [ ] Profile page shows Stripe Connect card
- [ ] Can click "Connect Stripe Account"
- [ ] Stripe onboarding opens successfully
- [ ] After onboarding, status shows "Connected"
- [ ] Product share dialog shows QR code
- [ ] QR code contains `/pay/qr?productId=X` URL
- [ ] Scanning QR redirects to payment page
- [ ] Payment page redirects to Stripe Checkout
- [ ] Can complete test payment
- [ ] Success page shows after payment
- [ ] Payment appears in Stripe Dashboard

## Common Issues & Solutions

### Issue: "Cannot find module 'stripe'"
**Solution**: Run `npm install stripe` in frontend directory

### Issue: "stripe_account_id column doesn't exist"
**Solution**: Run the database migration SQL

### Issue: "STRIPE_SECRET_KEY is not defined"
**Solution**: Check `.env.local` file has the correct variables

### Issue: Stripe onboarding doesn't open
**Solution**: 
- Check browser popup blocker
- Try opening in incognito/private mode
- Check console for errors

### Issue: QR code shows old URL (products page)
**Solution**: 
- Hard refresh the page (Ctrl+F5)
- Clear browser cache
- Check `social-sharing.tsx` was updated correctly

### Issue: Payment fails with "Invalid API key"
**Solution**:
- Verify you're using the test secret key (starts with `sk_test_`)
- Check no extra spaces in `.env.local`
- Restart dev server after changing env vars

## Next Steps After Testing

Once everything works:

1. **Test with real scenarios**:
   - Multiple products
   - Different prices
   - Different rental durations

2. **Test edge cases**:
   - Very high prices
   - Very long rental periods
   - Multiple simultaneous payments

3. **Consider adding**:
   - Webhook handler for payment confirmation
   - Email notifications on successful payment
   - Payment history in dashboard
   - Refund functionality

4. **Before going live**:
   - Switch to live Stripe keys
   - Set production `NEXT_PUBLIC_ORIGIN`
   - Complete Stripe Connect agreement
   - Set up webhook endpoint in Stripe Dashboard
   - Test with real bank accounts (small amounts)

## Support

- Stripe Docs: https://stripe.com/docs
- Test Cards: https://stripe.com/docs/testing
- Dashboard: https://dashboard.stripe.com/test

---

**Last Updated**: November 9, 2025
**Test Keys Configured**: ✅
**Ready for Testing**: ✅
