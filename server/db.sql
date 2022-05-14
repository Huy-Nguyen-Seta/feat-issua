-- auto-generated definition
create table "user"
(
    id                 uuid                     default uuid_generate_v4()          not null
        constraint user_pkey
            primary key,
    badge_number       varchar                                                      not null
        constraint user_badge_number_key
            unique,
    name               varchar,
    status             varchar                  default 'active'::character varying not null,
    gender             varchar,
    title              varchar,
    birth_day          date,
    phone              varchar,
    email              varchar                                                      not null
        constraint user_email_key
            unique,
    address            varchar,
    manager_id         uuid
        constraint user_manager_id_fkey
            references "user"
        constraint user_manager_id_fkey1
            references "user",
    hired_date         timestamp(0) with time zone,
    created_date_time  timestamp with time zone default CURRENT_TIMESTAMP           not null,
    modified_date_time timestamp with time zone default CURRENT_TIMESTAMP           not null,
    password           varchar                                                      not null,
    biometric_url      varchar,
    max_leave_day      integer                  default 12                          not null
);

alter table "user"
    owner to postgres;

create index user_badge_number_idx
    on "user" (badge_number);

create index user_id_idx
    on "user" (id);

--------------------------------------------------------------------------
-- created function 
create function updateorinsertuserleave(totalleave real, totalremain real, carryover real, carryoverremain real, _year integer, userid uuid) returns void
    language plpgsql
as
$$
DECLARE countRow integer;
BEGIN
       select count(ul.id) into countRow from user_leave ul where ul.year = _year and ul.user_id=userId;
        if countRow > 0 then
            update "user_leave" set total_leave = totalLeave, total_remain = totalRemain, carry_over = carryover, carry_over_remain = carryoverremain 
            where user_id = userId and year = _year;
        else
            insert into "user_leave" (total_leave, total_remain, carry_over, carry_over_remain, year, user_id)
            values (totalLeave,totalRemain,carryOver,carryOverRemain,_year,userId);
        end if;

END;
$$;

alter function updateorinsertuserleave(real, real, real, real, integer, uuid) owner to postgres;

