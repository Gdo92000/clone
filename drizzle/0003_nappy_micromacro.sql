CREATE TABLE "branch_settings" (
	"branch_id" text PRIMARY KEY NOT NULL,
	"opening_time" text DEFAULT '18:00' NOT NULL,
	"closing_time" text DEFAULT '23:30' NOT NULL,
	"preparation_time" text DEFAULT '35' NOT NULL,
	"minimum_order" text DEFAULT '25' NOT NULL,
	"accepts_delivery" boolean DEFAULT true NOT NULL,
	"accepts_pickup" boolean DEFAULT true NOT NULL,
	"pix_key" text DEFAULT '',
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "branch_settings" ADD CONSTRAINT "branch_settings_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_branch_settings_branch" ON "branch_settings" USING btree ("branch_id");