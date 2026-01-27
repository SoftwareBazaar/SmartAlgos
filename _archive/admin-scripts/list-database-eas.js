require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listEAs() {
    console.log('Fetching EAs from Supabase:', process.env.SUPABASE_URL);
    const { data, error } = await supabase
        .from('expert_advisors')
        .select('id, name, category, price_weekly, price_monthly, price_yearly, is_active, status');

    if (error) {
        console.error('Error fetching EAs:', error);
        return;
    }

    console.log('EAs in database:', data.length);
    console.table(data);
}

listEAs();
