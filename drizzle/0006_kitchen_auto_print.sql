CREATE TABLE IF NOT EXISTS "subscription_addons" (
	"subscription_id" text NOT NULL,
	"addon_id" text NOT NULL,
	"activated_at" timestamp with time zone DEFAULT now(),
	PRIMARY KEY("subscription_id", "addon_id")
);

CREATE TABLE IF NOT EXISTS "printer_configs" (
	"branch_id" text PRIMARY KEY REFERENCES "branches"("id"),
	"printer_type" text DEFAULT 'network',
	"ip_address" text,
	"port" integer DEFAULT 9100,
	"model" text DEFAULT 'ESC/POS',
	"enabled" boolean DEFAULT true,
	"updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "print_jobs" (
	"id" text PRIMARY KEY,
	"order_id" text NOT NULL,
	"branch_id" text NOT NULL REFERENCES "branches"("id"),
	"status" text DEFAULT 'pending',
	"retry_count" integer NOT NULL DEFAULT 0,
	"error_message" text,
	"payload" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_print_jobs_order" ON "print_jobs" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_print_jobs_status" ON "print_jobs" ("status");
CREATE INDEX IF NOT EXISTS "idx_print_jobs_branch" ON "print_jobs" ("branch_id");
