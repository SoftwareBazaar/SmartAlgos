const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Initialize Supabase
const supabaseUrl = 'https://ncikobfahncdgwvkfivz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaWtvYmZhaG5jZGd3dmtmaXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDY2NDQsImV4cCI6MjA3Mjk4MjY0NH0.TKIwIpXr9c92Xi0AgoioeC2db3tonPtM1wHHMo5-7mk';
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Simple test route works!' });
});

// Simple login route
app.post('/test-login', async (req, res) => {
  try {
    console.log('🔍 Test login attempt:', req.body.email);
    
    const { email, password } = req.body;
    
    // Get user from Supabase
    console.log('📡 Querying Supabase...');
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.log('❌ Supabase error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ error: 'User not found' });
    }
    
    console.log('✅ User found:', user.email);
    
    // Check password
    console.log('🔐 Checking password...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    console.log('✅ Password valid');
    
    // Generate token
    console.log('🎫 Generating token...');
    const token = jwt.sign(
      { userId: user.id },
      'smart-algos-super-secret-jwt-key-2024',
      { expiresIn: '7d' }
    );
    
    console.log('✅ Token generated');
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('💥 Test login error:', error);
    res.status(500).json({ error: 'Server error', details: error.message, stack: error.stack });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`);
  console.log('📋 Available routes:');
  console.log('   GET  /test');
  console.log('   POST /test-login');
});

module.exports = app;
