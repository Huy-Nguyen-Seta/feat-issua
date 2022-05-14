ALTER TABLE public.request ALTER COLUMN compensation_date TYPE timestamptz(0) USING compensation_date::timestamptz;
ALTER TABLE public.request ALTER COLUMN request_date TYPE timestamptz(0) USING request_date::timestamptz;
