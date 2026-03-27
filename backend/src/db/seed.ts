import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const sampleReports = [
  {
    category: 'ragging',
    description: 'Senior students in hostel Block C are forcing freshers to perform embarrassing acts at night. Multiple students are affected and too scared to report openly.',
    location: 'Hostel Block C, 3rd Floor',
    status: 'Under Review',
    priority: 'High',
    anonymous_id: 'User-DEMO1',
  },
  {
    category: 'harassment',
    description: 'A professor in the CS department is being inappropriately personal with female students during office hours. Multiple girls have complained but nothing was done.',
    location: 'CS Department, Room 204',
    status: 'Pending',
    priority: 'High',
    anonymous_id: 'User-DEMO2',
  },
  {
    category: 'safety',
    description: 'The electrical wiring in the main lab building seems dangerously exposed. Saw sparks near the switchboard twice this week.',
    location: 'Main Lab Building, Ground Floor',
    status: 'Pending',
    priority: 'Medium',
    anonymous_id: 'User-DEMO3',
  },
  {
    category: 'ragging',
    description: 'New batch students are being pressured to pay money to seniors to avoid problems. This has been happening for the past 2 weeks.',
    location: 'Engineering Block',
    status: 'Resolved',
    priority: 'Medium',
    anonymous_id: 'User-DEMO4',
  },
  {
    category: 'harassment',
    description: 'Received multiple threatening messages from an anonymous number after reporting a complaint last month. Feeling unsafe on campus.',
    location: 'Online / Campus',
    status: 'Under Review',
    priority: 'High',
    anonymous_id: 'User-DEMO5',
  },
  {
    category: 'safety',
    description: 'The gate near the girls hostel is broken and remains open all night. Security guard is absent most nights creating serious safety concerns.',
    location: 'Girls Hostel Gate B',
    status: 'Pending',
    priority: 'Medium',
    anonymous_id: 'User-DEMO1',
  },
  {
    category: 'other',
    description: 'Campus water supply in the hostel mess has been contaminated. Several students fell sick last week. Health authorities should test the water.',
    location: 'Hostel Mess A',
    status: 'Resolved',
    priority: 'High',
    anonymous_id: 'User-DEMO2',
  },
  {
    category: 'ragging',
    description: 'First year students are being forced to run errands for seniors and stand outside rooms at night. This is clearly ragging but no one has the courage to speak up.',
    location: 'Boys Hostel Block A',
    status: 'Pending',
    priority: 'Medium',
    anonymous_id: 'User-DEMO3',
  },
  {
    category: 'harassment',
    description: 'A staff member at the canteen has been making uncomfortable comments to girl students. Multiple complaints have been raised informally.',
    location: 'Main Canteen',
    status: 'Pending',
    priority: 'Low',
    anonymous_id: 'User-DEMO4',
  },
  {
    category: 'safety',
    description: 'Emergency fire exit in Library building is blocked with furniture and cardboard boxes. This is a major fire safety hazard.',
    location: 'Library, 2nd Floor',
    status: 'Under Review',
    priority: 'High',
    anonymous_id: 'User-DEMO5',
  },
];

function generateTrackingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'RPT-';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

async function seed() {
  console.log('🌱 Seeding SafeCampus database...');

  // Create demo users
  const demoUsers = ['DEMO1', 'DEMO2', 'DEMO3', 'DEMO4', 'DEMO5'].map((suffix) => ({
    id: uuidv4(),
    email: `demo${suffix.toLowerCase()}@coeruniversity.ac.in`,
    is_verified: true,
    anonymous_id: `User-${suffix}`,
  }));

  const { error: userError } = await supabase.from('users').upsert(demoUsers, { onConflict: 'email' });
  if (userError) console.error('User seed error:', userError);
  else console.log(`✅ Created ${demoUsers.length} demo users`);

  // Create reports
  const reportRows = sampleReports.map((r) => ({
    id: uuidv4(),
    tracking_id: generateTrackingId(),
    ...r,
    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const { error: reportError } = await supabase.from('reports').insert(reportRows);
  if (reportError) console.error('Report seed error:', reportError);
  else console.log(`✅ Created ${reportRows.length} demo reports`);

  console.log('\n🎉 Seeding complete!');
  console.log('\nDemo tracking IDs:');
  reportRows.slice(0, 3).forEach((r) => console.log(`  ${r.tracking_id} — ${r.category}`));
}

seed().catch(console.error);
