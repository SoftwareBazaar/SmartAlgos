require('dotenv').config();
const databaseService = require('./services/databaseService');

async function fixEAPaths() {
    try {
        console.log('🚀 Starting EA path fix...');

        const eaName = "London Breakout Bot v1.0";
        const ea = await databaseService.getEAByUniqueName(eaName);

        if (!ea) {
            console.log(`❌ EA "${eaName}" not found. Run startup script first.`);
            process.exit(1);
        }

        console.log(`✅ Found EA: ${ea.name} (ID: ${ea.id})`);

        const updates = {
            ea_file_path: "/uploads/LondonBreakoutv1.ex4",
            set_file_path: "/uploads/LondonBreakout.set",
            manual_file_path: "/uploads/LondonBreakout_Manual.pdf",
            version: "1.0.0",
            strategy_type: "trend",
            updated_at: new Date().toISOString()
        };

        console.log('🔄 Updating with paths:', updates);

        const { data, error } = await databaseService.supabase
            .from('expert_advisors')
            .update(updates)
            .eq('id', ea.id)
            .select();

        if (error) {
            console.error('❌ Update failed:', error);
            process.exit(1);
        }

        console.log('✅ Update successful:', data);
        process.exit(0);
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

fixEAPaths();
