
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
const TARGET_USER_ID = '22c9c89e-7589-46b1-a3bc-a31673a5f702';

async function diagnose() {
  console.log('--- MediScan Email Diagnosis ---');
  console.log(`Checking user: ${TARGET_USER_ID}\n`);

  // 1. Check if profiles table exists and has data
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', TARGET_USER_ID)
    .single();

  if (profileError) {
    console.error(`❌ Profile Error: ${profileError.message}`);
    if (profileError.code === 'PGRST116') {
        console.log('   (Result: No profile found for this user in the database)');
    } else if (profileError.message.includes('column "email" does not exist')) {
        console.log('   (Result: The "email" column is definitely missing from your database!)');
    }
    return;
  }

  console.log('✅ Profile found in database!');
  
  const hasEmailColumn = 'email' in profileData;
  if (!hasEmailColumn) {
    console.error('❌ THE "email" COLUMN IS MISSING FROM THE DATABASE!');
    console.log('   Reason: The "ALTER TABLE" command was likely not run.');
    return;
  }

  console.log('✅ "email" column exists in database.');

  if (profileData.email) {
    console.log(`✅ Email is correctly set: ${profileData.email}`);
  } else {
    console.log('❌ THE EMAIL FIELD IS BLANK (EMPTY STRING) IN THE DATABASE.');
    console.log('   Reason: You likely haven\'t clicked "Save" on the Medical Profile page yet.');
  }

}

diagnose();
