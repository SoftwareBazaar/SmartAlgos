# 🧪 How to Test and Debug Custom EA Submission

## ✅ What I Just Did

Added debug logging to help us see EXACTLY what's causing the 400 error.

---

## 🔍 How to Check Railway Logs

### **Step 1: Open Railway Dashboard**

1. Go to: https://railway.app/
2. Login with your account
3. Click on **"Smartalgos"** project
4. Click on your **service** (the one running the app)

### **Step 2: View Logs**

1. Click **"Logs"** tab in the top menu
2. You should see real-time logs streaming

### **Step 3: Submit a Request**

1. Go to: `https://web-production-fdb58.up.railway.app/custom-ea`
2. Fill out the form
3. Click **"Submit Request"**

### **Step 4: Watch the Logs**

In Railway logs, you should see:

**If validation fails:**
```
📥 Custom EA request received: { body: {...}, userId: '...' }
❌ Validation errors: [...]
```

**If it succeeds:**
```
📥 Custom EA request received: { body: {...}, userId: '...' }
✅ Email notification sent for custom EA request: req_xxx
```

---

## 🎯 What to Look For

### **In Railway Logs:**

1. **The incoming body data** - what fields are being sent?
2. **Validation errors** - which fields are failing and why?
3. **Email status** - did email send or fail?

### **Common Issues:**

1. **Empty string values** - fields showing as `""` instead of `null` or undefined
2. **Wrong field names** - frontend sending different names than expected
3. **Wrong field values** - values not matching allowed options

---

## 🐛 Expected Debug Output

### **Example Good Submission:**
```
📥 Custom EA request received: {
  body: {
    serviceType: 'new_ea',
    eaName: 'My Test EA',
    tradingStyle: 'scalping',
    platform: 'mt5',
    indicators: ['RSI', 'MACD'],
    estimatedPrice: 750,
    ...
  },
  userId: 'user_12345'
}
✅ Email notification sent for custom EA request: req_1634567890_abc123
```

### **Example Bad Submission (if validation fails):**
```
📥 Custom EA request received: {
  body: {
    serviceType: '',  ← EMPTY STRING
    eaName: '',
    tradingStyle: '',
    platform: '',
    ...
  },
  userId: 'user_12345'
}
❌ Validation errors: [
  { msg: 'Invalid service type', param: 'serviceType', value: '' },
  { msg: 'EA name must be between 3 and 100 characters', param: 'eaName', value: '' },
  ...
]
```

---

## 🎯 Next Steps Based on What We See

### **If we see empty strings:**

Problem: Frontend sending empty strings instead of omitting fields

**Fix:** Update frontend to not send empty fields, or make validation truly skip them

### **If we see wrong values:**

Problem: Values don't match allowed options

**Fix:** Update either frontend values or backend validation rules

### **If we see no log at all:**

Problem: Request not reaching the endpoint

**Fix:** Check auth middleware, check route registration

---

## 📋 Testing Checklist

- [ ] Railway deployment completed
- [ ] Railway logs tab open
- [ ] Submit a Custom EA request
- [ ] See log output with request details
- [ ] Identify validation errors (if any)
- [ ] Share logs with me to fix

---

## 🚨 What to Share With Me

After you test, share:

1. **The log output** showing what was received
2. **Any validation errors**
3. **Whether email was sent or not**

Then I can:
- Fix the exact validation issue
- Update frontend to send correct data
- Or remove problematic validation

---

**Test now and share the Railway logs output!** 🔍

