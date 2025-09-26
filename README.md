# Smart Algos Trading and Investment Solutions

A comprehensive algorithmic trading and investment platform that combines cutting-edge AI-powered market intelligence, expert advisors (EAs), high-frequency trading (HFT) bots, and global market analysis into a single, secure ecosystem.

## 🚀 Features

### Core Platform Modules

- **Algorithmic Trading Hub**
  - Forex EA Marketplace with subscription management
  - High-Frequency Trading (HFT) Solutions for Binance
  - Custom Algorithm Development Services
  - Performance Analytics and Backtesting

- **AI Trading Intelligence**
  - Multi-Asset Trading Signal Generation
  - Real-time Buy/Sell/Hold Recommendations
  - Confidence Scoring and Risk Assessment
  - Stock, Forex, Crypto, and Commodity Analysis

- **Global Market Center**
  - US Stock Market Integration (NYSE, NASDAQ, AMEX) via Alpha Vantage API
  - Kenyan Securities Exchange (NSE) Data Integration
  - Real-time Market Data and Quotes
  - Advanced Charting and Technical Analysis
  - Custom EA Creation with Advanced Preferences

- **Investment Research Suite**
  - Company Financial Analysis
  - Fundamental and Technical Analysis Tools
  - Market Trend Analysis
  - Economic Calendar Integration

- **Secure Transaction Layer**
  - Revolutionary Multisig Escrow System
  - Subscription Management
  - Custom Development Billing
  - Anti-Fraud Protection

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **Redis** for caching and session management
- **WebSocket** for real-time communication
- **JWT** for authentication
- **Paystack/Stripe** for payments
- **Socket.io** for real-time features

### Frontend
- **React 18** with modern hooks
- **Tailwind CSS** with institutional design system
- **Framer Motion** for animations
- **React Query** for data fetching
- **React Hook Form** for form management
- **Chart.js** for data visualization
- **Socket.io Client** for real-time updates
- **Lucide React** for consistent iconography

### Desktop Application
- **Electron** for cross-platform desktop app
- **Advanced Desktop Features** (notifications, system tray, shortcuts)
- **Auto-updater** for seamless updates
- **Native Integration** with operating system
- **Desktop Widgets** for quick access
- **Keyboard Shortcuts** for power users

### AI/ML
- **TensorFlow/PyTorch** for signal generation
- **Natural Language Processing** for news analysis
- **Machine Learning** models for pattern recognition

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Redis (v6 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/SoftwareBazaar/SmartAlgos.git
cd SmartAlgos
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/smart-algos
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Payment Gateway Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Market Data API Keys
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
IEX_CLOUD_API_KEY=your_iex_cloud_key
POLYGON_API_KEY=your_polygon_key
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Kenyan Market Data
NSE_API_KEY=your_nse_api_key
NSE_API_URL=https://api.nse.co.ke

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WebSocket Configuration
WS_PORT=5001

# AI/ML Configuration
OPENAI_API_KEY=your_openai_api_key
ML_MODEL_PATH=./models

# Escrow Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
ESCROW_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=your_ethereum_private_key
```

### 4. Start the Development Servers

```bash
# Start backend server
npm run dev

# In a new terminal, start frontend development server
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- WebSocket: ws://localhost:5000

## 📁 Project Structure

```
smart-algos-trading-platform/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, Theme, WebSocket)
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling
│   └── package.json
├── models/                # Database models
├── routes/                # API routes
├── middleware/            # Express middleware
├── websocket/             # WebSocket handlers
├── utils/                 # Utility functions
├── uploads/               # File uploads
├── server.js              # Main server file
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### EA Marketplace
- `GET /api/eas` - Get all EAs
- `GET /api/eas/:id` - Get single EA
- `POST /api/eas` - Create new EA
- `PUT /api/eas/:id` - Update EA
- `DELETE /api/eas/:id` - Delete EA
- `POST /api/eas/:id/subscribe` - Subscribe to EA

### HFT Bots
- `GET /api/hft` - Get all HFT bots
- `GET /api/hft/:id` - Get single HFT bot
- `POST /api/hft` - Create new HFT bot
- `POST /api/hft/:id/subscribe` - Subscribe to HFT bot

### Trading Signals
- `GET /api/signals` - Get trading signals
- `POST /api/signals` - Create new signal
- `POST /api/signals/:id/execute` - Execute signal
- `POST /api/signals/:id/close` - Close signal

### Market Data
- `GET /api/markets/overview` - Market overview
- `GET /api/markets/stocks` - Stock data
- `GET /api/markets/forex` - Forex data
- `GET /api/markets/crypto` - Crypto data
- `GET /api/markets/quote/:symbol` - Real-time quote

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/portfolio` - Get portfolio
- `GET /api/users/activity` - Get activity log

### Subscriptions & Payments
- `GET /api/subscriptions/plans` - Get subscription plans
- `POST /api/subscriptions/upgrade` - Upgrade subscription
- `GET /api/payments/methods` - Get payment methods
- `POST /api/payments/create-intent` - Create payment intent

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **CORS Protection** with configurable origins
- **Helmet.js** for security headers
- **Bcrypt** for password hashing
- **Account Lockout** after failed attempts
- **Multisig Escrow** for secure transactions

## 📊 Real-time Features

- **WebSocket Integration** for live updates
- **Market Data Streaming** for real-time quotes
- **Trading Signal Notifications** via WebSocket
- **Portfolio Updates** in real-time
- **EA Performance Monitoring** with live metrics
- **News Feed** with instant updates

## 🎨 UI/UX Features

- **Responsive Design** for all devices
- **Dark/Light Theme** support
- **Smooth Animations** with Framer Motion
- **Interactive Charts** with Chart.js
- **Real-time Notifications** with toast messages
- **Loading States** and error handling
- **Accessibility** features

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd client
npm run build

# Start production server
cd ..
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t smart-algos-platform .

# Run container
docker run -p 5000:5000 smart-algos-platform
```

### Environment Variables for Production

Ensure all production environment variables are set:
- Database connection strings
- API keys for market data
- Payment gateway credentials
- Email service configuration
- Security keys and secrets

## 📈 Performance Optimization

- **Redis Caching** for frequently accessed data
- **Database Indexing** for optimal query performance
- **Image Optimization** and lazy loading
- **Code Splitting** for faster initial load
- **CDN Integration** for static assets
- **WebSocket Connection Pooling**

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client
npm test

# Run e2e tests
npm run test:e2e
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, email support@smartalgos.com or join our Discord community.

## 🗺 Roadmap

- [ ] Mobile App (React Native)
- [ ] Advanced AI Models
- [ ] More Exchange Integrations
- [ ] Social Trading Features
- [ ] Educational Content Platform
- [ ] API for Third-party Integrations

## 🙏 Acknowledgments

- Market data providers (Alpha Vantage, IEX Cloud, Polygon)
- Payment processors (Paystack, Stripe)
- Open source libraries and frameworks
- Trading community feedback and contributions

---

**Smart Algos Trading Platform** - Revolutionizing algorithmic trading and investment solutions worldwide.

## Deployment (Vercel)

The repository includes a ercel.json configuration for a dual deployment (React static build + serverless API). To deploy:

1. Define production environment variables inside Vercel: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, JWT_SECRET, ENCRYPTION_KEY, PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, ESCROW_EMAIL, ESCROW_PASSWORD, ESCROW_API_KEY, and REACT_APP_API_URL.
2. Push the latest code to the branch connected to Vercel.
3. Vercel will run the React static build for client/ and expose the Express API via /api/* routes.
4. You can run ercel --prod locally to trigger a production deployment.

When running on Vercel the Express instance is exported without binding to a port, allowing the serverless runtime to handle requests.

