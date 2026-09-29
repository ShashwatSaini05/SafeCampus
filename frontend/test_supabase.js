const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://drtgbdnftbrgleueivsa.supabase.co',
  'sb_publishable_FOk52Z_r_4R0RqxjOCPNmw_cFnkBpA9'
);

async function test() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log("DATA:", data);
  console.log("ERROR:", error);
}
test();
