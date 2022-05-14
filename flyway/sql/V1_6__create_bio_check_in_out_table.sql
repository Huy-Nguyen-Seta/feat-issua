CREATE TABLE IF NOT EXISTS public."bio_check_in_out" (
  "id" uuid UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  "check_time" timestamptz NOT NULL,
  "badge_number" varchar NOT NULL,
  "sensor_id" varchar NOT NULL,
  PRIMARY KEY ("check_time", "badge_number")
);
