ALTER TABLE public.request ALTER COLUMN off_time_hour TYPE float4 USING off_time_hour::float4;
-- ALTER TABLE public.request ALTER COLUMN error_count TYPE int4 USING error_count::int4;
