/**
 * Update EAContext default EAs with sample images
 */

const fs = require('fs');
const path = require('path');

console.log('🖼️  Updating default EA images in EAContext...\n');

const filePath = path.join(__dirname, 'client/src/contexts/EAContext.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf-8');

// Update default EAs to use sample images
const updates = [
  {
    old: `id: 1, 
                name: 'Gold Scalper Pro v2.0', 
                status: 'active', 
                subscribers: 156, 
                revenue: '$4,680',
                description: 'Advanced scalping EA for gold trading with high win rate',
                version: '2.0',
                price: '$299',
                category: 'Scalping',
                tags: 'gold,scalping,mt4',
                image: null,`,
    new: `id: 1, 
                name: 'Gold Scalper Pro v2.0', 
                status: 'active', 
                subscribers: 156, 
                revenue: '$4,680',
                description: 'Advanced scalping EA for gold trading with high win rate',
                version: '2.0',
                price: '$299',
                category: 'Scalping',
                tags: 'gold,scalping,mt4',
                image: '/uploads/ea-images/gold-scalper.svg',`
  },
  {
    old: `id: 2, 
                name: 'Multi Indicator EA', 
                status: 'active', 
                subscribers: 89, 
                revenue: '$2,670',
                description: 'Multi-timeframe indicator-based EA for trend following',
                version: '1.5',
                price: '$199',
                category: 'Trend Following',
                tags: 'trend,indicators,multi-timeframe',
                image: null,`,
    new: `id: 2, 
                name: 'Multi Indicator EA', 
                status: 'active', 
                subscribers: 89, 
                revenue: '$2,670',
                description: 'Multi-timeframe indicator-based EA for trend following',
                version: '1.5',
                price: '$199',
                category: 'Trend Following',
                tags: 'trend,indicators,multi-timeframe',
                image: '/uploads/ea-images/multi-indicator.svg',`
  },
  {
    old: `id: 3, 
                name: 'Trend Master EA', 
                status: 'pending', 
                subscribers: 0, 
                revenue: '$0',
                description: 'Advanced trend analysis EA with machine learning',
                version: '1.0',
                price: '$399',
                category: 'Machine Learning',
                tags: 'trend,ml,advanced',
                image: null,`,
    new: `id: 3, 
                name: 'Trend Master EA', 
                status: 'pending', 
                subscribers: 0, 
                revenue: '$0',
                description: 'Advanced trend analysis EA with machine learning',
                version: '1.0',
                price: '$399',
                category: 'Machine Learning',
                tags: 'trend,ml,advanced',
                image: '/uploads/ea-images/trend-master.svg',`
  },
  {
    old: `id: 4, 
                name: 'Institutional Trading SCALPER', 
                status: 'active', 
                subscribers: 23, 
                revenue: '$11,500',
                description: 'Professional scalping EA designed for big institutions and hedge funds. Ultra-low latency execution with advanced risk management.',
                version: '3.0',
                price: '$2,999',
                category: 'Institutional',
                tags: 'institutional,hedge-funds,scalping,low-latency',
                image: null,`,
    new: `id: 4, 
                name: 'Institutional Trading SCALPER', 
                status: 'active', 
                subscribers: 23, 
                revenue: '$11,500',
                description: 'Professional scalping EA designed for big institutions and hedge funds. Ultra-low latency execution with advanced risk management.',
                version: '3.0',
                price: '$2,999',
                category: 'Institutional',
                tags: 'institutional,hedge-funds,scalping,low-latency',
                image: '/uploads/ea-images/institutional.svg',`
  }
];

let updateCount = 0;
updates.forEach((update, index) => {
  if (content.includes(update.old)) {
    content = content.replace(update.old, update.new);
    updateCount++;
    console.log(`   ✅ Updated EA ${index + 1} image`);
  } else {
    console.log(`   ⚠️  EA ${index + 1} already updated or not found`);
  }
});

// Write the updated content
fs.writeFileSync(filePath, content, 'utf-8');

console.log(`\n✅ Updated ${updateCount}/4 default EAs with sample images`);
console.log('\n📋 EAs now have images:');
console.log('   1. Gold Scalper Pro → gold-scalper.svg');
console.log('   2. Multi Indicator EA → multi-indicator.svg');
console.log('   3. Trend Master EA → trend-master.svg');
console.log('   4. Institutional SCALPER → institutional.svg');
console.log('\n✅ Done! EAs will now display sample images by default.');

