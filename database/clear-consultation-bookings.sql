-- Clear all consultation bookings (fresh start)
-- Run in Supabase → SQL Editor

DELETE FROM consultation_bookings;

SELECT COUNT(*) AS remaining FROM consultation_bookings;
