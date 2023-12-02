DO $$ BEGIN
 CREATE TYPE "bookingStatus" AS ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
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
	"artist_id" uuid,
	"customer_id" uuid NOT NULL,
	"date" timestamp with time zone,
	"title" text NOT NULL,
	"description" text,
	"tattoo_style" "tattooStyle",
	"tattoo_color" "tattooColor",
	"remaining_sessions" integer,
	"image_paths" text[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
	"status" "bookingStatus" DEFAULT 'PENDING' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"user_type" "user_type" DEFAULT 'CUSTOMER' NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text
);
