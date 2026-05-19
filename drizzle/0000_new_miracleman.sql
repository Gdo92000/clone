CREATE TYPE "public"."cuisine_type" AS ENUM('pizza', 'hamburger', 'brazilian', 'japanese', 'mexican', 'italian', 'chinese', 'healthy', 'dessert', 'cafe', 'arabic', 'seafood', 'other');--> statement-breakpoint
CREATE TYPE "public"."delivery_type" AS ENUM('delivery', 'pickup');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('confirmed', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('credit', 'debit', 'pix', 'cash', 'meal_ticket');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'merchant', 'courier', 'admin', 'superadmin');--> statement-breakpoint
CREATE TYPE "public"."merchant_order_status" AS ENUM('new', 'accepted', 'preparing', 'ready', 'dispatched', 'delivered', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('active', 'paused', 'finished');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."billing_charge_type" AS ENUM('included', 'monthly_addon', 'usage_based', 'enterprise_contract');--> statement-breakpoint
CREATE TYPE "public"."billing_status" AS ENUM('trial', 'active', 'past_due', 'blocked', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."capability_category" AS ENUM('core', 'premium', 'addon', 'enterprise', 'financial', 'automation', 'analytics', 'integration', 'operations');--> statement-breakpoint
CREATE TYPE "public"."plan_id" AS ENUM('basic', 'pro', 'premium');--> statement-breakpoint
CREATE TYPE "public"."notification_target" AS ENUM('all', 'active', 'inactive', 'plan');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."holiday_override_type" AS ENUM('closed', 'open_normal', 'custom_hours');--> statement-breakpoint
CREATE TYPE "public"."holiday_scope" AS ENUM('national', 'state', 'municipal');--> statement-breakpoint
CREATE TYPE "public"."week_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TABLE "additives" (
	"id" text PRIMARY KEY NOT NULL,
	"menu_item_id" text NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"store_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" text PRIMARY KEY NOT NULL,
	"restaurant_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"image_url" text,
	"category" text NOT NULL,
	"is_available" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"cuisine" "cuisine_type" NOT NULL,
	"category_id" text,
	"address" text NOT NULL,
	"number" text,
	"neighborhood" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text,
	"phone" text,
	"image_url" text,
	"banner_url" text,
	"delivery_fee" numeric(10, 2) DEFAULT '0',
	"delivery_time" text,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"promotional_offer" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"payment_methods" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "restaurants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"label" text DEFAULT 'Casa' NOT NULL,
	"street" text NOT NULL,
	"number" text NOT NULL,
	"complement" text,
	"neighborhood" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"menu_item_id" text NOT NULL,
	"name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"additives" jsonb,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"restaurant_id" text NOT NULL,
	"status" "order_status" DEFAULT 'confirmed' NOT NULL,
	"delivery_type" "delivery_type" DEFAULT 'delivery' NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"address_id" text,
	"subtotal" numeric(10, 2) NOT NULL,
	"delivery_fee" numeric(10, 2) DEFAULT '0',
	"discount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"notes" text,
	"estimated_time" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"restaurant_id" text NOT NULL,
	"order_id" text,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"password_hash" text,
	"avatar_url" text,
	"is_active" boolean DEFAULT true,
	"company_id" text,
	"branch_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"name" text NOT NULL,
	"cep" text,
	"address" text NOT NULL,
	"number" text,
	"neighborhood" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"delivery_radius_km" integer DEFAULT 8,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"document" text,
	"plan_id" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "merchant_menu_items" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"is_available" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "merchant_order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_order_id" text NOT NULL,
	"name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_address" text NOT NULL,
	"customer_phone" text,
	"status" "merchant_order_status" DEFAULT 'new' NOT NULL,
	"payment_method" text NOT NULL,
	"delivery_type" text DEFAULT 'delivery' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"discount_percentage" numeric(5, 2),
	"status" "campaign_status" DEFAULT 'active' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "global_coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_order" numeric(10, 2) DEFAULT '0',
	"max_uses" integer DEFAULT 0,
	"current_uses" integer DEFAULT 0,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "global_coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "merchant_coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_order" numeric(10, 2) DEFAULT '0',
	"max_uses" integer DEFAULT 0,
	"current_uses" integer DEFAULT 0,
	"valid_until" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "addons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"monthly_price" numeric(10, 2) NOT NULL,
	"feature_key" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "addons_feature_key_unique" UNIQUE("feature_key")
);
--> statement-breakpoint
CREATE TABLE "capabilities" (
	"id" text PRIMARY KEY NOT NULL,
	"feature_key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"monthly_price" numeric(10, 2) DEFAULT '0',
	"category" "capability_category" NOT NULL,
	"charge_type" "billing_charge_type" DEFAULT 'included' NOT NULL,
	"required_plan" "plan_id",
	"dependencies" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "capabilities_feature_key_unique" UNIQUE("feature_key")
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text,
	"branch_id" text,
	"user_id" text,
	"feature_key" text NOT NULL,
	"enabled" boolean NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" "plan_id" PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"monthly_price" numeric(10, 2) NOT NULL,
	"description" text,
	"max_branches" integer DEFAULT 1,
	"max_products" integer DEFAULT 50,
	"max_users" integer DEFAULT 3,
	"max_campaigns" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"company_id" text PRIMARY KEY NOT NULL,
	"plan_id" "plan_id" NOT NULL,
	"addon_ids" jsonb,
	"billing_status" "billing_status" DEFAULT 'trial' NOT NULL,
	"trial_ends_at" timestamp with time zone,
	"current_period_ends_at" timestamp with time zone NOT NULL,
	"blocked_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"target" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coverage_cities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"state" text NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"radius_km" integer DEFAULT 18 NOT NULL,
	"restaurant_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"target" "notification_target" NOT NULL,
	"plan_id" text,
	"sent_by" text NOT NULL,
	"delivered_count" integer DEFAULT 0,
	"read_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "business_hour_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"business_hour_id" text NOT NULL,
	"open_time" time(0) NOT NULL,
	"close_time" time(0) NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "business_hours" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"weekday" "week_day" NOT NULL,
	"is_closed" boolean DEFAULT false,
	"is_24h" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "holiday_override_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"holiday_override_id" text NOT NULL,
	"open_time" time(0) NOT NULL,
	"close_time" time(0) NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "holiday_overrides" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"holiday_rule_id" text,
	"override_type" "holiday_override_type" NOT NULL,
	"custom_date" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "holiday_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL,
	"scope" "holiday_scope" NOT NULL,
	"state_code" text,
	"city_code" text,
	"is_recurring" boolean DEFAULT true,
	"year" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "special_date_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"special_date_id" text NOT NULL,
	"open_time" time(0) NOT NULL,
	"close_time" time(0) NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "special_dates" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"date" text NOT NULL,
	"label" text,
	"is_closed" boolean DEFAULT false,
	"is_24h" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "additives" ADD CONSTRAINT "additives_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_menu_items" ADD CONSTRAINT "merchant_menu_items_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_order_items" ADD CONSTRAINT "merchant_order_items_merchant_order_id_merchant_orders_id_fk" FOREIGN KEY ("merchant_order_id") REFERENCES "public"."merchant_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_orders" ADD CONSTRAINT "merchant_orders_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_coupons" ADD CONSTRAINT "merchant_coupons_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_hour_periods" ADD CONSTRAINT "business_hour_periods_business_hour_id_business_hours_id_fk" FOREIGN KEY ("business_hour_id") REFERENCES "public"."business_hours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holiday_override_periods" ADD CONSTRAINT "holiday_override_periods_holiday_override_id_holiday_overrides_id_fk" FOREIGN KEY ("holiday_override_id") REFERENCES "public"."holiday_overrides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holiday_overrides" ADD CONSTRAINT "holiday_overrides_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holiday_overrides" ADD CONSTRAINT "holiday_overrides_holiday_rule_id_holiday_rules_id_fk" FOREIGN KEY ("holiday_rule_id") REFERENCES "public"."holiday_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_date_periods" ADD CONSTRAINT "special_date_periods_special_date_id_special_dates_id_fk" FOREIGN KEY ("special_date_id") REFERENCES "public"."special_dates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_dates" ADD CONSTRAINT "special_dates_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_additives_menu_item" ON "additives" USING btree ("menu_item_id");--> statement-breakpoint
CREATE INDEX "idx_menu_items_restaurant" ON "menu_items" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "idx_menu_items_category" ON "menu_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_restaurants_category" ON "restaurants" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_addresses_user" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_order" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_menu_item" ON "order_items" USING btree ("menu_item_id");--> statement-breakpoint
CREATE INDEX "idx_orders_user_created" ON "orders" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_orders_restaurant" ON "orders" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_orders_address" ON "orders" USING btree ("address_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_restaurant" ON "reviews" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_user" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_branches_company" ON "branches" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_merchant_menu_items_branch" ON "merchant_menu_items" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_merchant_order_items_order" ON "merchant_order_items" USING btree ("merchant_order_id");--> statement-breakpoint
CREATE INDEX "idx_merchant_orders_branch_status" ON "merchant_orders" USING btree ("branch_id","status");--> statement-breakpoint
CREATE INDEX "idx_merchant_orders_created" ON "merchant_orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_invoices_company" ON "invoices" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_status" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_invoices_due_date" ON "invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_status" ON "subscriptions" USING btree ("billing_status");--> statement-breakpoint
CREATE INDEX "idx_audit_events_created" ON "audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_events_actor" ON "audit_events" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_coverage_cities_name_state" ON "coverage_cities" USING btree ("name","state");--> statement-breakpoint
CREATE INDEX "idx_coverage_cities_active" ON "coverage_cities" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_user" ON "support_tickets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_status" ON "support_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_bhp_business_hour" ON "business_hour_periods" USING btree ("business_hour_id");--> statement-breakpoint
CREATE INDEX "idx_business_hours_branch_weekday" ON "business_hours" USING btree ("branch_id","weekday");--> statement-breakpoint
CREATE INDEX "idx_hop_override" ON "holiday_override_periods" USING btree ("holiday_override_id");--> statement-breakpoint
CREATE INDEX "idx_holiday_overrides_branch" ON "holiday_overrides" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_holiday_overrides_date" ON "holiday_overrides" USING btree ("custom_date");--> statement-breakpoint
CREATE INDEX "idx_holiday_overrides_holiday" ON "holiday_overrides" USING btree ("holiday_rule_id");--> statement-breakpoint
CREATE INDEX "idx_holiday_rules_date" ON "holiday_rules" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_holiday_rules_scope" ON "holiday_rules" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "idx_holiday_rules_year" ON "holiday_rules" USING btree ("year");--> statement-breakpoint
CREATE INDEX "idx_sdp_special_date" ON "special_date_periods" USING btree ("special_date_id");--> statement-breakpoint
CREATE INDEX "idx_special_dates_branch" ON "special_dates" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_special_dates_date" ON "special_dates" USING btree ("date");