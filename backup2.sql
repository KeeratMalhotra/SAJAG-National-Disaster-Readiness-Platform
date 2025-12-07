--
-- PostgreSQL database dump
--

\restrict mudm9l7JCiedHwRDEcQdPfTzQ6Rvc5HBSKNfGo6abOkUUObQ9BObhuLG2Bh2Get

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: announcement_scope; Type: TYPE; Schema: public; Owner: sajagadmin
--

CREATE TYPE public.announcement_scope AS ENUM (
    'national',
    'state'
);


ALTER TYPE public.announcement_scope OWNER TO sajagadmin;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: sajagadmin
--

CREATE TYPE public.user_role AS ENUM (
    'training_partner',
    'sdma_admin',
    'ndma_admin',
    'auditor',
    'citizen'
);


ALTER TYPE public.user_role OWNER TO sajagadmin;

--
-- Name: user_status; Type: TYPE; Schema: public; Owner: sajagadmin
--

CREATE TYPE public.user_status AS ENUM (
    'pending',
    'active',
    'rejected'
);


ALTER TYPE public.user_status OWNER TO sajagadmin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: sajagadmin
--

CREATE TABLE public.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    scope public.announcement_scope NOT NULL,
    state character varying(100),
    creator_user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.announcements OWNER TO sajagadmin;

--
-- Name: assessments; Type: TABLE; Schema: public; Owner: sajagadmin
--

CREATE TABLE public.assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    training_theme character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assessments OWNER TO sajagadmin;

--
-- Name: districts; Type: TABLE; Schema: public; Owner: sajagadmin
--

CREATE TABLE public.districts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    state character varying(255) NOT NULL,
    baseline_vulnerability numeric(3,1) DEFAULT 5.0,
    current_ai_risk numeric(3,1) DEFAULT 0.0,
    risk_reason text,
    last_ai_update timestamp with time zone
);


ALTER TABLE public.districts OWNER TO sajagadmin;

--
-- Name: options; Type: TABLE; Schema: public; Owner: sajagadmin
--

CREATE TABLE public.options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    option_text character varying(255) NOT NULL,
    is_correct boolean DEFAULT false NOT NULL
);


ALTER TABLE public.options OWNER TO sajagadmin;

--
-- Name: participant_submissions; Type: TABLE; Schema: public; Owner: sajagadmin
--

CREATE TABLE public.participant_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    training_id uuid NOT NULL,
    participant_email character varying(255) NOT NULL,
    assessment_id uuid NOT NULL,
    score numeric(5,2) NOT NULL,
    submitted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.participant_submissions OWNER TO sajagadmin;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: sajagadmin
--

CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid NOT NULL,
    question_text text NOT NULL,
    question_order integer
);


ALTER TABLE public.questions OWNER TO sajagadmin;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: sajagadmin
--

CREATE TABLE public.system_settings (
    key character varying(50) NOT NULL,
    value character varying(255)
);


ALTER TABLE public.system_settings OWNER TO sajagadmin;

--
-- Name: training_photos; Type: TABLE; Schema: public; Owner: sajagadmin
--

CREATE TABLE public.training_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    training_id uuid NOT NULL,
    image_url character varying(255) NOT NULL,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    image_data bytea,
    mime_type character varying(50)
);


ALTER TABLE public.training_photos OWNER TO sajagadmin;

--
-- Name: trainings; Type: TABLE; Schema: public; Owner: sajagadmin
--

CREATE TABLE public.trainings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    theme character varying(100) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    location_text character varying(255) NOT NULL,
    latitude numeric(9,6),
    longitude numeric(9,6),
    creator_user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trainings OWNER TO sajagadmin;

--
-- Name: user_announcement_views; Type: TABLE; Schema: public; Owner: sajagadmin
--

CREATE TABLE public.user_announcement_views (
    user_id uuid NOT NULL,
    announcement_id uuid NOT NULL,
    viewed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_announcement_views OWNER TO sajagadmin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: sajagadmin
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role NOT NULL,
    organization_name character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status public.user_status DEFAULT 'pending'::public.user_status NOT NULL,
    state character varying(100),
    document_url character varying(255)
);


ALTER TABLE public.users OWNER TO sajagadmin;

--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: sajagadmin
--

COPY public.announcements (id, title, content, scope, state, creator_user_id, created_at) FROM stdin;
ce02c557-ea10-4516-8821-eacd3822907a	hi guys	boom	national	\N	5f617852-1ba6-4ac1-8086-ef5222eae408	2025-10-15 18:24:15.296825+00
f8cb8e64-b1e6-4cac-985c-5e51ed8e1eef	cxvxv	xcvxv	state	Delhi	67b9e61e-1f73-452c-8a4c-599b9c159dec	2025-10-19 13:29:24.731414+00
9eff9a15-3b3d-4763-a292-59f45f44bcbd	gdfgdf	gdgfdg	national	\N	5f617852-1ba6-4ac1-8086-ef5222eae408	2025-10-19 13:32:16.65897+00
\.


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: sajagadmin
--

COPY public.assessments (id, title, training_theme, created_at) FROM stdin;
236e2247-a2a1-4dba-9c6b-805bbb931dc5	Earthquake Safety Essentials	Earthquake	2025-10-14 21:10:47.141198+00
530f9143-8ace-4760-a589-f7ed15cf56c8	Landslide Awareness	Landslide	2025-10-14 21:10:47.502588+00
18ad310b-46bb-4607-ac04-8f61ae9c2058	Basic Fire Safety	Fire Safety	2025-10-14 21:10:47.950159+00
df4120a2-2a49-4d70-a451-82e567ebf95e	CBRN Incident Response	CBRN	2025-10-14 21:10:48.385976+00
4549aee2-4896-461c-8e37-a12e38733001	Cyclone Preparedness	Cyclone	2025-10-14 21:10:50.182309+00
c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	Flood Safety Quiz	Flood	2025-10-18 14:14:09.690413+00
\.


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: sajagadmin
--

COPY public.districts (id, name, state, baseline_vulnerability, current_ai_risk, risk_reason, last_ai_update) FROM stdin;
df869839-7ced-4b24-bff6-29ee33a18374	Mumbai City	Maharashtra	7.5	0.0	\N	\N
0cac093d-b067-4473-86cb-9970f0053670	Pune	Maharashtra	6.0	0.0	\N	\N
c3231e95-377e-43b4-a25c-6fd9d5346480	Nagpur	Maharashtra	5.0	0.0	\N	\N
93c78e66-f066-4608-83ca-e125216045fd	New Delhi	Delhi	6.5	0.0	\N	\N
96a8f810-9eee-4814-a147-68d324595a4b	Puri	Odisha	9.0	7.0	Coastal vulnerability to cyclones and regional floods.	2025-12-07 15:40:26.088686+00
0025bb9f-a434-43f5-9247-71eb9314520f	Cuttack	Odisha	8.5	7.0	Coastal vulnerability to cyclones and regional floods.	2025-12-07 15:40:26.096218+00
38e7f89c-8bc8-452f-8200-fd466044d6cb	Khordha	Odisha	8.0	7.0	Coastal vulnerability to cyclones and regional floods.	2025-12-07 15:40:26.09884+00
daeffa7c-c17b-464b-8854-d58124c2b4e5	Balasore	Odisha	8.5	7.0	Coastal vulnerability to cyclones and regional floods.	2025-12-07 15:40:26.101249+00
a42e18ee-a152-4b81-8b83-fdd33f957387	Guwahati	Assam	8.0	6.0	High flood risk linked to 2025 Asia Floods warnings.	2025-12-07 15:40:26.103868+00
94432c07-e77c-4327-b6fb-644eca9edd33	Cachar	Assam	9.0	6.0	High flood risk linked to 2025 Asia Floods warnings.	2025-12-07 15:40:26.106432+00
100000e0-f5db-453d-801a-5a2b59058662	Dibrugarh	Assam	8.5	6.0	High flood risk linked to 2025 Asia Floods warnings.	2025-12-07 15:40:26.108639+00
40a3f213-21ec-4749-a547-6e58ac3a668a	Chamoli	Uttarakhand	9.5	8.0	Uttarakhand vulnerability to landslides and Himalayan disaster risk.	2025-12-07 15:40:26.111471+00
55ff3889-f65b-414e-8d8e-9680a8c53311	Dehradun	Uttarakhand	7.0	8.0	Uttarakhand vulnerability to landslides and Himalayan disaster risk.	2025-12-07 15:40:26.114422+00
\.


--
-- Data for Name: options; Type: TABLE DATA; Schema: public; Owner: sajagadmin
--

COPY public.options (id, question_id, option_text, is_correct) FROM stdin;
81df14c7-0ac0-4e00-924c-49d8de6c2e59	8065209d-787f-4569-87d7-398d0e7f9ed8	Run outside immediately.	f
2ed086ec-cd21-4a6d-bd75-c558dc6a815d	8065209d-787f-4569-87d7-398d0e7f9ed8	Stand in a doorway.	f
f2a86b7f-6727-4af8-9e2a-57aee1df62e3	8065209d-787f-4569-87d7-398d0e7f9ed8	Drop, Cover, and Hold On.	t
8aa96173-4f18-48ff-a69b-1dbc7e3e2c39	8065209d-787f-4569-87d7-398d0e7f9ed8	Use the elevator to evacuate.	f
5842e76e-6a58-4b04-8f91-7935fdf0ef2b	080c66de-ba71-49ee-8a94-dfe3c4b34290	Check for gas leaks, electrical damage, and water leaks.	t
9f0b10f3-1eeb-4c04-b815-6e6a490c8d85	080c66de-ba71-49ee-8a94-dfe3c4b34290	Immediately call your relatives.	f
7d814d24-5248-4e41-ad3e-6d223841cde4	080c66de-ba71-49ee-8a94-dfe3c4b34290	Start cleaning up the debris.	f
1004199b-394b-472a-8a18-73f35f14e5b7	080c66de-ba71-49ee-8a94-dfe3c4b34290	Turn on all the lights to check for power.	f
cca1665b-3c0e-4534-8877-513655643f4e	e65c0d6c-497e-4fd1-b8d0-de5f81a89d79	Under a large tree.	f
779ad7d5-0300-4937-a84d-59996124bc04	e65c0d6c-497e-4fd1-b8d0-de5f81a89d79	Next to a tall building.	f
be73292f-28d7-4369-a08f-40ca8394c0a2	e65c0d6c-497e-4fd1-b8d0-de5f81a89d79	In an open area away from buildings, trees, and power lines.	t
204d78a6-2991-4f32-ac8e-3b27113498bc	e65c0d6c-497e-4fd1-b8d0-de5f81a89d79	Inside your car.	f
e357a732-44eb-4c61-bd15-12dd931acd9f	f257bc0a-d37e-4c68-9e46-35381e8800b0	Sudden clear, sunny weather.	f
7afdfb50-3729-4f4c-a383-374feafcb3d6	f257bc0a-d37e-4c68-9e46-35381e8800b0	New cracks appearing in plaster, tile, or foundations.	t
0fcb55e9-14d3-4105-9e8a-9688e56e5ce0	f257bc0a-d37e-4c68-9e46-35381e8800b0	Birds singing louder than usual.	f
63310820-3218-47fc-972d-75b614fccbc5	f257bc0a-d37e-4c68-9e46-35381e8800b0	A sudden drop in wind speed.	f
84aa9acd-30f7-476a-ad3d-4991b17fb3ce	b1d5ba60-c7b6-42d4-a62d-171928710c2f	Try to outrun the debris flow downhill.	f
3e497dbd-cf8a-4d39-9907-011f5a4b3147	b1d5ba60-c7b6-42d4-a62d-171928710c2f	Lay flat on the ground.	f
23a58a9f-1c21-45a0-8901-b3a71c4739ad	b1d5ba60-c7b6-42d4-a62d-171928710c2f	Curl into a tight ball and protect your head.	t
3043128d-0b2d-4368-b73b-e1ba6e1aa066	b1d5ba60-c7b6-42d4-a62d-171928710c2f	Climb the nearest tree.	f
e7958783-fef4-4ec7-b756-710b8cb985b1	05143e9f-a5e7-4864-a4d8-70fbf207f758	At the base of a steep slope.	f
5154aff7-93c8-4289-a8e3-5814269f2089	05143e9f-a5e7-4864-a4d8-70fbf207f758	On top of an old landslide deposit.	f
8d51421b-ab67-4714-8944-8a64bb91c6a5	05143e9f-a5e7-4864-a4d8-70fbf207f758	On relatively flat ground far away from steep slopes and drainage ways.	t
96d31373-f844-43ea-a252-e8969a1352e3	05143e9f-a5e7-4864-a4d8-70fbf207f758	Near the mouth of a canyon.	f
6cba8551-4129-4209-8124-d67acef6a0ec	58e2af5e-6f5b-490f-b243-fcbc96426510	Push, Aim, Spray, Stop.	f
c896e4ce-8f29-44a0-ad2b-e604b0bdcca8	58e2af5e-6f5b-490f-b243-fcbc96426510	Pull, Aim, Squeeze, Sweep.	t
960b57db-57c7-4820-b22e-108429d95223	58e2af5e-6f5b-490f-b243-fcbc96426510	Pass, Alert, Shout, Spray.	f
cbba0970-b58f-4f96-b266-7a59a84b2482	58e2af5e-6f5b-490f-b243-fcbc96426510	Point, Activate, Spray, Secure.	f
4649fe74-587c-43e0-b4ee-d7e3063ef74d	44d24c2d-3a39-4e79-bfce-505a91f12c47	Run to find water.	f
a538127f-867c-45f6-bdaa-7e6f5cc3bf5d	44d24c2d-3a39-4e79-bfce-505a91f12c47	Try to beat the flames out with your hands.	f
e7d866ce-83db-402c-96cd-5dc07f46e254	44d24c2d-3a39-4e79-bfce-505a91f12c47	Stop, Drop, and Roll.	t
8f747150-8191-4723-a7e6-d1a0c703b2c5	44d24c2d-3a39-4e79-bfce-505a91f12c47	Call for help.	f
d3cd7997-e97c-4a5d-ad84-9f2fb751be88	934a183e-1bd6-4e3f-9fcd-945c459fc479	Try to fight the fire yourself.	f
eac9612d-8816-41bf-906f-e1bb72c3d16a	934a183e-1bd6-4e3f-9fcd-945c459fc479	Activate the fire alarm and alert others.	t
928017ee-5830-433a-99bf-b8055a7ee1dd	934a183e-1bd6-4e3f-9fcd-945c459fc479	Gather your personal belongings.	f
ebc29708-6612-42be-9270-8012cf17665a	934a183e-1bd6-4e3f-9fcd-945c459fc479	Open a window for ventilation.	f
75ac85f4-ffb3-4f5b-8eeb-8dd10f6e9041	5abeafd1-1865-4267-adc3-301eb203b195	Reactive.	f
b6c39cef-343d-4efc-adda-4eb1be4ff1b9	5abeafd1-1865-4267-adc3-301eb203b195	Response.	f
21fb82f5-8028-45b3-923f-b6b25339f594	5abeafd1-1865-4267-adc3-301eb203b195	Radiological.	t
ac4adcaf-4132-44b8-aaba-8b83ce751cb8	5abeafd1-1865-4267-adc3-301eb203b195	Rescue.	f
13b952d2-b8bc-4125-b7e1-9cc755ea86aa	13000a33-ee5a-4a71-aadb-aaab4db1a9d1	Downwind and downhill.	f
ba33da3e-4bd8-4768-b09d-154a0a668031	13000a33-ee5a-4a71-aadb-aaab4db1a9d1	Towards the source to investigate.	f
53bd200f-868f-41f8-90fa-7d23aa7cfd2c	13000a33-ee5a-4a71-aadb-aaab4db1a9d1	Upwind and uphill from the source.	t
313a88d2-8546-4b8f-a9d0-62e87090bfbe	13000a33-ee5a-4a71-aadb-aaab4db1a9d1	To the nearest body of water.	f
0394e493-4b18-4954-9427-3f31a952f0fe	12db47b2-3943-464d-98bb-293c2ee03aaf	To prepare for evacuation.	f
915473b4-f798-4b7d-8fef-e6d9c0fcac11	12db47b2-3943-464d-98bb-293c2ee03aaf	To create a barrier between you and contaminated air outside.	t
483e99e4-3017-4999-9f6c-6c0f9e65f14d	12db47b2-3943-464d-98bb-293c2ee03aaf	To meet with emergency responders.	f
3526a485-87c6-462f-81da-a11aa48df1d8	12db47b2-3943-464d-98bb-293c2ee03aaf	To gather supplies for a long-term emergency.	f
e7b5e4e2-23c5-4288-9e8d-7df6fca6e37e	e16d162a-5e67-4071-9336-1cc53f24fdc0	Heavy rainfall.	f
be3a8003-7e49-4c43-ac7c-733ae0ba6985	e16d162a-5e67-4071-9336-1cc53f24fdc0	High winds.	f
f2caf772-7691-4b36-8030-f97f2a7a5d1e	e16d162a-5e67-4071-9336-1cc53f24fdc0	Storm surge.	t
d9b0078f-353f-4881-82db-a10ebe05ae28	e16d162a-5e67-4071-9336-1cc53f24fdc0	Lightning.	f
a195b4e7-cd3e-49db-825c-ca4faeae301a	f6d5bcb2-396f-4da3-a046-a73f27766170	Open all windows to equalize pressure.	f
2d5c1345-3a9e-4b76-b1a0-00819b17d116	f6d5bcb2-396f-4da3-a046-a73f27766170	Move outdoor furniture inside and board up windows.	t
8183b36a-8234-41e7-9086-ec443a33c5f5	f6d5bcb2-396f-4da3-a046-a73f27766170	Stock up on candles as a primary light source.	f
1a757215-c0c8-4089-b6cf-cf1f1ca01b84	f6d5bcb2-396f-4da3-a046-a73f27766170	Fill bathtubs with water for drinking.	f
9b8a4b0a-d2bc-472d-912d-eb6f2a29315f	1d7bfb6f-ec9a-4047-a808-db07635de0d6	In the attic or highest floor.	f
7d43d2d9-f0d9-4bcf-8c67-e27e93b35041	1d7bfb6f-ec9a-4047-a808-db07635de0d6	In a small, interior room on the lowest level not subject to flooding.	t
ce8ab7c6-a6c8-4b9f-803d-e06f3277603e	1d7bfb6f-ec9a-4047-a808-db07635de0d6	Next to a large window to see what is happening.	f
c02c7242-6809-43b5-ad59-7d0bbec1d162	1d7bfb6f-ec9a-4047-a808-db07635de0d6	On the roof.	f
\.


--
-- Data for Name: participant_submissions; Type: TABLE DATA; Schema: public; Owner: sajagadmin
--

COPY public.participant_submissions (id, training_id, participant_email, assessment_id, score, submitted_at) FROM stdin;
25e96f79-b09e-443b-a6c3-1ead784e6183	13492b89-e506-4818-bf39-946f8ba79aa3	d.user1@gmail.com	530f9143-8ace-4760-a589-f7ed15cf56c8	70.00	2025-10-18 14:20:26.576509+00
6d6bc3d4-97fa-4fcd-a564-753f2cccab8d	13492b89-e506-4818-bf39-946f8ba79aa3	d.user2@gmail.com	530f9143-8ace-4760-a589-f7ed15cf56c8	80.00	2025-10-18 14:20:26.576509+00
483f1b23-6991-4424-ad3f-f588bea414f3	13492b89-e506-4818-bf39-946f8ba79aa3	d.user3@gmail.com	530f9143-8ace-4760-a589-f7ed15cf56c8	60.00	2025-10-18 14:20:26.576509+00
6f725d26-f78b-452c-8c87-1c0779272446	13492b89-e506-4818-bf39-946f8ba79aa3	d.user4@gmail.com	530f9143-8ace-4760-a589-f7ed15cf56c8	90.00	2025-10-18 14:20:26.576509+00
698da50f-420b-4fc9-bcd9-2f47d5a31393	13492b89-e506-4818-bf39-946f8ba79aa3	d.user5@gmail.com	530f9143-8ace-4760-a589-f7ed15cf56c8	70.00	2025-10-18 14:20:26.576509+00
3083be80-5681-4f17-9725-8aca529fc8a5	df0b8ca5-a3f9-48a3-bf4d-0cb6af8de752	d.fire1@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	50.00	2025-10-18 14:20:26.576509+00
6b8534e0-5427-486e-80d9-582fe88e140c	df0b8ca5-a3f9-48a3-bf4d-0cb6af8de752	d.fire2@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	60.00	2025-10-18 14:20:26.576509+00
b27eb169-f510-4d05-8574-6b3a8dc59d19	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user1@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	80.00	2025-10-18 14:20:26.576509+00
618e206a-0142-4771-8d85-49fd06a974b8	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user2@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	85.00	2025-10-18 14:20:26.576509+00
abd7cdb2-49f7-4007-a512-27fbf590b894	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user3@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
456b3cc2-4881-4499-96ba-f733c9684e36	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user4@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	95.00	2025-10-18 14:20:26.576509+00
474eb5ac-8acc-4be5-a4f0-405148943631	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user5@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	100.00	2025-10-18 14:20:26.576509+00
d4d2fd30-7422-4a96-9a08-e3b0d6eb038d	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user6@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	80.00	2025-10-18 14:20:26.576509+00
a705017d-9ed5-48c9-9008-2c3f7c522afb	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user7@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	70.00	2025-10-18 14:20:26.576509+00
9832157c-951a-4360-8cfd-8054f99104f4	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user8@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
382240fe-db2c-4e2c-b395-db5fc39c67af	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user9@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
809bd786-26fb-42ac-bd96-53fdcd7eacfd	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user10@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	80.00	2025-10-18 14:20:26.576509+00
bdad920f-b572-4d92-999e-760232b9fed9	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user11@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
c582fd95-dbae-4f22-b06b-0fc6524a5d71	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user12@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	85.00	2025-10-18 14:20:26.576509+00
f02d7436-fc0c-442e-82c8-bc47c5d95127	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user13@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
8c74d0e1-8a2b-4b49-b148-7359618fb7a4	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user14@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	95.00	2025-10-18 14:20:26.576509+00
c4965a6e-13ed-40f3-9ae9-6ef6f641b6e2	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user15@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	100.00	2025-10-18 14:20:26.576509+00
ceb0310d-4c90-41de-a54e-ec7400fdef95	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user16@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	80.00	2025-10-18 14:20:26.576509+00
d16e3b6a-da38-471a-a3a2-ae3e730df905	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user17@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	70.00	2025-10-18 14:20:26.576509+00
343cfdaa-a3af-467c-a7ab-d6cf559c5e76	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user18@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
4b6018a7-cce6-49d8-9c9e-1e37a013991a	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user19@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
38464464-efc1-4ae3-93b2-b16f7982a2fa	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user20@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	80.00	2025-10-18 14:20:26.576509+00
dee9ba46-d517-4ddd-872e-bfffb8c03142	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user21@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
d97ba92b-9603-4413-8bb5-37fd064a0fab	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user22@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	85.00	2025-10-18 14:20:26.576509+00
e96199e7-2708-4054-8a1b-51d8c3d44d1b	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user23@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
9140c3a1-3907-4957-8f2e-dda696aa074e	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user24@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	95.00	2025-10-18 14:20:26.576509+00
4a100046-6795-4e7b-9734-3d2d43ac7bae	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user25@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	100.00	2025-10-18 14:20:26.576509+00
465a65b2-183d-4275-aaf2-dc1d02888f13	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user26@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	80.00	2025-10-18 14:20:26.576509+00
5fdffc10-f485-4677-a40a-0de6d7e1ee88	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user27@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	70.00	2025-10-18 14:20:26.576509+00
f71b8fe1-bf4e-4ac5-8ffe-24138b98fa90	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user28@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
58b2b117-e14d-415f-9885-0d7cae3b3cae	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user29@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
cf32403e-8705-42eb-9302-8d7dbb441673	d7bf8bf4-8282-4378-ae49-67b4d1a89471	c.user30@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	80.00	2025-10-18 14:20:26.576509+00
3e0370e4-8f2d-49f2-bbba-244817b322b6	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user1@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	70.00	2025-10-18 14:20:26.576509+00
510113ab-8ed8-45d5-a2db-231193d66c59	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user2@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	71.00	2025-10-18 14:20:26.576509+00
424cf3bc-afab-4472-a780-606877be2b84	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user3@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	72.00	2025-10-18 14:20:26.576509+00
af2be649-1ea3-44e2-bfb0-06fe66278109	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user4@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	73.00	2025-10-18 14:20:26.576509+00
31da6f2c-6db6-4eae-8e55-9c32f7cda9e7	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user5@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	74.00	2025-10-18 14:20:26.576509+00
dfa9fb10-d1ee-44cd-a893-caeac0d2cd4c	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user6@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	75.00	2025-10-18 14:20:26.576509+00
a0546fd1-8ef0-419f-af01-3d18bc17f7a4	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user7@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	76.00	2025-10-18 14:20:26.576509+00
3d5cd983-1ef6-4c31-b55d-551840d626c8	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user8@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	77.00	2025-10-18 14:20:26.576509+00
3068a733-307c-4a2c-9b6f-1beeba6dc18b	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user9@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	78.00	2025-10-18 14:20:26.576509+00
1a0c868e-33ac-480b-99f3-16881d4927f3	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user10@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	79.00	2025-10-18 14:20:26.576509+00
ce7a24dd-4be1-4773-9807-bb977a89a53c	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user11@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	80.00	2025-10-18 14:20:26.576509+00
8a408360-7179-46e8-9d06-efab6fbbd6b0	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user12@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	81.00	2025-10-18 14:20:26.576509+00
f52b4849-881c-4f38-baec-9e0f2437f1da	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user13@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	82.00	2025-10-18 14:20:26.576509+00
c4f1399f-e689-4189-bc06-ffe54ce3362c	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user14@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	83.00	2025-10-18 14:20:26.576509+00
ba7655d6-04bc-4ad0-9a6e-075926614bf3	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user15@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	84.00	2025-10-18 14:20:26.576509+00
ba0543a7-95bf-4ff9-9ec5-ae51f8b743ca	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user16@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	85.00	2025-10-18 14:20:26.576509+00
b96088a3-e14b-419a-afbc-c1aa6b5f3623	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user17@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	86.00	2025-10-18 14:20:26.576509+00
1826e28a-b69f-4efb-8174-8ef313c379e3	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user18@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	87.00	2025-10-18 14:20:26.576509+00
1d64bd68-94c6-421a-99f9-d101f35c367c	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user19@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	88.00	2025-10-18 14:20:26.576509+00
904f0638-47e8-4ac1-8d20-96ccf4170a9d	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user20@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	89.00	2025-10-18 14:20:26.576509+00
c855e552-d254-4780-81e5-33cb3c88f92c	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user21@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	90.00	2025-10-18 14:20:26.576509+00
d1823ee9-4b77-43e5-b7c5-a1ab3de6090c	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user22@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	91.00	2025-10-18 14:20:26.576509+00
b4c66168-2099-4712-87cd-cc931eac0c21	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user23@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	92.00	2025-10-18 14:20:26.576509+00
50a35f66-da0c-4779-91fc-8aea88f67457	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user24@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	93.00	2025-10-18 14:20:26.576509+00
61bd34bb-60ad-430e-9df1-1595a14736ab	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user25@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	94.00	2025-10-18 14:20:26.576509+00
496d7707-1d87-41aa-b236-8ccdb8606e89	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user26@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	95.00	2025-10-18 14:20:26.576509+00
ecfbd1f9-72b1-48b8-80dd-84c8757353e4	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user27@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	96.00	2025-10-18 14:20:26.576509+00
3ca23de8-2010-4cdb-8083-57287503dcbf	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user28@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	97.00	2025-10-18 14:20:26.576509+00
9106386b-3e5e-4ac8-bae7-889400672ee3	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user29@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	98.00	2025-10-18 14:20:26.576509+00
981971c1-9fef-4566-b066-c8bca96a9075	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user30@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	99.00	2025-10-18 14:20:26.576509+00
407ef138-85d9-452b-b615-52a0cd41ffcd	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user31@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	100.00	2025-10-18 14:20:26.576509+00
02581dfb-27a1-475d-aabb-008ba7d3be02	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user32@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	70.00	2025-10-18 14:20:26.576509+00
ed291acc-b8c8-42da-811b-63506ef4c490	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user33@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	75.00	2025-10-18 14:20:26.576509+00
43d394b8-0864-4b1e-ac52-e603a66015fe	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user34@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	80.00	2025-10-18 14:20:26.576509+00
7537489f-42c0-49da-907a-0a211057848f	aeac68e8-4c2c-4b49-ab74-fa91ba380306	g.user35@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	85.00	2025-10-18 14:20:26.576509+00
c5510a02-f821-456e-8e63-b9e78d6f307b	d334590d-b8b6-4066-8b39-ba9addde401e	k.user1@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	65.00	2025-10-18 14:20:26.576509+00
2208558f-31f7-4da4-82bd-30f4e16e8710	d334590d-b8b6-4066-8b39-ba9addde401e	k.user2@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	70.00	2025-10-18 14:20:26.576509+00
dd56a0c4-2a85-4cd4-9782-6f50b2e7c235	d334590d-b8b6-4066-8b39-ba9addde401e	k.user3@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	75.00	2025-10-18 14:20:26.576509+00
b7360bb2-1558-4074-8450-c61a3f844f24	d334590d-b8b6-4066-8b39-ba9addde401e	k.user4@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	80.00	2025-10-18 14:20:26.576509+00
ed470de4-b727-4667-a60f-ae7ad35c301e	d334590d-b8b6-4066-8b39-ba9addde401e	k.user5@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	85.00	2025-10-18 14:20:26.576509+00
0f6957d9-6f0c-48c8-b32c-8c2b65a7febd	d334590d-b8b6-4066-8b39-ba9addde401e	k.user6@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	90.00	2025-10-18 14:20:26.576509+00
2ca34118-6514-4d28-971b-ee61e8129a73	d334590d-b8b6-4066-8b39-ba9addde401e	k.user7@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	95.00	2025-10-18 14:20:26.576509+00
f076fbee-ef05-471c-b758-53ff7246b6f4	d334590d-b8b6-4066-8b39-ba9addde401e	k.user8@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	100.00	2025-10-18 14:20:26.576509+00
72ed3a08-066d-466a-a56c-fbeab61b6e02	d334590d-b8b6-4066-8b39-ba9addde401e	k.user9@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	65.00	2025-10-18 14:20:26.576509+00
e795a93d-f7c7-4fe8-bc10-dfa5234b5052	d334590d-b8b6-4066-8b39-ba9addde401e	k.user10@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	70.00	2025-10-18 14:20:26.576509+00
6ca9111b-762d-4d63-9807-2e8c4adde74a	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire1@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	75.00	2025-10-18 14:20:26.576509+00
de02ab43-2edd-421d-a07e-f52b09e682da	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire2@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	80.00	2025-10-18 14:20:26.576509+00
9e353bc4-8bf4-46c2-881d-4951c514d709	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire3@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	85.00	2025-10-18 14:20:26.576509+00
4ff717db-a277-4d08-b0e4-26db18edd1c9	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire4@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	90.00	2025-10-18 14:20:26.576509+00
c4d89c37-feb1-4c7f-bc88-9e4aa6a702e5	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire5@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	95.00	2025-10-18 14:20:26.576509+00
2f8ca0e2-1744-4a7e-8bdd-8e073594785c	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire6@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	100.00	2025-10-18 14:20:26.576509+00
2bc974cf-538f-4113-a695-93ee07e18ea7	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire7@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	75.00	2025-10-18 14:20:26.576509+00
72e79ab3-ae6f-4730-bbe6-3666aae0ba59	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire8@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	80.00	2025-10-18 14:20:26.576509+00
b3db0f3e-4b30-40bd-aad5-98e97355cc11	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire9@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	85.00	2025-10-18 14:20:26.576509+00
ee24a39f-0d18-4653-8314-658df6cb87f9	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire10@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	90.00	2025-10-18 14:20:26.576509+00
ff4b639b-a2e9-49b6-a44d-e4991221159b	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire11@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	95.00	2025-10-18 14:20:26.576509+00
895e5a5a-976d-4e2a-8497-2ae0e19e56a4	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire12@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	100.00	2025-10-18 14:20:26.576509+00
975c6042-dc2e-4c74-b90d-e32895dbbe63	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire13@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	75.00	2025-10-18 14:20:26.576509+00
a070fb07-a4c3-4675-927c-324d4d328763	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire14@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	80.00	2025-10-18 14:20:26.576509+00
59165d5e-58f8-447b-8b7f-1272bd575a57	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire15@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	85.00	2025-10-18 14:20:26.576509+00
0886e4a4-45c5-4c80-8d37-76efcb301cf0	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire16@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	90.00	2025-10-18 14:20:26.576509+00
f2eb67ad-c7bc-40ce-9bac-0c9a6b5d51c6	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire17@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	95.00	2025-10-18 14:20:26.576509+00
752ef928-6cb4-4a8b-91ab-a2cdab9af84d	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire18@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	100.00	2025-10-18 14:20:26.576509+00
926defb9-1e63-422a-a591-6b2f579085d8	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire19@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	75.00	2025-10-18 14:20:26.576509+00
692125b2-6abf-4bbb-b586-142456e1f0f3	1986dac2-6823-40fc-81db-cdc9ee09be5c	del.fire20@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	80.00	2025-10-18 14:20:26.576509+00
a636ca62-02f8-4afc-826b-18dbfadc249c	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn1@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	80.00	2025-10-18 14:20:26.576509+00
ee4252f7-26c1-40bb-969c-079d4dcb42ae	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn2@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	85.00	2025-10-18 14:20:26.576509+00
7c477cf9-e61f-4629-9f31-7a4afd03c505	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn3@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	90.00	2025-10-18 14:20:26.576509+00
52899102-049c-4b9f-ac5e-028f8c7c7644	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn4@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	95.00	2025-10-18 14:20:26.576509+00
11296ec3-777a-4032-a91b-2b07e6dd96d5	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn5@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	100.00	2025-10-18 14:20:26.576509+00
5120949d-f792-4ff3-822c-03399912784c	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn6@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	80.00	2025-10-18 14:20:26.576509+00
a2cc8f3b-9b90-4c33-8011-e59d1216143d	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn7@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	85.00	2025-10-18 14:20:26.576509+00
a0971a8f-af27-4c13-b8cc-ab38bfadd56a	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn8@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	90.00	2025-10-18 14:20:26.576509+00
bd74249d-09f0-4a95-91bb-5e4868910dd3	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn9@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	95.00	2025-10-18 14:20:26.576509+00
dfeb5402-02a9-4952-9727-2fbe737ae491	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn10@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	100.00	2025-10-18 14:20:26.576509+00
bdb1167a-1cad-42e0-bdcb-e276aa5b43f1	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn11@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	80.00	2025-10-18 14:20:26.576509+00
0332c7ff-2e58-40e9-ac75-74aeba3cb309	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn12@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	85.00	2025-10-18 14:20:26.576509+00
0a160846-58c7-48f4-a920-d01cad726557	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn13@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	90.00	2025-10-18 14:20:26.576509+00
d93823ec-2298-4082-9e9a-79ba36c24501	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn14@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	95.00	2025-10-18 14:20:26.576509+00
7dfb66e5-4243-4f1e-aea0-b6f3a755200d	3178fe47-fdce-462e-8051-5a6e370c3a4f	del.cbrn15@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	100.00	2025-10-18 14:20:26.576509+00
9eb4b94b-86cf-4cee-868b-621a70b35c7b	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake1@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	70.00	2025-10-18 14:20:26.576509+00
5cba3ab5-b52c-4366-8065-3563ef612324	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake2@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	75.00	2025-10-18 14:20:26.576509+00
edd2705e-84a4-42ba-b588-7bb45ecba773	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake3@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	80.00	2025-10-18 14:20:26.576509+00
88d03845-8e01-4373-bf37-bd11d712005d	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake4@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	85.00	2025-10-18 14:20:26.576509+00
08047585-3cf5-4be7-ac7d-a5bcfc4641f6	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake5@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	90.00	2025-10-18 14:20:26.576509+00
02200c4a-a981-4677-8bd0-c50063903b2f	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake6@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	95.00	2025-10-18 14:20:26.576509+00
420334ae-45a1-4aa6-b525-e3715301704e	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake7@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	100.00	2025-10-18 14:20:26.576509+00
b0cf87db-65bf-4a73-84ab-e75f80204729	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake8@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	70.00	2025-10-18 14:20:26.576509+00
35b72e51-9e4a-41cf-b026-c45f2d0d975e	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake9@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	75.00	2025-10-18 14:20:26.576509+00
0266ee20-82db-4976-bdd3-dd9fc654ae8f	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake10@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	80.00	2025-10-18 14:20:26.576509+00
b5023214-bb8e-4974-8c5f-f254d3e6e2c6	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake11@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	85.00	2025-10-18 14:20:26.576509+00
08caa503-af5c-4f88-be91-5dd4e1251f78	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake12@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	90.00	2025-10-18 14:20:26.576509+00
6d6b9f4b-59e0-477c-85cf-93ffeb76cd50	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake13@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	95.00	2025-10-18 14:20:26.576509+00
91ed4183-39f7-4f33-a9ba-5ecc9513aae2	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake14@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	100.00	2025-10-18 14:20:26.576509+00
a09b2a2d-4f1f-490e-bee2-28f4e25163e0	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake15@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	70.00	2025-10-18 14:20:26.576509+00
2a58a623-ef61-4663-aeea-bd1141fa648c	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake16@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	75.00	2025-10-18 14:20:26.576509+00
91c9d93e-d9fe-4e69-8226-985f3b243ab6	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake17@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	80.00	2025-10-18 14:20:26.576509+00
eb9df956-905b-47cb-9081-a483173afdee	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake18@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	85.00	2025-10-18 14:20:26.576509+00
71af920f-1e07-4c19-8202-3e72d3de7530	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake19@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	90.00	2025-10-18 14:20:26.576509+00
3cc86126-2fe9-461c-817f-ae1c60c6358c	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake20@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	95.00	2025-10-18 14:20:26.576509+00
039f6957-df05-4c84-bf1c-e8fa48896e78	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake21@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	100.00	2025-10-18 14:20:26.576509+00
69fae5ed-beeb-4a94-8bcc-e227329f0500	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake22@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	70.00	2025-10-18 14:20:26.576509+00
b6830dfa-e0dc-45e7-85a7-0173462eaaf4	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake23@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	75.00	2025-10-18 14:20:26.576509+00
3ffdd539-0100-472f-b91e-8098eb5ae470	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake24@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	80.00	2025-10-18 14:20:26.576509+00
2f212ba8-96bc-4115-9463-5db07049af03	ff72b0cd-9a42-4bef-8b08-22eff78ea07b	del.quake25@gmail.com	236e2247-a2a1-4dba-9c6b-805bbb931dc5	85.00	2025-10-18 14:20:26.576509+00
3cec7345-25f5-4cf5-b04e-942247395375	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire1@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	60.00	2025-10-18 14:20:26.576509+00
24aca756-2f63-426f-9ddd-cbb57aca1cc2	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire2@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	62.00	2025-10-18 14:20:26.576509+00
deebd2b1-5712-4037-b0e2-817d2a92d101	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire3@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	64.00	2025-10-18 14:20:26.576509+00
ce84a4d7-a153-4a73-8173-f82c51fc3292	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire4@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	66.00	2025-10-18 14:20:26.576509+00
6ea4387e-5bec-4fba-9be5-26db1b43d0b2	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire5@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	68.00	2025-10-18 14:20:26.576509+00
7a10e50a-b068-40c8-a939-24761e58a14d	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire6@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	70.00	2025-10-18 14:20:26.576509+00
a2524464-6f46-408d-982a-47b2551398a5	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire7@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	72.00	2025-10-18 14:20:26.576509+00
1748d27f-93e2-4bd9-8d64-3755661f38e7	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire8@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	74.00	2025-10-18 14:20:26.576509+00
a85864c9-f792-417f-871c-d17643b9d17f	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire9@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	76.00	2025-10-18 14:20:26.576509+00
1f28ebae-f0a9-40f2-b488-6465f956a691	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire10@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	78.00	2025-10-18 14:20:26.576509+00
83640571-6827-44f9-9b0c-27deb2b2827b	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire11@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	80.00	2025-10-18 14:20:26.576509+00
02238106-0948-42da-85a7-1bc7956e6b20	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire12@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	82.00	2025-10-18 14:20:26.576509+00
cd612bd5-ea6a-42cc-8f17-65ef59e9c3bc	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire13@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	84.00	2025-10-18 14:20:26.576509+00
f9c48ff3-2cd1-436b-b781-8409b3762bdb	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire14@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	86.00	2025-10-18 14:20:26.576509+00
dc268f23-afe7-4153-9244-5f3fb73e2826	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire15@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	88.00	2025-10-18 14:20:26.576509+00
9774cf44-6f9d-4a06-822a-5f3d867a67e3	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire16@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	90.00	2025-10-18 14:20:26.576509+00
0e5bf06c-e2bf-474c-8144-e675a120512b	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire17@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	92.00	2025-10-18 14:20:26.576509+00
86ebabd9-fb22-484c-b800-6e1c214898a2	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire18@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	94.00	2025-10-18 14:20:26.576509+00
4faffeed-40cb-4b7d-82bd-d55793528315	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire19@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	96.00	2025-10-18 14:20:26.576509+00
94e24a4e-85f1-4ca3-94e5-ef42abdad875	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire20@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	98.00	2025-10-18 14:20:26.576509+00
a89b7644-4ab2-47f8-befb-3549fb61888f	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire21@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	100.00	2025-10-18 14:20:26.576509+00
24a85ce1-9a02-4ffc-b725-c616c85d3ea7	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire22@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	60.00	2025-10-18 14:20:26.576509+00
b2a5b532-17ba-47e0-884e-203c9bfeb660	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire23@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	62.00	2025-10-18 14:20:26.576509+00
2b8c18a0-a966-4d47-836e-bf32d3809a74	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire24@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	64.00	2025-10-18 14:20:26.576509+00
13277c8b-b768-4e4a-a20d-90530b3a62f9	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire25@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	66.00	2025-10-18 14:20:26.576509+00
ade7806d-cf61-4b8b-b89b-c83adb155405	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire26@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	68.00	2025-10-18 14:20:26.576509+00
ade5da8a-fc79-4caf-90c8-ca14b8686566	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire27@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	70.00	2025-10-18 14:20:26.576509+00
3056c451-9612-485b-8834-bb524971896b	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire28@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	72.00	2025-10-18 14:20:26.576509+00
495064b0-d655-4b0a-b274-e04c3e801b5b	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire29@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	74.00	2025-10-18 14:20:26.576509+00
8ff2e5b4-cb04-451f-b914-bca95f213c33	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire30@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	76.00	2025-10-18 14:20:26.576509+00
5917a592-ea2b-4052-ad14-be4d9580dcd0	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire31@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	78.00	2025-10-18 14:20:26.576509+00
67ec20d8-910c-45c0-88d7-6b1ee1a0b313	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire32@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	80.00	2025-10-18 14:20:26.576509+00
46ce53aa-30ec-42f2-8aff-c333ba0ae458	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire33@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	82.00	2025-10-18 14:20:26.576509+00
85552aad-1b57-455c-97a7-769519688392	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire34@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	84.00	2025-10-18 14:20:26.576509+00
6ffeb6ea-10ae-407c-9211-49d1d3c22592	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire35@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	86.00	2025-10-18 14:20:26.576509+00
ba9d5d5f-a39c-403f-8afd-ec07d42d620b	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire36@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	88.00	2025-10-18 14:20:26.576509+00
56e6713c-ae76-4217-bad9-28e8107601ea	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire37@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	90.00	2025-10-18 14:20:26.576509+00
fce7bd06-5c7c-484d-91a0-6815b481fb53	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire38@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	92.00	2025-10-18 14:20:26.576509+00
0cf938d1-917c-4b62-b158-833d59cf911d	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire39@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	94.00	2025-10-18 14:20:26.576509+00
3a18213b-0af6-4c01-acd0-ed5d642b4853	5ed43432-281c-492d-8800-f89e218b2a3c	m.fire40@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	96.00	2025-10-18 14:20:26.576509+00
acd66284-8753-4a46-a983-c461b2d58aea	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn1@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	70.00	2025-10-18 14:20:26.576509+00
8207c56d-92a9-44b3-a2ff-a2faa5536407	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn2@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	75.00	2025-10-18 14:20:26.576509+00
a3a78759-4ee8-4b48-aa4e-f68e52486836	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn3@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	80.00	2025-10-18 14:20:26.576509+00
4cb9e22f-c315-4ab3-a7a9-f965d7128f9a	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn4@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	85.00	2025-10-18 14:20:26.576509+00
fe82913b-6c6b-43d2-98b6-3a15305255b8	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn5@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	90.00	2025-10-18 14:20:26.576509+00
63035a44-c4a3-4807-8d22-e4dfbe96a103	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn6@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	95.00	2025-10-18 14:20:26.576509+00
a0cf3221-770d-476f-ae4a-4b4a90162edb	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn7@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	100.00	2025-10-18 14:20:26.576509+00
a61952a9-d53b-499c-8688-a706884b3b59	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn8@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	70.00	2025-10-18 14:20:26.576509+00
1ee3c9d2-c0d4-4b12-afbf-a4d5cf93223d	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn9@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	75.00	2025-10-18 14:20:26.576509+00
c07f89b8-992a-470b-991a-acd5f0fac423	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn10@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	80.00	2025-10-18 14:20:26.576509+00
63c523a5-e709-49b5-b749-9530a7d250a4	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn11@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	85.00	2025-10-18 14:20:26.576509+00
fb8e9c6a-4e94-4ed6-bb6b-73f40cf4dae8	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn12@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	90.00	2025-10-18 14:20:26.576509+00
65ef6213-24db-4af8-8c44-1ffa6aa36786	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn13@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	95.00	2025-10-18 14:20:26.576509+00
c9a6eb28-7cc8-4435-8a01-5c5e4724e644	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn14@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	100.00	2025-10-18 14:20:26.576509+00
4a509838-147b-4a2e-b6ca-36447a2e9e2a	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	pune.cbrn15@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	70.00	2025-10-18 14:20:26.576509+00
1e596810-d8ab-454e-9f84-6bf87152f792	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood1@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	65.00	2025-10-18 14:20:26.576509+00
d09e588b-bd1c-4b36-9108-824961c562a2	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood2@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	70.00	2025-10-18 14:20:26.576509+00
05a63831-0bd7-4d49-84bb-b5849c592463	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood3@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	75.00	2025-10-18 14:20:26.576509+00
7db5ac4c-5921-41ba-871a-aa8212ede43c	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood4@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	80.00	2025-10-18 14:20:26.576509+00
1250b40a-c8b1-4f8a-8814-10e4083e20d1	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood5@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	85.00	2025-10-18 14:20:26.576509+00
f96353c4-5e1a-42ee-9061-67baf7a29f8b	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood6@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	90.00	2025-10-18 14:20:26.576509+00
5dba8776-a8f0-43bc-9455-a29fbdf4cb5d	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood7@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	95.00	2025-10-18 14:20:26.576509+00
3270f3c8-668e-4b8e-b332-25354fc0bfde	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood8@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	100.00	2025-10-18 14:20:26.576509+00
437687b7-abcc-4042-8c69-803706afcd18	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood9@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	65.00	2025-10-18 14:20:26.576509+00
f49d66b0-4b22-4155-8db6-5756299af7ab	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood10@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	70.00	2025-10-18 14:20:26.576509+00
4c0447ab-77f4-49a3-a653-ca03a831ad5c	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood11@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	75.00	2025-10-18 14:20:26.576509+00
b064f116-a661-443b-ab22-45d14edc498c	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood12@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	80.00	2025-10-18 14:20:26.576509+00
e4f940a1-36b8-4efc-bb6b-6fefb210e07a	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood13@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	85.00	2025-10-18 14:20:26.576509+00
339d9a43-5569-47b9-93cb-5765f102cacf	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood14@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	90.00	2025-10-18 14:20:26.576509+00
44d9a303-a92c-47db-871e-574868de7c9b	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood15@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	95.00	2025-10-18 14:20:26.576509+00
850b41a3-c5d2-48b8-8305-ad38d1aac6b5	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood16@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	100.00	2025-10-18 14:20:26.576509+00
2e478d8e-9ab0-4824-a7cc-2032794c3e94	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood17@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	65.00	2025-10-18 14:20:26.576509+00
1d8a5545-a95e-4d40-88f9-534e372218c6	33576a7b-e74d-4d91-a04f-6f15d3577458	m.flood18@gmail.com	c5b001a1-8a8b-4b1f-9a9b-7b0a8b0a8b0a	70.00	2025-10-18 14:20:26.576509+00
2f7ca669-9970-453a-b72a-70ae56a5fcb2	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone1@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	70.00	2025-10-18 14:20:26.576509+00
15e2f844-9c1e-4913-b57b-54cf377e5595	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone2@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	75.00	2025-10-18 14:20:26.576509+00
63f9d0da-923b-42ae-8ced-5ab7ef66655b	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone3@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	80.00	2025-10-18 14:20:26.576509+00
a086067a-bc8a-425a-b1cb-1fda21831d40	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone4@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	85.00	2025-10-18 14:20:26.576509+00
036fe897-d68c-4a8d-beaf-a2a93c6a063b	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone5@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
52caf8ed-c272-41cd-a5ae-5e01f5445883	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone6@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	95.00	2025-10-18 14:20:26.576509+00
ff53306d-8c9c-48cc-8e7a-a26978129213	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone7@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	100.00	2025-10-18 14:20:26.576509+00
07223d13-e3d7-46fc-b768-c6ee6e7ef29f	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone8@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	70.00	2025-10-18 14:20:26.576509+00
0674b2d3-7ff5-4fe0-9e16-db32f3e54410	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone9@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	75.00	2025-10-18 14:20:26.576509+00
bc6d8360-9177-45b7-ab21-74bda3a93f67	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone10@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	80.00	2025-10-18 14:20:26.576509+00
bdfddfbb-d482-4d59-b0da-434bf752d055	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone11@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	85.00	2025-10-18 14:20:26.576509+00
0da17cbe-5767-4fc8-a3f1-0e1a5a7a474c	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone12@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
c6aa6daa-8a11-4658-87a3-1f6875812df9	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone13@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	95.00	2025-10-18 14:20:26.576509+00
75a04332-1d9c-4d63-b6d9-9c75d8858292	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone14@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	100.00	2025-10-18 14:20:26.576509+00
23ab1c80-a0fc-4a58-ac2e-022045fc1a9a	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone15@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	70.00	2025-10-18 14:20:26.576509+00
34822e88-ae41-4c79-8122-4513483c124d	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone16@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	75.00	2025-10-18 14:20:26.576509+00
8f073a12-00f5-4e1c-b987-76da52056a8f	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone17@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	80.00	2025-10-18 14:20:26.576509+00
bdad567a-2c15-4c00-8edc-11d6be047f6e	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone18@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	85.00	2025-10-18 14:20:26.576509+00
d371ee06-e389-45b6-a42a-0684518b8ab3	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone19@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	90.00	2025-10-18 14:20:26.576509+00
98418b09-ec32-41c0-84ee-a556d3e03288	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone20@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	95.00	2025-10-18 14:20:26.576509+00
f77d9e38-530b-40de-82c7-1808c46e90c4	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone21@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	100.00	2025-10-18 14:20:26.576509+00
e1a8be49-a23d-490a-a6d8-5dd21211a6ed	b8cd08ad-147c-45a9-967e-cd93668e5e1c	k.cyclone22@gmail.com	4549aee2-4896-461c-8e37-a12e38733001	70.00	2025-10-18 14:20:26.576509+00
0d4a568c-b9db-4e52-83c4-c4951d3b8f2e	b76f8cd6-47ec-478d-87c8-35485203d064	k.fire1@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	75.00	2025-10-18 14:20:26.576509+00
abc3a0fa-e064-4eae-800a-03a1570c8b4a	b76f8cd6-47ec-478d-87c8-35485203d064	k.fire2@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	80.00	2025-10-18 14:20:26.576509+00
8a982de6-98f6-4690-ab1c-4d7b14848bae	b76f8cd6-47ec-478d-87c8-35485203d064	k.fire3@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	85.00	2025-10-18 14:20:26.576509+00
2c118471-16ac-4d82-8961-fec8ac0827ba	b76f8cd6-47ec-478d-87c8-35485203d064	k.fire4@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	90.00	2025-10-18 14:20:26.576509+00
3487db0f-445b-4f61-a128-62c961f5fea4	b76f8cd6-47ec-478d-87c8-35485203d064	k.fire5@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	95.00	2025-10-18 14:20:26.576509+00
1c71e123-8551-4360-848a-6655bec413de	b76f8cd6-47ec-478d-87c8-35485203d064	k.fire6@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	100.00	2025-10-18 14:20:26.576509+00
a64dbe39-cdfd-48fa-abaf-c231ff2bbe08	b76f8cd6-47ec-478d-87c8-35485203d064	k.fire7@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	75.00	2025-10-18 14:20:26.576509+00
b2393554-83c2-4adc-bf05-1a077e37b12a	b76f8cd6-47ec-478d-87c8-35485203d064	k.fire8@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	80.00	2025-10-18 14:20:26.576509+00
8481c7fa-0b0c-4236-9fff-2bfc7792d594	b76f8cd6-47ec-478d-87c8-35485203d064	k.fire9@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	85.00	2025-10-18 14:20:26.576509+00
ef77600f-ffc9-4ab4-bb9f-89c9a6bcb7a6	b76f8cd6-47ec-478d-87c8-35485203d064	k.fire10@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	90.00	2025-10-18 14:20:26.576509+00
e41cbdd8-cc2c-4e7c-b080-364d8765875a	b76f8cd6-47ec-478d-87c8-35485203d064	k.fire11@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	95.00	2025-10-18 14:20:26.576509+00
0b47555d-6d7f-4448-8df0-f157abca520b	b76f8cd6-47ec-478d-87c8-35485203d064	k.fire12@gmail.com	18ad310b-46bb-4607-ac04-8f61ae9c2058	100.00	2025-10-18 14:20:26.576509+00
f7b71665-2366-440d-bf05-6d8630b424e8	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	satyam@gmail.com	df4120a2-2a49-4d70-a451-82e567ebf95e	66.67	2025-12-07 18:09:43.977323+00
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: sajagadmin
--

COPY public.questions (id, assessment_id, question_text, question_order) FROM stdin;
8065209d-787f-4569-87d7-398d0e7f9ed8	236e2247-a2a1-4dba-9c6b-805bbb931dc5	During an earthquake, what is the primary recommended action?	1
080c66de-ba71-49ee-8a94-dfe3c4b34290	236e2247-a2a1-4dba-9c6b-805bbb931dc5	After the shaking stops, what is a critical safety check you should perform in your home?	2
e65c0d6c-497e-4fd1-b8d0-de5f81a89d79	236e2247-a2a1-4dba-9c6b-805bbb931dc5	If you are outdoors during an earthquake, where is the safest place to be?	3
f257bc0a-d37e-4c68-9e46-35381e8800b0	530f9143-8ace-4760-a589-f7ed15cf56c8	Which of these is a common warning sign of an impending landslide?	1
b1d5ba60-c7b6-42d4-a62d-171928710c2f	530f9143-8ace-4760-a589-f7ed15cf56c8	If you are caught in a landslide, what is the recommended survival action?	2
05143e9f-a5e7-4864-a4d8-70fbf207f758	530f9143-8ace-4760-a589-f7ed15cf56c8	Which area is generally safest to build a home to avoid landslide risk?	3
58e2af5e-6f5b-490f-b243-fcbc96426510	18ad310b-46bb-4607-ac04-8f61ae9c2058	What does the acronym P.A.S.S. stand for when using a fire extinguisher?	1
44d24c2d-3a39-4e79-bfce-505a91f12c47	18ad310b-46bb-4607-ac04-8f61ae9c2058	If your clothes catch on fire, you should immediately:	2
934a183e-1bd6-4e3f-9fcd-945c459fc479	18ad310b-46bb-4607-ac04-8f61ae9c2058	What is the first thing you should do upon discovering a fire in a building?	3
5abeafd1-1865-4267-adc3-301eb203b195	df4120a2-2a49-4d70-a451-82e567ebf95e	What does the "R" in CBRN stand for?	1
13000a33-ee5a-4a71-aadb-aaab4db1a9d1	df4120a2-2a49-4d70-a451-82e567ebf95e	In the event of an outdoor chemical agent release, what is the safest immediate direction to move?	2
12db47b2-3943-464d-98bb-293c2ee03aaf	df4120a2-2a49-4d70-a451-82e567ebf95e	What is the primary goal of a "Shelter-in-Place" procedure?	3
e16d162a-5e67-4071-9336-1cc53f24fdc0	4549aee2-4896-461c-8e37-a12e38733001	What is generally the most dangerous element of a cyclone in coastal areas?	1
f6d5bcb2-396f-4da3-a046-a73f27766170	4549aee2-4896-461c-8e37-a12e38733001	Before a cyclone makes landfall, what is a key preparedness action for your home?	2
1d7bfb6f-ec9a-4047-a808-db07635de0d6	4549aee2-4896-461c-8e37-a12e38733001	During a cyclone, where is the safest place to take shelter in a typical house?	3
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: sajagadmin
--

COPY public.system_settings (key, value) FROM stdin;
risk_refresh_hours	6
\.


--
-- Data for Name: training_photos; Type: TABLE DATA; Schema: public; Owner: sajagadmin
--

COPY public.training_photos (id, training_id, image_url, uploaded_at, image_data, mime_type) FROM stdin;
b61eb585-5b04-4d9a-b553-939ff15b7fa9	3178fe47-fdce-462e-8051-5a6e370c3a4f	/uploads/b8fe73a90545e5a294e1b347e5d71fa9	2025-10-18 18:53:30.705842+00	\N	\N
eaee4d80-88ab-4649-9c59-f0b3fcfc5cb1	1f16e39c-24b9-4be2-b2af-5075d2ab38d7	/uploads/a5089808a76f28417a747699fe1b1cf0	2025-12-07 18:10:11.096014+00	\N	\N
\.


--
-- Data for Name: trainings; Type: TABLE DATA; Schema: public; Owner: sajagadmin
--

COPY public.trainings (id, title, theme, start_date, end_date, location_text, latitude, longitude, creator_user_id, created_at) FROM stdin;
13492b89-e506-4818-bf39-946f8ba79aa3	Operation Hillview Ready (Recent)	Landslide	2025-10-10	2025-10-11	Dehradun, Uttarakhand	30.316500	78.032200	2abad8e7-f28d-498a-8bce-8a0bf962717e	2025-10-18 14:20:26.576509+00
df0b8ca5-a3f9-48a3-bf4d-0cb6af8de752	Alpine Fire Drill (Old)	Fire Safety	2023-11-15	2023-11-16	Dehradun, Uttarakhand	30.316500	78.032200	2abad8e7-f28d-498a-8bce-8a0bf962717e	2025-10-18 14:20:26.576509+00
d7bf8bf4-8282-4378-ae49-67b4d1a89471	Coastal Cyclone Drill (Recent, High Sat.)	Cyclone	2025-10-01	2025-10-02	Cuttack, Odisha	20.462500	85.883000	22148368-dd7f-4d56-ab7e-415653453f7b	2025-10-18 14:20:26.576509+00
aeac68e8-4c2c-4b49-ab74-fa91ba380306	Brahmaputra Quake-Ready (Old, High Sat.)	Earthquake	2023-10-20	2023-10-21	Guwahati, Assam	26.144500	91.736200	22148368-dd7f-4d56-ab7e-415653453f7b	2025-10-18 14:20:26.576509+00
d334590d-b8b6-4066-8b39-ba9addde401e	Kolkata Urban Fire Safety	Fire Safety	2025-09-05	2025-09-06	Kolkata, West Bengal	22.572600	88.363900	22148368-dd7f-4d56-ab7e-415653453f7b	2025-10-18 14:20:26.576509+00
1986dac2-6823-40fc-81db-cdc9ee09be5c	Delhi Metro Fire Response	Fire Safety	2025-09-15	2025-09-16	Delhi, Delhi	28.704100	77.102500	53a12c23-2f2c-4bc3-acac-b4a8aa676a5b	2025-10-18 14:20:26.576509+00
3178fe47-fdce-462e-8051-5a6e370c3a4f	Capital CBRN Awareness (Very Old)	CBRN	2022-10-18	2022-10-19	Delhi, Delhi	28.704100	77.102500	53a12c23-2f2c-4bc3-acac-b4a8aa676a5b	2025-10-18 14:20:26.576509+00
ff72b0cd-9a42-4bef-8b08-22eff78ea07b	NCR Earthquake Prep	Earthquake	2025-08-20	2025-08-21	Delhi, Delhi	28.704100	77.102500	af07c423-3ab0-471e-b97e-d8117b25de05	2025-10-18 14:20:26.576509+00
5ed43432-281c-492d-8800-f89e218b2a3c	Mumbai High-Rise Fire Drill	Fire Safety	2025-07-10	2025-07-11	Mumbai, Maharashtra	19.076000	72.877700	8cc96623-fb74-4f54-9430-bc4044808dc6	2025-10-18 14:20:26.576509+00
1f16e39c-24b9-4be2-b2af-5075d2ab38d7	Pune Industrial CBRN Safety	CBRN	2025-04-05	2025-04-06	Pune, Maharashtra	18.520400	73.856700	8cc96623-fb74-4f54-9430-bc4044808dc6	2025-10-18 14:20:26.576509+00
33576a7b-e74d-4d91-a04f-6f15d3577458	Mumbai Monsoon Flood Ready	Flood	2025-05-20	2025-05-21	Mumbai, Maharashtra	19.076000	72.877700	8cc96623-fb74-4f54-9430-bc4044808dc6	2025-10-18 14:20:26.576509+00
b8cd08ad-147c-45a9-967e-cd93668e5e1c	Konkan Cyclone Shield (Old)	Cyclone	2024-10-15	2024-10-16	Mumbai, Maharashtra	19.076000	72.877700	aa9c5259-d912-401d-a073-76f44ae60684	2025-10-18 14:20:26.576509+00
b76f8cd6-47ec-478d-87c8-35485203d064	Coastal Community Fire Safety	Fire Safety	2025-08-01	2025-08-02	Mumbai, Maharashtra	19.076000	72.877700	aa9c5259-d912-401d-a073-76f44ae60684	2025-10-18 14:20:26.576509+00
\.


--
-- Data for Name: user_announcement_views; Type: TABLE DATA; Schema: public; Owner: sajagadmin
--

COPY public.user_announcement_views (user_id, announcement_id, viewed_at) FROM stdin;
5f617852-1ba6-4ac1-8086-ef5222eae408	ce02c557-ea10-4516-8821-eacd3822907a	2025-10-15 18:24:16.943793+00
67b9e61e-1f73-452c-8a4c-599b9c159dec	ce02c557-ea10-4516-8821-eacd3822907a	2025-10-15 18:27:23.426377+00
8cc96623-fb74-4f54-9430-bc4044808dc6	ce02c557-ea10-4516-8821-eacd3822907a	2025-10-15 18:28:59.026131+00
af07c423-3ab0-471e-b97e-d8117b25de05	ce02c557-ea10-4516-8821-eacd3822907a	2025-10-18 18:54:17.402919+00
67b9e61e-1f73-452c-8a4c-599b9c159dec	f8cb8e64-b1e6-4cac-985c-5e51ed8e1eef	2025-10-19 13:29:28.080629+00
5f617852-1ba6-4ac1-8086-ef5222eae408	f8cb8e64-b1e6-4cac-985c-5e51ed8e1eef	2025-10-19 13:31:10.81234+00
5f617852-1ba6-4ac1-8086-ef5222eae408	9eff9a15-3b3d-4763-a292-59f45f44bcbd	2025-10-19 13:32:18.281765+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sajagadmin
--

COPY public.users (id, name, email, password_hash, role, organization_name, created_at, updated_at, status, state, document_url) FROM stdin;
d794b8aa-28a8-422a-8371-b97b3fe474e5	Kolkata Response Team	krt@ngo.wb	$2b$10$Cy1a2UGcwA9oQ1rB91JY6eWVH/J/H2x/MHmXYUXfZ9/xQoQi6EBQ.	training_partner	Kolkata Civic Response	2025-10-13 06:58:07.29642+00	2025-10-13 06:58:07.29642+00	pending	West Bengal	/uploads/b83422e51e7aee891696954e6ca78ccd
5f617852-1ba6-4ac1-8086-ef5222eae408	National Admin	ndma@gov.in	$2b$10$KRehCA.eYyraj0fvgpE20OnnsT/SrvP9nFVbny/eKrSQn6bpZK/TS	ndma_admin	National Disaster Management Authority	2025-10-13 06:41:02.643216+00	2025-10-13 06:41:02.643216+00	active	Delhi	/uploads/fc7ed9581670edbb6fee6810f0856bad
67b9e61e-1f73-452c-8a4c-599b9c159dec	SDMA Delhi	sdma.delhi@gov.in	$2b$10$pRpkrDp.bdTsUDrwUBTRpeVWE8H25CnuVZSuVy0qd/wzjmeFH10BS	sdma_admin	Delhi DMA	2025-10-13 06:42:25.230023+00	2025-10-13 06:42:25.230023+00	active	Delhi	/uploads/5dba611ebf344b8bd7d8f6b4d8dd4c02
66b99aac-bd90-429c-8e1a-d5f738473656	SDMA Maharashtra	sdma.maha@gov.in	$2b$10$PFt/NRR9l3pK9/9y/LiJJu/cia96YK9ZdqnFAvUUzdm107sa0vxjW	sdma_admin	Maharashtra DMA	2025-10-13 06:44:07.290169+00	2025-10-13 06:44:07.290169+00	active	Maharashtra	/uploads/a007b4746d7ca5a6d5d67e6758063e5e
3cb92b63-e0b5-4763-852a-83ca96185720	SDMA West Bengal	sdma.wb@gov.in	$2b$10$er9uIYa8sqpmPHyHsx3kGujmBk.M6ev22/sd76SVt01EgxIqiPfUu	sdma_admin	West Bengal DMA	2025-10-13 06:46:04.49185+00	2025-10-13 06:46:04.49185+00	active	West Bengal	/uploads/f9530a05b70b7d4f78f1009bb22514aa
2bed43e4-de6b-481f-b6a0-30a2df39ac3d	SDMA Uttarakhand	sdma.uk@gov.in	$2b$10$xtW1V1rb91Vc1VuPPtEbYu9o9sg/0XetIjwEYRB6ikqxd6t3e0uNm	sdma_admin	Uttarakhand DMA	2025-10-13 06:47:06.175658+00	2025-10-13 06:47:06.175658+00	active	Uttarakhand	/uploads/4f7c48799cdc983a94242ca7754e376c
8cc96623-fb74-4f54-9430-bc4044808dc6	Sahayata Foundation	sahayata@ngo.maha	$2b$10$7R6UyXUgGsUHcfu8mIz1peMFvWegjnVIadGZxgVLKiowKB/5nvqvC	training_partner	Sahayata Foundation Mumbai	2025-10-13 06:51:01.867313+00	2025-10-13 06:51:01.867313+00	active	Maharashtra	/uploads/6db1ff43050f942c45ab838cab40ac76
aa9c5259-d912-401d-a073-76f44ae60684	Konkan Coastal Guards	kcg@ngo.maha	$2b$10$YiXGzxEMsisEH.UL/dG74O6NgDZLYdElARg.2P2/34kvucJ.BO7NK	training_partner	Konkan Coastal Guards	2025-10-13 06:51:56.258057+00	2025-10-13 06:51:56.258057+00	active	Maharashtra	/uploads/d169b4d04f58463d55bdb3011ea0de9e
22148368-dd7f-4d56-ab7e-415653453f7b	Sundarban Tigers	sundarban.tigers@ngo.wb	$2b$10$6poxGnA4kslc87mlbeCQE.QUqH9cX2VTm0je6P2jMFWUavgPzvrTu	training_partner	Sundarban Tigers Rescue	2025-10-13 06:53:47.97485+00	2025-10-13 06:53:47.97485+00	active	West Bengal	/uploads/568292a23755d39df64a33e68ed74222
2abad8e7-f28d-498a-8bce-8a0bf962717e	Himalayan Saviours	hs@ngo.uk	$2b$10$WVDRBWejcwzwi4A0hbaFmeHH6lnhoYowZ364IW7ZRL4KWDSj/Z/z2	training_partner	Himalayan Saviours Foundation	2025-10-13 06:55:18.98087+00	2025-10-13 06:55:18.98087+00	active	Uttarakhand	/uploads/0d6037b15b83764740ea2a3b31994f4c
8f917cf8-cdac-4267-a277-151c7a5e83ec	fe	re@ds	$2b$10$mpFQpTS2vZIhoK4ti9tzBu9yAkxwjXeu43jYoXaGJEm4bPQeL8loq	training_partner	fddf	2025-10-14 18:04:31.818669+00	2025-10-14 18:04:31.818669+00	pending	Sikkim	/uploads/d404cbb0bcf453d84287f615759f1a97
88b2fc61-17fe-46df-a08f-0429230e7684	delhi sample partner	dsp1.delhi@ngo.in	$2b$10$jBGxdK0f8ioARFWsym86Hez3QtBat78ck2V1lvRBLcx3ccS0nXLlC	training_partner	DSP!	2025-10-19 13:23:27.627501+00	2025-10-19 13:23:27.627501+00	rejected	Delhi	/uploads/fc8811f4d498d5cb8570d78fe8651d26
53a12c23-2f2c-4bc3-acac-b4a8aa676a5b	Urban Safety Group	usg@ngo.delhi	$2b$10$1ipRXHxH2hx0GF1CfIqKA.pFpR1i2i/QjluvgRD63i71crc.iBdna	training_partner	Urban Safety Group	2025-10-13 06:56:42.874512+00	2025-10-13 06:56:42.874512+00	active	Delhi	/uploads/7f081a3846144c7f5c19d0e357ac8331
af07c423-3ab0-471e-b97e-d8117b25de05	Delhi Civil Defence	dcd@ngo.delhi	$2b$10$IPHqqrsrNvIw0vE2NDxrceJ2o/V4xsLf2Vqj.c8bt01p8r0PBA79a	training_partner	Delhi Civil Defence Volunteers	2025-10-13 06:49:04.53642+00	2025-10-13 06:49:04.53642+00	active	Delhi	/uploads/f8f74342d4dc56b9dc75d5e8a30f80ff
\.


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_training_theme_key; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_training_theme_key UNIQUE (training_theme);


--
-- Name: districts districts_name_state_key; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_name_state_key UNIQUE (name, state);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: options options_pkey; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.options
    ADD CONSTRAINT options_pkey PRIMARY KEY (id);


--
-- Name: participant_submissions participant_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.participant_submissions
    ADD CONSTRAINT participant_submissions_pkey PRIMARY KEY (id);


--
-- Name: participant_submissions participant_submissions_training_id_participant_email_key; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.participant_submissions
    ADD CONSTRAINT participant_submissions_training_id_participant_email_key UNIQUE (training_id, participant_email);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (key);


--
-- Name: training_photos training_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.training_photos
    ADD CONSTRAINT training_photos_pkey PRIMARY KEY (id);


--
-- Name: trainings trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_pkey PRIMARY KEY (id);


--
-- Name: user_announcement_views user_announcement_views_pkey; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.user_announcement_views
    ADD CONSTRAINT user_announcement_views_pkey PRIMARY KEY (user_id, announcement_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_creator_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_creator_user_id_fkey FOREIGN KEY (creator_user_id) REFERENCES public.users(id);


--
-- Name: options options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.options
    ADD CONSTRAINT options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: participant_submissions participant_submissions_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.participant_submissions
    ADD CONSTRAINT participant_submissions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- Name: participant_submissions participant_submissions_training_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.participant_submissions
    ADD CONSTRAINT participant_submissions_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.trainings(id);


--
-- Name: questions questions_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: training_photos training_photos_training_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.training_photos
    ADD CONSTRAINT training_photos_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.trainings(id) ON DELETE CASCADE;


--
-- Name: trainings trainings_creator_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_creator_user_id_fkey FOREIGN KEY (creator_user_id) REFERENCES public.users(id);


--
-- Name: user_announcement_views user_announcement_views_announcement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.user_announcement_views
    ADD CONSTRAINT user_announcement_views_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES public.announcements(id) ON DELETE CASCADE;


--
-- Name: user_announcement_views user_announcement_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sajagadmin
--

ALTER TABLE ONLY public.user_announcement_views
    ADD CONSTRAINT user_announcement_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict mudm9l7JCiedHwRDEcQdPfTzQ6Rvc5HBSKNfGo6abOkUUObQ9BObhuLG2Bh2Get

