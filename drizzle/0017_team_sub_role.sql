ALTER TABLE "users" ADD COLUMN "sub_role" text;--> statement-breakpoint
CREATE INDEX "idx_users_company" ON "users" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_users_branch" ON "users" USING btree ("branch_id");
