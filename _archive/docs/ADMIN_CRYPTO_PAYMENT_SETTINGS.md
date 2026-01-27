# Admin Crypto Payment Settings ✅

## Feature Overview

Admins can now configure the minimum crypto payment amount directly from the Admin Panel Settings page. This allows you to adjust the minimum payment amount based on network fees, business requirements, or market conditions.

## How to Change Minimum Crypto Payment

### Step 1: Access Admin Panel
1. Go to your site's admin panel: `/admin`
2. Log in with admin credentials

### Step 2: Navigate to Settings
1. Click on the **"Settings"** tab in the admin navigation
2. Scroll down to the **"Payment Settings"** card

### Step 3: Adjust Minimum Payment
1. Find the **"Minimum Crypto Payment (USD)"** field
2. Enter your desired minimum amount (e.g., `2.00`, `6.99`, `10.00`)
3. See real-time conversions to other currencies:
   - KES (Kenyan Shilling)
   - EUR (Euro)
   - GBP (British Pound)

### Step 4: Save Settings
1. Click the **"Save Settings"** button at the top
2. Settings are applied immediately
3. All new crypto payment requests will use the new minimum

## Default Settings

- **Default Minimum:** $2.00 USD
- **Supported Range:** $0.01 - $999,999.99
- **Network Fee Warning:** Enabled by default

## Currency Equivalents

The system automatically converts your USD minimum to other currencies:

| USD | KES (Approx) | EUR (Approx) | GBP (Approx) |
|-----|--------------|--------------|--------------|
| $2.00 | 298.51 KES | €1.82 | £1.57 |
| $5.00 | 746.27 KES | €4.55 | £3.94 |
| $10.00 | 1,492.54 KES | €9.09 | £7.87 |

## Payment Validation

When a user tries to make a crypto payment:

1. **Amount Check:** System converts their payment amount to USD
2. **Validation:** Compares against your set minimum
3. **Error Response:** If below minimum, shows:
   ```
   "Minimum payment amount is $2.00 USD (KES 298.51)"
   ```
4. **Success:** If above minimum, payment proceeds normally

## Example Use Cases

### Conservative Approach ($6.99+)
```
✅ Good for: High-value products, premium services
✅ Reduces: Small transactions, network fee issues
✅ Protects: Against frivolous payments
```

### Balanced Approach ($2.00-$5.00)
```
✅ Good for: Most subscription products
✅ Covers: Network fees for most crypto currencies
✅ Balances: Accessibility vs. practicality
```

### Liberal Approach ($0.01-$1.99)
```
⚠️ Warning: May not cover network fees
✅ Good for: Testing, promotional offers
⚠️ Risk: Users lose money on fees
```

## Network Fees Reference

Typical network fees for different cryptocurrencies:

| Cryptocurrency | Typical Fee | Recommended Minimum |
|----------------|-------------|---------------------|
| USDT (TRC20) | $1-2 | $2-3 |
| Bitcoin | $2-20+ | $10-20 |
| Ethereum | $5-50+ | $15-25 |
| USDC (ERC20) | $5-50+ | $15-25 |

## API Endpoint

The minimum payment setting is also available via API:

**GET** `/api/payments/crypto/settings`

```json
{
  "success": true,
  "data": {
    "minPaymentUSD": 2.00,
    "minimums": {
      "USD": "2.00",
      "EUR": "1.82",
      "GBP": "1.57",
      "KES": "298.51"
    },
    "supportedCurrencies": ["USD", "EUR", "GBP", "KES"],
    "supportedCrypto": ["usdt", "btc", "eth", "usdc"],
    "networkFeeWarning": true
  }
}
```

## Backend Validation

The minimum is enforced server-side in `routes/cryptoPayments.js`:

```javascript
// Get system settings for minimum payment validation
const settings = await getSystemSettings();
const minPaymentUSD = settings.minCryptoPaymentUSD || 2.00;

// Convert amount to USD to check minimum
const conversionRate = CURRENCY_TO_USD[currency] || 1;
const amountInUSD = amount * conversionRate;

// Validate minimum payment amount
if (amountInUSD < minPaymentUSD) {
  return res.status(400).json({
    success: false,
    message: `Minimum payment amount is $${minPaymentUSD} USD`
  });
}
```

## Settings Storage

Settings are stored in JSON format at:
```
data/settings.json
```

Default structure:
```json
{
  "siteName": "Smart Algos Trading Platform",
  "siteDescription": "Advanced algorithmic trading solutions",
  "minCryptoPaymentUSD": 2.00,
  "cryptoNetworkFeeWarning": true,
  ...
}
```

## Best Practices

### 1. Consider Network Fees
- Set minimum high enough to cover network fees
- USDT (TRC20) has lowest fees (~$1-2)
- ETH and ERC20 tokens have high fees (~$5-50+)

### 2. Monitor and Adjust
- Review crypto network fees monthly
- Adjust minimum based on market conditions
- Consider seasonal variations

### 3. Communicate to Users
- Display minimum clearly before payment
- Show network fee warnings
- Explain why minimum exists

### 4. Test After Changes
- Test with different currencies
- Verify error messages are clear
- Check conversion calculations

## Troubleshooting

### Users Can't Pay Even Above Minimum
**Issue:** Validation still failing
**Solution:** Check currency conversion rates in `CURRENCY_TO_USD` constant

### Settings Not Saving
**Issue:** Admin settings endpoint error
**Solution:** Check `data/settings.json` file permissions

### Wrong Currency Conversions
**Issue:** Incorrect exchange rates
**Solution:** Update `CURRENCY_TO_USD` rates in `routes/cryptoPayments.js`

## Support

For issues or questions:
1. Check Railway logs for validation errors
2. Review `data/settings.json` for current settings
3. Test with `/api/payments/crypto/settings` endpoint

---

**Last Updated:** October 2025
**Feature Status:** ✅ Production Ready
**Admin Access Required:** Yes

