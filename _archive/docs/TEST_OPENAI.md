# 🧪 Test Your OpenAI API Key

## ✅ **Quick Test Steps:**

### 1. **Restart Your Server** (if running)
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm start
```

### 2. **Check Server Logs**
When the server starts, look for one of these:

**✅ GOOD (Key is working):**
```
[AI Assistant] OpenAI API connected successfully
```

**⚠️ WARNING (Key missing/incorrect):**
```
[AI Assistant] Running in mock mode. Add OPENAI_API_KEY to enable AI responses.
```

### 3. **Test in the App**

1. **Go to News Page**: Navigate to `/news` in your app

2. **Click the Chat Bubble**: Look for the blue chat icon in the bottom-right corner

3. **Ask a Question**: Try asking:
   - "Why is GBP weak today?"
   - "Explain today's Fed decision"
   - "What news moved EUR/USD?"

4. **Check the Response**:
   - **With real AI**: You'll get detailed, contextual answers
   - **With mock mode**: You'll get generic helpful responses

### 4. **Test News Summary**
1. Click on any news article card
2. Look for "AI Sentiment Indicator" at the top
3. Check if it shows detailed analysis with confidence scores

---

## 🔍 **Verify Key Format**

Your key should:
- ✅ Start with `sk-`
- ✅ Be about 51+ characters long
- ✅ Have no spaces before/after
- ✅ Look like: `sk-proj-abc123xyz456...`

---

## 🆘 **If It's Not Working**

### **Check 1: Key Format**
Make sure in `.env` it looks like:
```env
OPENAI_API_KEY=sk-proj-abc123xyz456...
```
NOT:
```env
OPENAI_API_KEY = sk-proj...  (no spaces!)
OPENAI_API_KEY="sk-proj..."  (no quotes needed)
```

### **Check 2: Server Restart**
You **must restart** the server after adding the key:
1. Stop server (Ctrl+C in terminal)
2. Run `npm start` again

### **Check 3: Railway (Production)**
If deploying to Railway:
1. Go to Railway Dashboard
2. Check Variables tab
3. Make sure `OPENAI_API_KEY` is there
4. Click "Redeploy" if needed

---

## ✅ **Success Indicators**

You'll know it's working when:
1. ✅ Server logs show "OpenAI API connected"
2. ✅ AI chat gives detailed, intelligent responses
3. ✅ News summaries have AI-generated content
4. ✅ Sentiment indicators show confidence scores

---

**Ready to test? Restart your server and try the chat!** 🚀

