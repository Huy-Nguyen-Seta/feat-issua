CREATE TABLE IF NOT EXISTS public."user_leave"(
    "id" uuid UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    "total_leave" float4 NULL,
    "total_remain" float4 NULL,
    "carry_over" float4 NULL,
    "carry_over_remain" float4 NULL,
    "year" int NULL,
    "created_time" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    "user_id" uuid NOT NULL,
    PRIMARY KEY ("id")
);