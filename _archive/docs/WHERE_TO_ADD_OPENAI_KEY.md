# 📍 Where to Copy Your OpenAI API Key

## 🖥️ **Option 1: Local Development (`.env` file)**

### Step-by-Step:

1. **Open your `.env` file** in the project root folder
   - It's in: `C:\Users\wanya\Desktop\My library  2\Algosmart\.env`

2. **Find this line** (around line 70):
   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Replace it with your actual key**:
   ```env
   OPENAI_API_KEY=sk-proj-abc123xyz456789...
   ```
   *(Paste your full key from OpenAI - it starts with `sk-`)*

4. **Save the file** (Ctrl+S)

5. **Restart your server**:
   ```bash
   npm start
   ```

---

## ☁️ **Option 2: Railway (Production)**

### Step-by-Step:

1. **Go to Railway Dashboard**: https://railway.app/

2. **Select your project** (click on "Smartalgos" or your project name)

3. **Click "Variables"** tab (in the left sidebar)

4. **Click "+ New Variable"** button

5. **Fill in**:
   - **Variable**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-abc123xyz456789...` (your actual key)

6. **Click "Add"**

7. **Railway will automatically redeploy** (takes 2-3 minutes)

---

## ✅ **Verify It's Working**

### Check Server Logs:

When you start the server, you should see:
```
✅ Good:
[AI Assistant] OpenAI API connected successfully
[AI Signal Service] OpenAI API ready

❌ If you see this, key is missing:
[AI Assistant] Running in mock mode. Add OPENAI_API_KEY to enable AI responses.
```

### Test in Browser:

1. Go to **News page** in your app
2. Click the **chat bubble** (bottom-right corner)
3. Ask: **"Why is GBP weak today?"**
4. If you get a real AI response → ✅ **It's working!**

---

## 🔑 **How to Get Your API Key**

1. Go to: https://platform.openai.com/api-keys
2. Sign in (or create free account)
3. Click **"Create new secret key"**
4. Name it (e.g., "Smart Algos")
5. **Copy immediately** (you can't see it again!)

---

## ⚠️ **Important Notes**

- ✅ **Never commit** `.env` to Git (already in `.gitignore`)
- ✅ **Keep your key secret** - don't share it
- ✅ **Free tier works** - no paid subscription needed
- ✅ **App works without it** - uses smart mocks if key missing

---

## 🆘 **Troubleshooting**

**"Key not working":**
- Make sure it starts with `sk-`
- No extra spaces before/after the key
- Restart server after adding to `.env`

**"Rate limit error":**
- Free tier: 3 requests/minute
- Wait 20 seconds between requests
- Or upgrade to paid tier

---

That's it! Once added, your AI features will use real OpenAI! 🚀

