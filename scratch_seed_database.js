import { createClient } from '@supabase/supabase-js';

const url = 'https://xbxwnjgnuyqnaszjsvni.supabase.co';
const key = 'sb_publishable_eCLqGT1STxpIBTd_EHqYcw_RyDbX10p';

const supabase = createClient(url, key);

async function seed() {
  console.log('Seeding Supabase database tables...');

  // 1. Seed Farmers
  const { error: fErr } = await supabase.from('farmers').upsert([
    {
      id: 'f1000000-0000-0000-0000-000000000101',
      phone: '+91 98765 43210',
      full_name: 'Ravi Kumar',
      village: 'Vijayawada Rural',
      district: 'NTR District',
      state: 'Andhra Pradesh',
      farmer_id: 'KC-AP-2026-8942',
      primary_crop: 'Paddy (Grade A)',
      land_acres: 4.5
    }
  ], { onConflict: 'phone' });

  if (fErr) console.log('Farmers info:', fErr.message);
  else console.log('Farmers seeded successfully!');

  // 2. Seed Procurement Centers
  const { error: cErr } = await supabase.from('procurement_centers').upsert([
    { id: 'c-vja', name: 'Vijayawada Procurement Center', district: 'NTR District', crowd: 'low', farmers_waiting: 12, avg_wait_min: 18, capacity_pct: 42, best_choice: true, map_x: 48, map_y: 52 },
    { id: 'c-gnt', name: 'Guntur Main Procurement Yard', district: 'Guntur', crowd: 'high', farmers_waiting: 45, avg_wait_min: 65, capacity_pct: 88, best_choice: false, map_x: 35, map_y: 68 },
    { id: 'c-tnl', name: 'Tenali Agricultural Market', district: 'Guntur', crowd: 'moderate', farmers_waiting: 24, avg_wait_min: 32, capacity_pct: 60, best_choice: false, map_x: 62, map_y: 75 }
  ], { onConflict: 'id' });

  if (cErr) console.log('Centers info:', cErr.message);
  else console.log('Procurement centers seeded successfully!');

  // 3. Seed MSP Prices
  const { error: mspErr } = await supabase.from('msp_prices').upsert([
    { crop_name: 'Paddy (Grade A)', category: 'Cereals', msp_rate_per_quintal: 2300, previous_year_msp: 2203, effective_season: 'Kharif 2026-27' },
    { crop_name: 'Paddy (Common)', category: 'Cereals', msp_rate_per_quintal: 2280, previous_year_msp: 2183, effective_season: 'Kharif 2026-27' },
    { crop_name: 'Cotton (Medium Staple)', category: 'Commercial Crops', msp_rate_per_quintal: 7121, previous_year_msp: 6620, effective_season: 'Kharif 2026-27' }
  ], { onConflict: 'crop_name' });

  if (mspErr) console.log('MSP info:', mspErr.message);
  else console.log('MSP prices seeded successfully!');

  // 4. Seed Procurement Records
  const { error: pErr } = await supabase.from('procurement_records').upsert([
    {
      id: 'PROC-2026-8942',
      token_id: 'VJA-104',
      farmer_name: 'Ravi Kumar',
      farmer_phone: '+91 98765 43210',
      center_name: 'Vijayawada Procurement Center',
      crop: 'Paddy (Grade A)',
      variety: 'Grade A Common',
      quantity_quintals: 40,
      moisture_pct: 14.0,
      quality_grade: 'Grade A Super',
      rate_per_quintal: 2300,
      gross_amount: 92000,
      final_payable_amount: 92000,
      status: 'Verified'
    }
  ], { onConflict: 'id' });

  if (pErr) console.log('Procurements info:', pErr.message);
  else console.log('Procurement records seeded successfully!');

  // 5. Seed Payments
  const { error: payErr } = await supabase.from('payments').upsert([
    {
      id: 'PAY-2026-8942',
      procurement_id: 'PROC-2026-8942',
      farmer_name: 'Ravi Kumar',
      farmer_phone: '+91 98765 43210',
      crop: 'Paddy (Grade A)',
      quantity_quintals: 40,
      rate_per_quintal: 2300,
      gross_amount: 92000,
      deductions: 0,
      final_payable_amount: 92000,
      payment_method: 'dbt',
      bank_last4: '4521',
      center_name: 'Vijayawada Procurement Center',
      idempotency_key: 'IDEM-KC-P8942-92000',
      provider_reference_id: 'SBIN202608284592',
      status: 'pending'
    }
  ], { onConflict: 'id' });

  if (payErr) console.log('Payments info:', payErr.message);
  else console.log('Payments seeded successfully!');

  console.log('Database seeding complete!');
}

seed();
