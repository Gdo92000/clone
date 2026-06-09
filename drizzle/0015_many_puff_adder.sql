ALTER TABLE "menu_items" ADD COLUMN "branch_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "is_visible_to_consumer" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_menu_items_branch" ON "menu_items" USING btree ("branch_id");--> statement-breakpoint
CREATE INDEX "idx_menu_items_visible" ON "menu_items" USING btree ("is_visible_to_consumer");