
-- Add payment_status column to bookings
ALTER TABLE public.bookings 
ADD COLUMN payment_status text NOT NULL DEFAULT 'pending';

-- Update existing bookings to 'paid' (since they were created before payment flow)
UPDATE public.bookings SET payment_status = 'paid' WHERE payment_status = 'pending';
