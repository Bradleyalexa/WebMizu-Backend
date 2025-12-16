


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."address_type" AS ENUM (
    'apartment',
    'rumah',
    'company'
);


ALTER TYPE "public"."address_type" OWNER TO "postgres";


CREATE TYPE "public"."contract_status" AS ENUM (
    'active',
    'expired'
);


ALTER TYPE "public"."contract_status" OWNER TO "postgres";


CREATE TYPE "public"."invoice_related_type" AS ENUM (
    'order',
    'contract',
    'service',
    'other'
);


ALTER TYPE "public"."invoice_related_type" OWNER TO "postgres";


CREATE TYPE "public"."invoice_status" AS ENUM (
    'draft',
    'sent',
    'paid',
    'cancelled'
);


ALTER TYPE "public"."invoice_status" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
    'service_reminder',
    'invoice_created',
    'payment_received',
    'contract_expiring',
    'contract_activated',
    'service_completed',
    'general'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."order_status" AS ENUM (
    'pending',
    'paid',
    'cancelled'
);


ALTER TYPE "public"."order_status" OWNER TO "postgres";


CREATE TYPE "public"."product_status" AS ENUM (
    'active',
    'inactive',
    'tradeIn'
);


ALTER TYPE "public"."product_status" OWNER TO "postgres";


CREATE TYPE "public"."schedule_status" AS ENUM (
    'pending',
    'done',
    'canceled'
);


ALTER TYPE "public"."schedule_status" OWNER TO "postgres";


CREATE TYPE "public"."service_type" AS ENUM (
    'contract',
    'perpanggil'
);


ALTER TYPE "public"."service_type" OWNER TO "postgres";


CREATE TYPE "public"."task_status" AS ENUM (
    'pending',
    'completed',
    'canceled'
);


ALTER TYPE "public"."task_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'customer'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    'customer',
    coalesce(new.raw_user_meta_data ->> 'name', 'New User')
  );

  insert into public.customers (id)
  values (new.id);

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "sender_role" "public"."user_role" NOT NULL,
    "message" "text" NOT NULL,
    "attachments" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contracts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_product_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "interval_months" integer NOT NULL,
    "total_service" integer NOT NULL,
    "services_used" integer DEFAULT 0,
    "status" "public"."contract_status" DEFAULT 'active'::"public"."contract_status",
    "contract_url" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "contract_date_check" CHECK (("end_date" >= "start_date")),
    CONSTRAINT "contract_interval_check" CHECK (("interval_months" > 0)),
    CONSTRAINT "contract_services_used_check" CHECK ((("services_used" >= 0) AND ("services_used" <= "total_service"))),
    CONSTRAINT "contract_total_service_check" CHECK (("total_service" > 0))
);


ALTER TABLE "public"."contracts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "product_catalog_id" "uuid" NOT NULL,
    "order_product_id" "uuid",
    "installation_technician_id" "uuid",
    "installation_location" "text" NOT NULL,
    "installation_date" "date" NOT NULL,
    "photo_url" "text",
    "notes" "text",
    "status" "public"."product_status" DEFAULT 'active'::"public"."product_status",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customer_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" NOT NULL,
    "phone" "text",
    "address" "text",
    "address_type" "public"."address_type",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."invoice_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."invoice_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "related_type" "public"."invoice_related_type" NOT NULL,
    "related_id" "uuid",
    "invoice_number" "text" DEFAULT ((('INV-'::"text" || "to_char"("now"(), 'YYYYMM'::"text")) || '-'::"text") || "lpad"(("nextval"('"public"."invoice_number_seq"'::"regclass"))::"text", 6, '0'::"text")) NOT NULL,
    "total_amount" integer NOT NULL,
    "pdf_url" "text",
    "status" "public"."invoice_status" DEFAULT 'draft'::"public"."invoice_status",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "invoices_total_amount_check" CHECK (("total_amount" >= 0))
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_product" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_catalog_id" "uuid" NOT NULL,
    "qty" integer NOT NULL,
    "price" integer NOT NULL,
    "subtotal" integer NOT NULL,
    CONSTRAINT "order_product_price_check" CHECK (("price" >= 0)),
    CONSTRAINT "order_product_qty_check" CHECK (("qty" > 0)),
    CONSTRAINT "order_product_subtotal_check" CHECK (("subtotal" >= 0))
);


ALTER TABLE "public"."order_product" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "order_date" "date" NOT NULL,
    "status" "public"."order_status" DEFAULT 'pending'::"public"."order_status",
    "total_amount" numeric(12,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "orders_total_amount_check" CHECK (("total_amount" >= (0)::numeric))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_catalog" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid",
    "name" "text" NOT NULL,
    "model" "text" NOT NULL,
    "description" "text",
    "price" numeric(12,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "product_catalog_price_check" CHECK (("price" >= (0)::numeric))
);


ALTER TABLE "public"."product_catalog" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_category" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_category" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "public"."user_role" DEFAULT 'customer'::"public"."user_role" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedule_expected" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_product_id" "uuid" NOT NULL,
    "contract_id" "uuid",
    "expected_date" "date" NOT NULL,
    "interval_months" integer NOT NULL,
    "source_type" "public"."service_type" NOT NULL,
    "status" "public"."schedule_status" DEFAULT 'pending'::"public"."schedule_status",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "schedule_expected_interval_months_check" CHECK (("interval_months" > 0))
);


ALTER TABLE "public"."schedule_expected" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expected_id" "uuid",
    "customer_product_id" "uuid" NOT NULL,
    "technician_id" "uuid" NOT NULL,
    "service_date" "date" NOT NULL,
    "service_type" "public"."service_type" NOT NULL,
    "pekerjaan" "text" NOT NULL,
    "harga_service" integer NOT NULL,
    "teknisi_fee" numeric(12,2),
    "job_evidence" "jsonb",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "service_log_harga_service_check" CHECK (("harga_service" >= 0)),
    CONSTRAINT "service_log_teknisi_fee_check" CHECK ((("teknisi_fee" IS NULL) OR ("teknisi_fee" >= (0)::numeric)))
);


ALTER TABLE "public"."service_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."technicians" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text",
    "photo_url" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."technicians" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."service_log_customer_view" AS
 SELECT "sl"."id",
    "sl"."expected_id",
    "sl"."customer_product_id",
    "sl"."technician_id",
    "t"."name" AS "technician_name",
    "t"."photo_url" AS "technician_photo",
    "sl"."service_date",
    "sl"."service_type",
    "sl"."pekerjaan",
    "sl"."harga_service",
    "sl"."job_evidence",
    "sl"."notes",
    "sl"."created_at"
   FROM ("public"."service_log" "sl"
     JOIN "public"."technicians" "t" ON (("t"."id" = "sl"."technician_id")));


ALTER VIEW "public"."service_log_customer_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_date" "date" NOT NULL,
    "customer_id" "uuid",
    "customer_product_id" "uuid",
    "expected_id" "uuid",
    "technician_id" "uuid",
    "task_type" "text",
    "title" "text" NOT NULL,
    "description" "text",
    "status" "public"."task_status" DEFAULT 'pending'::"public"."task_status",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_products"
    ADD CONSTRAINT "customer_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_product"
    ADD CONSTRAINT "order_product_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_catalog"
    ADD CONSTRAINT "product_catalog_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_category"
    ADD CONSTRAINT "product_category_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedule_expected"
    ADD CONSTRAINT "schedule_expected_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_log"
    ADD CONSTRAINT "service_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."technicians"
    ADD CONSTRAINT "technicians_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_contracts_customer_product_id" ON "public"."contracts" USING "btree" ("customer_product_id");



CREATE INDEX "idx_customer_products_customer_id" ON "public"."customer_products" USING "btree" ("customer_id");



CREATE INDEX "idx_invoices_customer_id" ON "public"."invoices" USING "btree" ("customer_id");



CREATE INDEX "idx_notifications_user_unread" ON "public"."notifications" USING "btree" ("user_id", "is_read");



CREATE INDEX "idx_orders_customer_id" ON "public"."orders" USING "btree" ("customer_id");



CREATE INDEX "idx_schedule_expected_date" ON "public"."schedule_expected" USING "btree" ("expected_date");



CREATE INDEX "idx_service_log_customer_product" ON "public"."service_log" USING "btree" ("customer_product_id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."contracts"
    ADD CONSTRAINT "contracts_customer_product_id_fkey" FOREIGN KEY ("customer_product_id") REFERENCES "public"."customer_products"("id");



ALTER TABLE ONLY "public"."customer_products"
    ADD CONSTRAINT "customer_products_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."customer_products"
    ADD CONSTRAINT "customer_products_installation_technician_id_fkey" FOREIGN KEY ("installation_technician_id") REFERENCES "public"."technicians"("id");



ALTER TABLE ONLY "public"."customer_products"
    ADD CONSTRAINT "customer_products_order_product_id_fkey" FOREIGN KEY ("order_product_id") REFERENCES "public"."order_product"("id");



ALTER TABLE ONLY "public"."customer_products"
    ADD CONSTRAINT "customer_products_product_catalog_id_fkey" FOREIGN KEY ("product_catalog_id") REFERENCES "public"."product_catalog"("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."order_product"
    ADD CONSTRAINT "order_product_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_product"
    ADD CONSTRAINT "order_product_product_catalog_id_fkey" FOREIGN KEY ("product_catalog_id") REFERENCES "public"."product_catalog"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."product_catalog"
    ADD CONSTRAINT "product_catalog_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_expected"
    ADD CONSTRAINT "schedule_expected_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id");



ALTER TABLE ONLY "public"."schedule_expected"
    ADD CONSTRAINT "schedule_expected_customer_product_id_fkey" FOREIGN KEY ("customer_product_id") REFERENCES "public"."customer_products"("id");



ALTER TABLE ONLY "public"."service_log"
    ADD CONSTRAINT "service_log_customer_product_id_fkey" FOREIGN KEY ("customer_product_id") REFERENCES "public"."customer_products"("id");



ALTER TABLE ONLY "public"."service_log"
    ADD CONSTRAINT "service_log_expected_id_fkey" FOREIGN KEY ("expected_id") REFERENCES "public"."schedule_expected"("id");



ALTER TABLE ONLY "public"."service_log"
    ADD CONSTRAINT "service_log_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_customer_product_id_fkey" FOREIGN KEY ("customer_product_id") REFERENCES "public"."customer_products"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_expected_id_fkey" FOREIGN KEY ("expected_id") REFERENCES "public"."schedule_expected"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id");



CREATE POLICY "admin_all_chat" ON "public"."chat_messages" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_all_contracts" ON "public"."contracts" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_all_customer_products" ON "public"."customer_products" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_all_customers" ON "public"."customers" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_all_invoices" ON "public"."invoices" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_all_notifications" ON "public"."notifications" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_all_order_product" ON "public"."order_product" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_all_orders" ON "public"."orders" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_all_product_catalog" ON "public"."product_catalog" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_all_profiles" ON "public"."profiles" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_all_schedules" ON "public"."schedule_expected" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_all_service_logs" ON "public"."service_log" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "admin_all_tasks" ON "public"."tasks" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "allow_read_product_catalog" ON "public"."product_catalog" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contracts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "customer_insert_own_orders" ON "public"."orders" FOR INSERT TO "authenticated" WITH CHECK (("customer_id" = "auth"."uid"()));



ALTER TABLE "public"."customer_products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "customer_select_own" ON "public"."customers" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "customer_select_own_chat" ON "public"."chat_messages" FOR SELECT TO "authenticated" USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "customer_select_own_contracts" ON "public"."contracts" FOR SELECT TO "authenticated" USING (("customer_product_id" IN ( SELECT "customer_products"."id"
   FROM "public"."customer_products"
  WHERE ("customer_products"."customer_id" = "auth"."uid"()))));



CREATE POLICY "customer_select_own_invoices" ON "public"."invoices" FOR SELECT TO "authenticated" USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "customer_select_own_order_product" ON "public"."order_product" FOR SELECT TO "authenticated" USING (("order_id" IN ( SELECT "orders"."id"
   FROM "public"."orders"
  WHERE ("orders"."customer_id" = "auth"."uid"()))));



CREATE POLICY "customer_select_own_orders" ON "public"."orders" FOR SELECT TO "authenticated" USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "customer_select_own_products" ON "public"."customer_products" FOR SELECT TO "authenticated" USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "customer_select_own_profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "customer_send_chat" ON "public"."chat_messages" FOR INSERT TO "authenticated" WITH CHECK ((("customer_id" = "auth"."uid"()) AND ("sender_role" = 'customer'::"public"."user_role")));



CREATE POLICY "customer_update_own" ON "public"."customers" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "customer_update_own_profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_product" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedule_expected" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_select_own_notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "user_update_own_notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chat_messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."service_log";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";


















GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."contracts" TO "anon";
GRANT ALL ON TABLE "public"."contracts" TO "authenticated";
GRANT ALL ON TABLE "public"."contracts" TO "service_role";



GRANT ALL ON TABLE "public"."customer_products" TO "anon";
GRANT ALL ON TABLE "public"."customer_products" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_products" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invoice_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invoice_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invoice_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."order_product" TO "anon";
GRANT ALL ON TABLE "public"."order_product" TO "authenticated";
GRANT ALL ON TABLE "public"."order_product" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."product_catalog" TO "anon";
GRANT ALL ON TABLE "public"."product_catalog" TO "authenticated";
GRANT ALL ON TABLE "public"."product_catalog" TO "service_role";



GRANT ALL ON TABLE "public"."product_category" TO "anon";
GRANT ALL ON TABLE "public"."product_category" TO "authenticated";
GRANT ALL ON TABLE "public"."product_category" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."schedule_expected" TO "anon";
GRANT ALL ON TABLE "public"."schedule_expected" TO "authenticated";
GRANT ALL ON TABLE "public"."schedule_expected" TO "service_role";



GRANT ALL ON TABLE "public"."service_log" TO "anon";
GRANT ALL ON TABLE "public"."service_log" TO "authenticated";
GRANT ALL ON TABLE "public"."service_log" TO "service_role";



GRANT ALL ON TABLE "public"."technicians" TO "anon";
GRANT ALL ON TABLE "public"."technicians" TO "authenticated";
GRANT ALL ON TABLE "public"."technicians" TO "service_role";



GRANT ALL ON TABLE "public"."service_log_customer_view" TO "anon";
GRANT ALL ON TABLE "public"."service_log_customer_view" TO "authenticated";
GRANT ALL ON TABLE "public"."service_log_customer_view" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































