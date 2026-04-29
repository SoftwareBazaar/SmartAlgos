-- Clear all test bookings from consultation_bookings table
-- Run this in Supabase SQL Editor to reset the booking system

-- Option 1: Delete ALL bookings (use this to start fresh)
DELETE FROM consultation_bookings;

-- Option 2: Delete only test bookings (if you want to keep some)
-- Uncomment the line below and comment out the line above
-- DELETE FROM consultation_bookings WHERE email LIKE '%test%' OR name LIKE '%test%';

-- Verify all bookings are cleared
SELECT COUNT(*) as remaining_bookings FROM consultation_bookings;

-- Show any remaining bookings (should be empty)
SELECT * FROM consultation_bookings ORDER BY created_at DESC;
