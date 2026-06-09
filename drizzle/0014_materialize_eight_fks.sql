-- Migration 0014: Materialize 8 remaining FK constraints
-- All pre-validated with zero orphans

ALTER TABLE "loyalty_rewards" ADD CONSTRAINT "loyalty_rewards_branch_id_branches_id_fk"
  FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "loyalty_settings" ADD CONSTRAINT "loyalty_settings_branch_id_branches_id_fk"
  FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "user_loyalty_points" ADD CONSTRAINT "user_loyalty_points_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "user_loyalty_points" ADD CONSTRAINT "user_loyalty_points_branch_id_branches_id_fk"
  FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "subscription_addons" ADD CONSTRAINT "subscription_addons_subscription_id_subscriptions_company_id_fk"
  FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("company_id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "subscription_addons" ADD CONSTRAINT "subscription_addons_addon_id_addons_id_fk"
  FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk"
  FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "holiday_override_periods" ADD CONSTRAINT "holiday_override_periods_holiday_override_id_holiday_overrides_id_fk"
  FOREIGN KEY ("holiday_override_id") REFERENCES "public"."holiday_overrides"("id") ON DELETE cascade ON UPDATE no action;
