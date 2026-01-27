# 🔄 How to Restart Your Server

## Quick Steps:

### 1. Find Your Server Terminal
Look for the terminal window showing:
```
Server running on port 5000
Connected to Supabase
WebSocket server listening on port 5001
```

### 2. Stop the Server
Press: **Ctrl + C**

You'll see the server stop and return to the command prompt.

### 3. Start the Server Again
Type: **npm start**

Wait for:
```
Server running on port 5000
✅ All systems ready!
```

---

## ✅ After Restart:

1. **Refresh browser** (Ctrl+R or F5)
2. Go to **Admin Dashboard → Utilities**
3. **Edit** the Professional Lot Size Calculator
4. **Upload your image**
5. **Click "Update Utility"**
6. Should work now! ✨

---

## 🐛 If Server Won't Stop:

If Ctrl+C doesn't work:

**Windows:**
```powershell
taskkill /F /IM node.exe
npm start
```

**Or find the process:**
```powershell
Get-Process node | Stop-Process -Force
npm start
```

---

**The server MUST be restarted to load the authentication fix!**
