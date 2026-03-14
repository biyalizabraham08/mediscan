
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Keys missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProject() {
  console.log('--- MediScan Supabase Diagnostic ---');
  console.log(`URL: ${supabaseUrl}`);

  const tables = ['profiles', 'otps', 'access_logs'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`❌ ${table}: ${error.message} (Code: ${error.code})`);
      if (error.hint) console.log(`   Hint: ${error.hint}`);
    } else {
      console.log(`✅ ${table} exists`);
    }
  }

  console.log('\n--- Checking RLS for access_logs ---');
  // Attempt a dummy insert to check for 400 errors specifically
  const { error: insertError } = await supabase.from('access_logs').insert({
    user_id: '00000000-0000-0000-0000-000000000000', // Invalid UUID for auth.users usually
    accessor_type: 'diagnostic',
    access_tier: 'test'
  });
  
  if (insertError) {
    console.log(`Diagnostic Insert Result: ${insertError.message} (Code: ${insertError.code})`);
  } else {
    console.log('✅ Diagnostic insert succeeded (Warning: Check your foreign keys!)');
  }
}

checkProject();
