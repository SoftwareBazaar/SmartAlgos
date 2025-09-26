# 🚀 Algosmart Platform - Startup Instructions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account with database setup

## Step 1: Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration (Supabase) - REQUIRED
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Configuration - REQUIRED
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=7d

# Payment Gateway Configuration (Optional for testing)
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Market Data API Keys (Optional - will use mock data if not provided)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

# Client Configuration
CLIENT_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Step 2: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

## Step 3: Start the Application

### Option A: Start Both Services Together (Recommended)

```bash
# Start both backend and frontend
npm run dev-all
```

If the above command doesn't exist, use Option B:

### Option B: Start Services Separately

#### Terminal 1 - Backend Server
```bash
npm run dev
# or
npm start
```

#### Terminal 2 - Frontend React App
```bash
cd client
npm start
```

## Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **WebSocket**: ws://localhost:5000

## Step 5: Test the Setup

1. **Health Check**: Visit http://localhost:5000/api/health
2. **Frontend**: Visit http://localhost:3000
3. **Registration**: Try creating a new account at http://localhost:3000/auth/register

## Troubleshooting

### Common Issues:

#### 1. Database Connection Issues
```
Error: SUPABASE_URL environment variable is required
```
**Solution**: Make sure your `.env` file has the correct Supabase credentials.

#### 2. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: 
- Kill the process using port 5000: `lsof -ti:5000 | xargs kill -9`
- Or change PORT in `.env` file

#### 3. Frontend Won't Start
```
Error: Cannot find module 'react-scripts'
```
**Solution**: 
```bash
cd client
npm install
```

#### 4. CORS Issues
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Make sure `CLIENT_URL` in `.env` matches your frontend URL.

## Development Mode Features

When running in development mode, the following features are available:

- **Hot Reload**: Both frontend and backend auto-restart on changes
- **Mock Data**: Market data uses mock values if API keys aren't provided
- **Debug Logging**: Enhanced logging for troubleshooting
- **Development Authentication**: Simplified auth for testing

## Production Deployment

For production deployment, see:
- `README.md` for detailed deployment instructions
- `vercel.json` for Vercel deployment configuration

## API Endpoints

Once running, these endpoints are available:

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/eas` - Expert Advisors
- `GET /api/signals` - Trading signals
- `GET /api/markets/overview` - Market overview
- `GET /api/news` - Financial news
- `GET /api/analysis/portfolio` - Portfolio analysis

## WebSocket Events

Connect to `ws://localhost:5000` and subscribe to:

- `subscribe_market_data` - Real-time price updates
- `subscribe_signals` - Trading signal alerts
- `subscribe_portfolio` - Portfolio updates
- `subscribe_news` - News alerts

## Need Help?

1. Check the console logs for error messages
2. Verify all required environment variables are set
3. Make sure Supabase database is accessible
4. Check that ports 3000 and 5000 are available

## Quick Test Commands

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test authentication endpoint
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'
```

---

🎉 **Your Algosmart platform should now be running successfully!**
