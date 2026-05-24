CREATE TABLE "subscription_addons" (
	"subscription_id" text NOT NULL,
	"addon_id" text NOT NULL,
	"activated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "subscription_addons_subscription_id_addon_id_pk" PRIMARY KEY("subscription_id","addon_id")
);
--> statement-breakpoint
CREATE TABLE "print_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"branch_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"payload" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "printer_configs" (
	"branch_id" text PRIMARY KEY NOT NULL,
	"printer_type" text DEFAULT 'network' NOT NULL,
	"ip_address" text,
	"port" integer DEFAULT 9100,
	"model" text DEFAULT 'ESC/POS',
	"enabled" boolean DEFAULT true,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "subscription_addons" ADD CONSTRAINT "subscription_addons_subscription_id_subscriptions_company_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("company_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_addons" ADD CONSTRAINT "subscription_addons_addon_id_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_jobs" ADD CONSTRAINT "print_jobs_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "printer_configs" ADD CONSTRAINT "printer_configs_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_print_jobs_order" ON "print_jobs" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_print_jobs_status" ON "print_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_print_jobs_branch" ON "print_jobs" USING btree ("branch_id");