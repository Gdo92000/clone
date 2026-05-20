CREATE TABLE "commission_plans" (
	"plan_id" "plan_id" PRIMARY KEY NOT NULL,
	"marketplace_fee" numeric(5, 2) DEFAULT '12' NOT NULL,
	"delivery_fee" numeric(5, 2) DEFAULT '8' NOT NULL,
	"payment_fee" numeric(5, 2) DEFAULT '3.5' NOT NULL,
	"additional_fees" jsonb DEFAULT '[]'::jsonb,
	"updated_at" timestamp with time zone DEFAULT now()
);
