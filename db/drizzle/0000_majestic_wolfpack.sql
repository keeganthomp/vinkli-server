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
	"title" text,
	"description" text,
	"date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stripe_customers" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"artist_id" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tattoo" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"description" text,
	"tattoo_style" "tattooStyle",
	"tattoo_color" "tattooColor",
	"image_paths" text[] DEFAULT ARRAY[]::TEXT[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"user_type" "user_type" DEFAULT 'CUSTOMER' NOT NULL,
	"email" text NOT NULL,
	"phone_number" integer,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"stripe_account_id" text,
	"stripe_customer_id" text,
	"has_onboarded_to_stripe" boolean
);
