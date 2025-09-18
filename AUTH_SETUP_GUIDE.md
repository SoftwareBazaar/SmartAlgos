# Smart Algos Authentication Setup Guide

This guide will help you set up and test the authentication system for both Admin and User access.

## 🚀 Quick Setup

### 1. Environment Setup

First, make sure you have a `.env` file in your project root with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
SUPABASE_URL=https://ncikobfahncdgwvkfivz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaWtvYmZhaG5jZGd3dmtmaXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDY2NDQsImV4cCI6MjA3Mjk4MjY0NH0.TKIwIpXr9c92Xi0AgoioeC2db3tonPtM1wHHMo5-7mk

# JWT Configuration
JWT_SECRET=smart-algos-super-secret-jwt-key-2024-development-only-change-in-production
JWT_EXPIRE=7d

# Client URL for CORS
CLIENT_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Authentication System

Run the setup script to create initial admin and test users:

**Windows:**
```bash
setup-auth.bat
```

**Linux/Mac:**
```bash
chmod +x setup-auth.sh
./setup-auth.sh
```

**Or manually:**
```bash
node setup-auth.js
```

### 4. Start the Server

```bash
npm run dev
```

## 🔐 Login Credentials

After running the setup, you can use these credentials:

### Admin Access
- **Email:** `admin@smartalgos.com`
- **Password:** `Admin123!@#`
- **Access:** Admin Dashboard, User Management, EA Management

### Test User Access
- **Email:** `test@smartalgos.com`
- **Password:** `Test123!@#`
- **Access:** User Dashboard, Trading Features

## 🧪 Testing Authentication

### 1. Run Automated Tests

```bash
node test-auth.js
```

This will test:
- User registration
- User login
- Admin login
- Protected route access
- Token validation

### 2. Manual Testing

#### Test User Registration
1. Navigate to `http://localhost:3000/auth/register`
2. Fill out the registration form
3. Submit and verify successful registration

#### Test User Login
1. Navigate to `http://localhost:3000/auth/login`
2. Use test credentials: `test@smartalgos.com` / `Test123!@#`
3. Verify redirect to dashboard

#### Test Admin Login
1. Navigate to `http://localhost:3000/auth/admin-login`
2. Use admin credentials: `admin@smartalgos.com` / `Admin123!@#`
3. Verify redirect to admin dashboard

## 🛠️ API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|---------|
| `/api/auth/register` | POST | User registration | Public |
| `/api/auth/login` | POST | User login | Public |
| `/api/auth/admin/login` | POST | Admin login | Public |
| `/api/auth/me` | GET | Get current user | Private |
| `/api/auth/setup` | POST | Setup initial users | Development only |

### Example API Calls

#### User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "phone": "+254700000000",
    "country": "Kenya",
    "tradingExperience": "beginner",
    "terms": true
  }'
```

#### User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@smartalgos.com",
    "password": "Test123!@#"
  }'
```

#### Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartalgos.com",
    "password": "Admin123!@#"
  }'
```

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Account Protection
- Account lockout after 5 failed login attempts
- 2-hour lockout period
- JWT token expiration (7 days)
- Rate limiting on authentication endpoints

### Role-Based Access
- **Admin:** Full system access, user management, EA management
- **User:** Trading features, portfolio management, subscriptions

## 🚨 Troubleshooting

### Common Issues

#### 1. "Database connection failed"
- Check your `.env` file has correct Supabase credentials
- Verify your Supabase project is active
- Ensure database tables exist

#### 2. "JWT_SECRET not defined"
- Make sure `.env` file exists in project root
- Verify JWT_SECRET is set in environment variables

#### 3. "Admin login failed"
- Run `node setup-auth.js` to create admin user
- Check admin credentials are correct
- Verify user role is set to 'admin'

#### 4. "User registration failed"
- Check password meets requirements
- Verify email is not already registered
- Check server logs for detailed error messages

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=auth:*
```

## 📱 Frontend Integration

### React Components

The authentication system includes these React components:

- `Login.js` - User login form
- `AdminLogin.js` - Admin login form
- `Register.js` - User registration form
- `ProtectedRoute.js` - Route protection component

### Usage Example

```jsx
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  const { user, login, adminLogin, register } = useAuth();

  return (
    <Routes>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/admin-login" element={<AdminLogin />} />
      <Route path="/auth/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

## 🔄 Next Steps

1. **Change Default Passwords:** Update admin and test user passwords in production
2. **Email Verification:** Implement email verification for new registrations
3. **Password Reset:** Add password reset functionality
4. **Two-Factor Authentication:** Implement 2FA for enhanced security
5. **Audit Logging:** Add comprehensive audit logs for security events

## 📞 Support

If you encounter any issues:

1. Check the server logs for error messages
2. Run the test suite: `node test-auth.js`
3. Verify your environment configuration
4. Check the troubleshooting section above

---

**⚠️ Security Note:** Remember to change all default passwords and secrets before deploying to production!
