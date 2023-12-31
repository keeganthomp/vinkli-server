DO $$ BEGIN
 CREATE TYPE "bookingStatus" AS ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "bookingType" AS ENUM('CONSULTATION', 'TATTOO_SESSION');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "tattooColor" AS ENUM('BLACK_AND_GREY', 'COLOR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "tattooStyle" AS ENUM('TRADITIONAL_AMERICAN', 'REALISM', 'TRIBAL', 'NEW_SCHOOL', 'JAPANESE_IREZUMI', 'BLACKWORK', 'DOTWORK', 'WATERCOLOR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "user_type" AS ENUM('ARTIST', 'CUSTOMER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"artist_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"tattoo_id" uuid NOT NULL,
	"type" "bookingType" DEFAULT 'CONSULTATION' NOT NULL,
	"status" "bookingStatus" DEFAULT 'PENDING' NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"duration" real,
	"completed_at" timestamp with time zone,
	"payment_intent_id" text,
	"payment_link_id" text,
	"payment_receive" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tattoo" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"description" text,
	"style" "tattooStyle",
	"color" "tattooColor",
	"placement" text,
	"image_paths" text[] DEFAULT ARRAY[]::TEXT[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"phone" text NOT NULL,
	"user_type" "user_type",
	"email" text,
	"name" text,
	"stripe_account_id" text,
	"stripe_customer_id" text,
	"has_onboarded_to_stripe" boolean DEFAULT false,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_stripe_account_id_unique" UNIQUE("stripe_account_id"),
	CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
