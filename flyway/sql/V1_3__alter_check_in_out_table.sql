ALTER TABLE public.check_in_out ALTER COLUMN check_id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.check_in_out DROP CONSTRAINT IF EXISTS check_in_out_pkey;
ALTER TABLE public.check_in_out ADD CONSTRAINT check_in_out_pkey PRIMARY KEY (check_time,badge_number);