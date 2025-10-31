# 🤖 OpenAI API Setup Guide (Free Tier)

## ✅ Yes, You Can Use Your Free OpenAI Account!

You **don't need a paid subscription**. OpenAI's free tier works perfectly for this app!

---

## 📋 Step-by-Step Setup

### **Step 1: Get Your Free OpenAI API Key**

1. **Go to OpenAI**: https://platform.openai.com/
2. **Sign up or Log in** (use your existing account)
3. **Go to API Keys**: https://platform.openai.com/api-keys
4. **Click "Create new secret key"**
5. **Name it** (e.g., "Smart Algos Trading")
6. **Copy the key immediately** (you can't see it again!)

   Example format: `sk-...`

---

### **Step 2: Add to Railway (Production)**

1. **Go to Railway Dashboard**: https://railway.app/
2. **Select your project** → **Variables** tab
3. **Click "+ New Variable"**
4. **Add**:
   ```
   Variable Name: OPENAI_API_KEY
   Variable Value: sk-your-actual-key-here
   ```
5. **Click "Add"**
6. **Redeploy** (Railway auto-deploys when variables change)

---

### **Step 3: Add to Local `.env` (Development)**

1. **Open `.env` file** in your project root
2. **Find or add**:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. **Save the file**
4. **Restart your server**:
   ```bash
   npm start
   ```

---

## 💰 Free Tier Limits & Pricing

### **Free Tier Credits:**
- **New accounts**: Usually $5-18 in free credits
- **Expires after 3 months** (if not used)

### **Usage Costs (Very Affordable):**
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens (~750 words)
- **Our app uses ~300 tokens per news summary**
- **Cost per summary**: ~$0.0006 (less than 0.001 cents!)

### **Free Tier Limits:**
- **No daily limit** - you can make unlimited requests
- **Rate limit**: 3 requests/minute (Tier 1)
- **Our app**: Uses GPT-3.5-turbo which is very affordable

---

## 🎯 What Gets Enabled

Once you add your OpenAI API key, these features will use **real AI**:

### ✅ **Enabled Features:**
1. **AI Chat Assistant** (bottom-right on News page)
   - Real-time answers to trading questions
   - "Why is GBP weak today?"
   - "Explain today's Fed decision"

2. **AI News Summaries** (when clicking "View Analysis" on news)
   - AI-generated summaries of news articles
   - Market impact explanations
   - Sentiment analysis

3. **AI Sentiment Indicators** (on news cards)
   - AI-powered sentiment detection
   - Confidence scores
   - "Why this matters" explanations

### ⚠️ **Without API Key:**
- App still works perfectly!
- Uses smart mock/rule-based responses
- Still shows sentiment and summaries
- Just not as sophisticated as real AI

---

## 🧪 Test It's Working

### **Method 1: Check Server Logs**
When you start the server, look for:
```
✅ Good (AI enabled):
[AI Assistant] OpenAI API connected successfully

❌ Warning (Mock mode):
[AI Assistant] Running in mock mode. Add OPENAI_API_KEY to enable AI responses.
```

### **Method 2: Test AI Chat**
1. Go to **News page**
2. Click the **chat bubble** (bottom-right)
3. Ask: **"Why is GBP weak today?"**
4. **With API key**: Real AI response
5. **Without API key**: Helpful mock response

---

## 💡 Tips to Minimize Costs

1. **Use GPT-3.5-turbo** (not GPT-4) - Already configured ✅
2. **Cache responses** - Same news = same summary (we do this)
3. **Limit summaries** - Only generate when user clicks "View Analysis"
4. **Rate limiting** - Free tier has 3 req/min, app respects this

### **Estimated Monthly Costs:**

| Usage Level | Requests/Day | Monthly Cost |
|------------|--------------|--------------|
| Light | 50 | ~$0.09 |
| Moderate | 200 | ~$0.36 |
| Heavy | 500 | ~$0.90 |

**Even with heavy usage, you're looking at < $1/month!**

---

## 🔒 Security Best Practices

1. ✅ **Never commit API key to Git** (already in `.gitignore`)
2. ✅ **Use environment variables** (not hardcoded)
3. ✅ **Rotate keys** if exposed
4. ✅ **Monitor usage** in OpenAI dashboard

---

## 🆘 Troubleshooting

### **"Invalid API key" Error**
- Check key starts with `sk-`
- Verify no extra spaces
- Make sure it's the latest key from dashboard

### **"Rate limit exceeded"**
- Free tier: 3 requests/minute
- Wait 20 seconds between requests
- Or upgrade to paid tier for higher limits

### **"Insufficient credits"**
- Go to https://platform.openai.com/account/billing
- Add payment method (pay-as-you-go)
- Or wait for free credits to reset

---

## ✅ Quick Checklist

- [ ] Created OpenAI account
- [ ] Generated API key
- [ ] Added to Railway (production)
- [ ] Added to `.env` (development)
- [ ] Restarted server
- [ ] Tested AI chat assistant
- [ ] Verified in server logs

---

## 🎉 That's It!

Your free OpenAI account will work perfectly. The app automatically:
- Uses real AI when key is present
- Falls back to smart mocks if key is missing
- Handles errors gracefully
- Caches responses to save costs

**No paid subscription needed!** 🚀

