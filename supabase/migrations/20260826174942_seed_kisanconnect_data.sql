/*
# KisanConnect — Seed Demo Data

Populates all tables with the demo content that powers the KisanConnect UI.

## What gets inserted

1. **farmers** — 1 demo farmer (Ravi Kumar)
2. **procurement_centers** — 8 centers across Andhra Pradesh / Telangana
3. **tokens** — Token A127 for Ravi Kumar at Vijayawada
4. **queue_entries** — 4 live queue entries (A124–A127)
5. **notifications** — 4 notification cards
6. **payments** — 1 payment record (₹92,400)
7. **platform_stats** — Aggregate counters (25K farmers, 150 centers, 1.2M quintals, ₹45Cr)
8. **center_stats** — Daily center dashboard (128 farmers, 142 tokens, etc.)
9. **smart_alerts** — 1 high-crowd alert with AI redirect recommendation
10. **crop_distribution** — 5 crop breakdown rows
11. **week_volume** — 7 days of volume + wait data
12. **satisfaction_ratings** — 5 rating tiers + average
13. **ai_recommendations** — 1 AI slot recommendation (11:30 → 10:30, saves 37 min)

## Notes

1. Uses `ON CONFLICT DO NOTHING` / `DO UPDATE` for idempotency.
2. Safe to re-run — no data loss.
*/

-- farmers
INSERT INTO farmers (id, name, crop, quantity_quintals, phone)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ravi Kumar', 'Paddy', 40, '+91 98765 43210')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, crop = EXCLUDED.crop, quantity_quintals = EXCLUDED.quantity_quintals;

-- procurement_centers
INSERT INTO procurement_centers (id, name, district, crowd, farmers_waiting, avg_wait_min, capacity_pct, best_choice, map_x, map_y) VALUES
  ('vij', 'Vijayawada Center', 'Krishna', 'low', 18, 24, 72, true, 52, 58),
  ('gun', 'Guntur Center', 'Guntur', 'low', 12, 18, 45, false, 40, 66),
  ('viz', 'Visakhapatnam Center', 'Visakhapatnam', 'high', 64, 88, 94, false, 72, 30),
  ('tir', 'Tirupati Center', 'Chittoor', 'moderate', 38, 52, 81, false, 46, 84),
  ('war', 'Warangal Center', 'Warangal', 'moderate', 31, 44, 68, false, 30, 44),
  ('kak', 'Kakinada Center', 'East Godavari', 'low', 9, 14, 38, false, 64, 44),
  ('nlg', 'Nalgonda Center', 'Nalgonda', 'high', 52, 76, 91, false, 34, 74),
  ('kurn', 'Kurnool Center', 'Kurnool', 'moderate', 27, 47, 63, false, 24, 78)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, district = EXCLUDED.district, crowd = EXCLUDED.crowd,
  farmers_waiting = EXCLUDED.farmers_waiting, avg_wait_min = EXCLUDED.avg_wait_min,
  capacity_pct = EXCLUDED.capacity_pct, best_choice = EXCLUDED.best_choice,
  map_x = EXCLUDED.map_x, map_y = EXCLUDED.map_y;

-- tokens
INSERT INTO tokens (token_number, farmer_name, crop, quantity_quintals, center_name, appointment_date, appointment_time, queue_position, status, farmer_id, center_id)
VALUES ('A127', 'Ravi Kumar', 'Paddy', 40, 'Vijayawada', '28 August 2026', '10:30 AM', 4, 'confirmed',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'vij')
ON CONFLICT DO NOTHING;

-- queue_entries
INSERT INTO queue_entries (token_number, center_id, status, is_you, position) VALUES
  ('A124', 'vij', 'processing', false, 1),
  ('A125', 'vij', 'waiting', false, 2),
  ('A126', 'vij', 'waiting', false, 3),
  ('A127', 'vij', 'waiting', true, 4)
ON CONFLICT DO NOTHING;

-- notifications
INSERT INTO notifications (type, title, body, display_time) VALUES
  ('reminder', 'Appointment Reminder', 'Your procurement slot starts in 1 hour.', '9:30 AM'),
  ('queue', 'Queue Update', 'Only 2 farmers are ahead of you!', '10:06 AM'),
  ('produce', 'Procurement Update', 'Your produce has passed quality verification.', '10:48 AM'),
  ('payment', 'Payment Update', '₹92,400 has been successfully processed.', '11:02 AM')
ON CONFLICT DO NOTHING;

-- payments
INSERT INTO payments (farmer_name, amount, crop, quantity_quintals, center_name, rate_per_quintal, transaction_id, bank_last4, status, timeline_step)
VALUES ('Ravi Kumar', 92400, 'Paddy', 40, 'Vijayawada', 2310, 'KC2026TX08274592', '4521', 'processed', 4)
ON CONFLICT DO NOTHING;

-- platform_stats
INSERT INTO platform_stats (id, farmers_connected, procurement_centers, quintals_procured, payments_processed_cr)
VALUES ('main', 25000, 150, 1200000, 45)
ON CONFLICT (id) DO UPDATE SET
  farmers_connected = EXCLUDED.farmers_connected,
  procurement_centers = EXCLUDED.procurement_centers,
  quintals_procured = EXCLUDED.quintals_procured,
  payments_processed_cr = EXCLUDED.payments_processed_cr;

-- center_stats
INSERT INTO center_stats (id, farmers_today, tokens, waiting, completed, quintals, payments_lakh, capacity_pct)
VALUES ('main', 128, 142, 41, 87, 384, 8.4, 72)
ON CONFLICT (id) DO UPDATE SET
  farmers_today = EXCLUDED.farmers_today, tokens = EXCLUDED.tokens,
  waiting = EXCLUDED.waiting, completed = EXCLUDED.completed,
  quintals = EXCLUDED.quintals, payments_lakh = EXCLUDED.payments_lakh,
  capacity_pct = EXCLUDED.capacity_pct;

-- smart_alerts
INSERT INTO smart_alerts (severity, title, body, recommendation, center_name, redirect_count, redirect_center)
VALUES ('high', 'High Crowd Alert', 'Vijayawada Center is approaching maximum capacity.',
  'Redirect 18 upcoming farmers to Guntur Center.', 'Vijayawada Center', 18, 'Guntur Center')
ON CONFLICT DO NOTHING;

-- crop_distribution
INSERT INTO crop_distribution (crop, pct, color) VALUES
  ('Paddy', 42, '#22c55e'),
  ('Cotton', 24, '#fbbf24'),
  ('Maize', 18, '#f59e0b'),
  ('Groundnut', 10, '#3a7d57'),
  ('Others', 6, '#86efac')
ON CONFLICT (crop) DO UPDATE SET pct = EXCLUDED.pct, color = EXCLUDED.color;

-- week_volume
INSERT INTO week_volume (day, volume, wait_min) VALUES
  ('Mon', 58, 35),
  ('Tue', 72, 43),
  ('Wed', 65, 39),
  ('Thu', 91, 55),
  ('Fri', 84, 50),
  ('Sat', 103, 62),
  ('Sun', 47, 28)
ON CONFLICT (day) DO UPDATE SET volume = EXCLUDED.volume, wait_min = EXCLUDED.wait_min;

-- satisfaction_ratings
INSERT INTO satisfaction_ratings (label, pct, total_ratings, average_rating) VALUES
  ('5 Star', 68, 2847, 4.7),
  ('4 Star', 22, 2847, 4.7),
  ('3 Star', 7, 2847, 4.7),
  ('2 Star', 2, 2847, 4.7),
  ('1 Star', 1, 2847, 4.7)
ON CONFLICT (label) DO UPDATE SET pct = EXCLUDED.pct, total_ratings = EXCLUDED.total_ratings, average_rating = EXCLUDED.average_rating;

-- ai_recommendations
INSERT INTO ai_recommendations (selected_slot, selected_wait_min, recommended_slot, recommended_wait_min, time_saved_min, farmer_name, center_name)
VALUES ('11:30 AM', 61, '10:30 AM', 24, 37, 'Ravi Kumar', 'Vijayawada')
ON CONFLICT DO NOTHING;
