# 🚀 MT5 Real Integration Setup Guide

## ✅ **What's Now Available**

Your app now has **REAL MetaTrader 5 integration** with:

- ✅ **Live Server Connections** - Connect to actual MT5 brokers
- ✅ **Account Information** - Get real balance, equity, margin
- ✅ **Position Management** - View and close open positions
- ✅ **Trade Execution** - Place BUY/SELL orders
- ✅ **Market Data** - Get real-time bid/ask prices
- ✅ **Order History** - View past trades and deals

---

## 📋 **Prerequisites**

### **1. Install Python**
- Download from: https://www.python.org/downloads/
- Install Python 3.8 or higher
- ✅ Check "Add Python to PATH" during installation

### **2. Install MetaTrader5 Python Package**

Open terminal/command prompt and run:

```bash
pip install MetaTrader5
```

**Verify installation:**
```bash
python -c "import MetaTrader5; print('MT5 package installed!')"
```

### **3. Install MetaTrader 5 Desktop**

The Python package requires MT5 to be installed on the server:

- **Windows**: Download from broker or https://www.metatrader5.com/
- **Linux**: Use Wine or MT5 for Linux (if available)
- **Note**: For production, you may need MT5 running on a VPS

---

## 🔧 **How It Works**

### **Architecture:**

```
Node.js Backend → Python Scripts → MetaTrader5 Python API → MT5 Broker Servers
```

1. **Your Node.js app** calls `mt5APIService`
2. **Service executes Python scripts** that use MetaTrader5 package
3. **Python connects** to MT5 broker servers
4. **Real data returned** to Node.js

---

## 🎯 **New API Endpoints**

### **1. Connect to MT5**
```bash
POST /api/mt5/connect
{
  "login": "12345678",
  "password": "your_password",
  "server": "Broker-Demo"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connectionKey": "12345678@Broker-Demo",
    "account": {
      "balance": 10000.00,
      "equity": 10050.00,
      "margin": 0.00,
      "currency": "USD",
      "leverage": 100
    }
  }
}
```

### **2. Get Account Balance**
```bash
GET /api/mt5/balance/{connectionKey}
```

### **3. Get Open Positions**
```bash
GET /api/mt5/positions/{connectionKey}?symbol=EURUSD
```

### **4. Place Order**
```bash
POST /api/mt5/order
{
  "connectionKey": "12345678@Broker-Demo",
  "symbol": "EURUSD",
  "action": "BUY",
  "volume": 0.1,
  "sl": 1.0800,
  "tp": 1.0900
}
```

### **5. Close Position**
```bash
DELETE /api/mt5/position/{connectionKey}/{ticket}
```

### **6. Get Market Price**
```bash
GET /api/mt5/market-price/{connectionKey}/EURUSD
```

---

## 🧪 **Testing**

### **Step 1: Install Requirements**
```bash
pip install MetaTrader5
```

### **Step 2: Test Connection**
```bash
# Use Postman or curl
curl -X POST http://localhost:5000/api/mt5/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "login": "12345678",
    "password": "demo_password",
    "server": "YourBroker-Demo"
  }'
```

### **Step 3: Get Account Info**
```bash
curl -X GET http://localhost:5000/api/mt5/account/{connectionKey} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ **Important Notes**

### **Security:**
- ✅ Passwords are encrypted before storing
- ✅ Connections are per-user (auth required)
- ⚠️ **Never expose API keys or credentials**
- ⚠️ Use HTTPS in production

### **Limitations:**
- **MT5 Desktop Required**: Python package needs MT5 installed
- **Server Setup**: For production, MT5 must run on server/VPS
- **One Connection Per Server**: Each MT5 instance handles one login at a time
- **Rate Limits**: Respect broker API rate limits

### **Production Deployment:**
1. **Install MT5 on Railway/Server**
   - Windows: Direct install
   - Linux: Use Wine or container with MT5

2. **Install Python MT5 Package**:
   ```bash
   pip install MetaTrader5
   ```

3. **Set Environment Variables** (if needed):
   ```
   MT5_PATH=/path/to/mt5/terminal64.exe  # Optional
   ```

---

## 🐛 **Troubleshooting**

### **"Python script failed"**
- ✅ Check Python is installed: `python --version`
- ✅ Check MT5 package: `python -c "import MetaTrader5"`
- ✅ Check MT5 is installed on server

### **"Authorization failed"**
- ✅ Verify login/password correct
- ✅ Check server name matches exactly
- ✅ Ensure account is not blocked
- ✅ Try demo account first

### **"Symbol not found"**
- ✅ Symbol must be available on your broker
- ✅ Some brokers require enabling symbols first
- ✅ Check symbol name matches broker format (e.g., "EURUSD" vs "EURUSD.")

---

## 📊 **Example Frontend Usage**

```javascript
// Connect to MT5
const response = await apiClient.post('/api/mt5/connect', {
  login: '12345678',
  password: 'password',
  server: 'Broker-Demo'
});

const connectionKey = response.data.data.connectionKey;

// Get balance
const balance = await apiClient.get(`/api/mt5/balance/${connectionKey}`);

// Place order
const order = await apiClient.post('/api/mt5/order', {
  connectionKey,
  symbol: 'EURUSD',
  action: 'BUY',
  volume: 0.1
});

// Get positions
const positions = await apiClient.get(`/api/mt5/positions/${connectionKey}`);
```

---

## 🎉 **You Now Have Real MT5 Integration!**

Your app can now:
- ✅ Connect to live MT5 brokers
- ✅ Execute real trades
- ✅ Get account data
- ✅ Manage positions
- ✅ Fetch market prices

**No more mock data!** 🚀

