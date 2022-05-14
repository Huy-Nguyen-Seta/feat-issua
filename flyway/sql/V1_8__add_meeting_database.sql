
-- public.room definition

CREATE TABLE IF NOT EXISTS public.room (
	room_id uuid NOT NULL DEFAULT uuid_generate_v4(),
	room_name varchar NOT NULL,
	is_locked bool NULL,
	CONSTRAINT room_pk PRIMARY KEY (room_id)
);

-- public.meeting_schedule definition

CREATE TABLE IF NOT EXISTS public.meeting_schedule (
	schedule_id uuid NOT NULL DEFAULT uuid_generate_v4(),
	room_id uuid NOT NULL,
	host_id uuid NOT NULL,
	meeting_name varchar NULL,
	meeting_description text NULL,
	start_date date NOT NULL,
	start_time time NOT NULL,
	duration_time time NOT NULL,
	cron_time bpchar(1) NULL,
	CONSTRAINT meeting_schedule_pk PRIMARY KEY (schedule_id)
);

-- public.meeting_schedule foreign keys

ALTER TABLE public.meeting_schedule ADD CONSTRAINT meeting_schedule_host_fk FOREIGN KEY (host_id) REFERENCES public."user"(id);
ALTER TABLE public.meeting_schedule ADD CONSTRAINT meeting_schedule_room_fk FOREIGN KEY (room_id) REFERENCES public.room(room_id);

-- public.user_meeting definition

CREATE TABLE IF NOT EXISTS public.user_meeting (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	meeting_id uuid NOT NULL,
	participant_id uuid NOT NULL,
	CONSTRAINT meeting_info_pk PRIMARY KEY (id)
);

-- public.user_meeting foreign keys

ALTER TABLE public.user_meeting ADD CONSTRAINT meeting_info_fk FOREIGN KEY (meeting_id) REFERENCES public.meeting_schedule(schedule_id);
ALTER TABLE public.user_meeting ADD CONSTRAINT meeting_info_user_fk FOREIGN KEY (participant_id) REFERENCES public."user"(id);

INSERT INTO public.room
(room_id, room_name, is_locked)
VALUES('43f9c791-e04d-48d0-843c-7922bbb18977'::uuid, 'Phòng California', false);
INSERT INTO public.room
(room_id, room_name, is_locked)
VALUES('26dfe636-85a1-46b8-bfcc-9f1a62fae60f'::uuid, 'Phòng Hà Nội', false);
INSERT INTO public.room
(room_id, room_name, is_locked)
VALUES('efe5ee67-fa89-4902-b276-0aca6355aca2'::uuid, 'Phòng Startup', false);
