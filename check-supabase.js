
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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

  // 1. Check Table: profiles
  const { error: profileError } = await supabase.from('profiles').select('*').limit(1);
  if (profileError) {
    console.error(`❌ Profiles table: ${profileError.message}`);
  } else {
    console.log('✅ Profiles table exists');
  }

  // 2. Check Table: otps
  const { error: otpError } = await supabase.from('otps').select('*').limit(1);
  if (otpError) {
    console.error(`❌ OTPs table: ${otpError.message}`);
  } else {
    console.log('✅ OTPs table exists');
  }

  // 3. Check Table: access_logs
  const { error: logError } = await supabase.from('access_logs').select('*').limit(1);
  if (logError) {
    console.error(`❌ Access_logs table: ${logError.message}`);
  } else {
    console.log('✅ Access_logs table exists');
  }

  console.log('\n--- Troubleshooting ---');
  console.log('If tables are missing, run the SQL in the "SQL Editor" of Supabase Dashboard.');
  console.log('If you get 401 Unauthorized, your VITE_SUPABASE_ANON_KEY is wrong.');
  console.log('If you get 404, your VITE_SUPABASE_URL is wrong.');
}

checkProject();
