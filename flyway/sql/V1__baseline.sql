CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public."user" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "badge_number" varchar UNIQUE NOT NULL,
  "name" varchar NOT NULL,
  "status" varchar NOT NULL DEFAULT 'active',
  "gender" varchar NULL,
  "title" varchar NOT NULL,
  "birth_day" date NULL,
  "phone" varchar NULL,
  "email" varchar UNIQUE NOT NULL,
  "address" varchar NULL,
  "manager_id" uuid NOT NULL,
  "hired_date" date NULL,
  "created_date_time" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modified_date_time" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "password" varchar NOT NULL,
  "biometric_url" varchar NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "role" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" varchar NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_role" (
  "user_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  PRIMARY KEY ("user_id", "role_id")
);

CREATE TABLE IF NOT EXISTS "work_time" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL,
  "from_date" timestamptz NOT NULL,
  "to_date" timestamptz NOT NULL,
  "from_time" time NOT NULL,
  "to_time" time NOT NULL,
  "start_break_time" time NOT NULL,
  "end_break_time" time NOT NULL,
  "description" varchar NULL,
  PRIMARY KEY ("id", "user_id")
);

CREATE TABLE IF NOT EXISTS "firebase" (
  "user_id" uuid NOT NULL,
  "firebase_token" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "biometric" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL,
  "biometric_url" varchar NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "valid" boolean NOT NULL DEFAULT false,
  "complete" boolean NOT NULL DEFAULT false,
  "user_email" varchar NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "check_in_out" (
  "check_id" uuid NOT NULL,
  "check_time" timestamptz NOT NULL,
  "check_type" varchar,
  "verify_code" int,
  "sensor_id" varchar,
  "work_code" int,
  "sn" varchar,
  "user_ext_fmt" int,
  "badge_number" varchar NOT NULL,
  PRIMARY KEY ("check_id", "check_time")
);

CREATE TABLE IF NOT EXISTS "holiday" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" varchar NOT NULL,
  "start_date" date UNIQUE NOT NULL,
  "duration" int DEFAULT 1,
  "description" varchar NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "reason" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "request_type_id" uuid NOT NULL,
  "name" varchar NOT NULL,
  "max_request_day" int NOT NULL,
  "description" varchar NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "request_type" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" varchar NOT NULL,
  "description" varchar,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "request" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL,
  "request_type_id" uuid NOT NULL,
  "status" varchar NOT NULL DEFAULT 'new',
  "error_count" boolean NOT NULL DEFAULT true,
  "reason_id" uuid NULL,
  "compensation_date" timestamptz NULL,
  "confirm_by" uuid NULL,
  "approve_by" uuid NULL,
  "comment" varchar NULL,
  "created_date_time" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modified_date_time" timestamptz DEFAULT CURRENT_TIMESTAMP,
  "request_date" timestamptz NULL,
  "start_date_time" timestamptz NULL,
  "end_date_time" timestamptz NULL,
  "manager_comment" varchar NULL,
  "off_time_hour" float4 NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "time_sheet" (
  "date" timestamptz NOT NULL,
  "user_id" uuid NOT NULL,
  "check_in" timestamptz NULL,
  "check_out" timestamptz NULL,
  "late" time NULL,
  "early" time NULL,
  "in_office" time NULL,
  "over_time" time NULL,
  "work_time" time NULL,
  "lack" time NULL,
  "comp" time NULL,
  "actual_in" timestamptz NULL,
  "actual_out" timestamptz NULL,
  "holiday_id" uuid NULL,
  "modified_by" uuid NULL,
  "modified_date_time" timestamptz NULL,
  PRIMARY KEY ("user_id", "date")
);

ALTER TABLE "user" ADD FOREIGN KEY ("manager_id") REFERENCES "user" ("id");

ALTER TABLE "user_role" ADD FOREIGN KEY ("role_id") REFERENCES "role" ("id");

ALTER TABLE "user_role" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "work_time" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "firebase" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "biometric" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "reason" ADD FOREIGN KEY ("request_type_id") REFERENCES "request_type" ("id");

ALTER TABLE "request" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "request" ADD FOREIGN KEY ("request_type_id") REFERENCES "request_type" ("id");

ALTER TABLE "request" ADD FOREIGN KEY ("reason_id") REFERENCES "reason" ("id");

ALTER TABLE "request" ADD FOREIGN KEY ("confirm_by") REFERENCES "user" ("id");

ALTER TABLE "request" ADD FOREIGN KEY ("approve_by") REFERENCES "user" ("id");

ALTER TABLE "time_sheet" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "time_sheet" ADD FOREIGN KEY ("holiday_id") REFERENCES "holiday" ("id");

ALTER TABLE "time_sheet" ADD FOREIGN KEY ("modified_by") REFERENCES "user" ("id");

CREATE INDEX IF NOT EXISTS "user_id_idx" ON "user" ("id");

CREATE INDEX IF NOT EXISTS "user_badge_number_idx" ON "user" ("badge_number");

CREATE INDEX IF NOT EXISTS "role_id_idx" ON "role" ("id");
