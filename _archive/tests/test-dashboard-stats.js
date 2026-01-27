/**
 * Test Dashboard Stats with Portfolio PnL Data
 * This script tests the updated dashboard stats endpoint
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testDashboardStats() {
  console.log('\n🧪 Testing Dashboard Stats Endpoint\n');
  console.log('=' .repeat(60));

  try {
    // First, login to get auth token
    console.log('\n1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@smartalgos.com',
      password: 'Admin@123'
    });

    if (!loginResponse.data.success) {
      console.error('❌ Login failed');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Get dashboard stats
    console.log('\n2️⃣ Fetching dashboard stats...');
    const statsResponse = await axios.get(`${API_URL}/api/users/dashboard-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!statsResponse.data.success) {
      console.error('❌ Failed to fetch dashboard stats');
      return;
    }

    const stats = statsResponse.data.data;
    console.log('✅ Dashboard stats retrieved successfully\n');

    // Display stats
    console.log('📊 Dashboard Statistics:');
    console.log('=' .repeat(60));
    console.log(`Portfolio Value:      $${stats.portfolioValue.toFixed(2)}`);
    console.log(`Today's P&L:          $${stats.todayPnL.toFixed(2)}`);
    console.log(`Today's P&L %:        ${stats.todayPnLPercent.toFixed(2)}%`);
    console.log(`Active Signals:       ${stats.activeSignals}`);
    console.log(`Win Rate:             ${stats.winRate.toFixed(2)}%`);
    console.log(`Total Trades:         ${stats.totalTrades}`);
    console.log(`Active Subscriptions: ${stats.activeSubscriptions}`);
    console.log(`Updated At:           ${new Date(stats.updatedAt).toLocaleString()}`);
    console.log('=' .repeat(60));

    // Check if portfolio value is from uploaded data
    if (stats.portfolioValue > 0) {
      console.log('\n✅ SUCCESS: Portfolio value is showing uploaded data!');
      console.log(`   Your $843 upload should be reflected in the cumulative PnL`);
    } else {
      console.log('\n⚠️  WARNING: Portfolio value is still $0');
      console.log('   This means either:');
      console.log('   - No CSV data has been uploaded yet');
      console.log('   - The portfolio_pnl table is empty');
      console.log('   - Cumulative PnL calculation needs to be run');
    }

    // Get PnL data to verify
    console.log('\n3️⃣ Checking portfolio_pnl data...');
    const pnlResponse = await axios.get(`${API_URL}/api/portfolio/pnl`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (pnlResponse.data.success && pnlResponse.data.data) {
      const pnlEntries = pnlResponse.data.data;
      console.log(`✅ Found ${pnlEntries.length} PnL entries in database`);
      
      if (pnlEntries.length > 0) {
        const totalPnL = pnlEntries.reduce((sum, entry) => sum + entry.pnl, 0);
        console.log(`   Total PnL from entries: $${totalPnL.toFixed(2)}`);
        console.log(`   Latest entry: ${pnlEntries[pnlEntries.length - 1].date} - $${pnlEntries[pnlEntries.length - 1].pnl}`);
      }
    } else {
      console.log('⚠️  No PnL data found in database');
    }

    console.log('\n✅ Test completed successfully!');
    console.log('\n💡 Next Steps:');
    console.log('   1. If portfolio value is $0, upload a CSV file via Portfolio page');
    console.log('   2. Refresh the Dashboard page to see updated stats');
    console.log('   3. Check that cumulative_pnl is calculated in portfolio_pnl table');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run test
testDashboardStats();
