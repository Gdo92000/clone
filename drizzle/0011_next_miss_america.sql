ALTER TABLE "restaurants" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "delivery_radius_km" integer DEFAULT 8;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "coverage_zone_type" "coverage_zone_type" DEFAULT 'city';--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "coverage_polygon" jsonb;--> statement-breakpoint
CREATE INDEX "idx_restaurants_city_active" ON "restaurants" USING btree ("city","is_active");--> statement-breakpoint
CREATE INDEX "idx_restaurants_neighborhood_active" ON "restaurants" USING btree ("city","neighborhood","is_active");--> statement-breakpoint
CREATE INDEX "idx_restaurants_geo" ON "restaurants" USING btree ("latitude","longitude");