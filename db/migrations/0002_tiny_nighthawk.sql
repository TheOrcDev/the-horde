CREATE TYPE "public"."class" AS ENUM('grunt', 'mage', 'hunter', 'warlock', 'priest', 'rogue', 'paladin', 'shaman', 'death-knight', 'druid');--> statement-breakpoint
CREATE TYPE "public"."faction" AS ENUM('horde', 'alliance');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('tank', 'healer', 'dps', 'raid-lead');--> statement-breakpoint
CREATE TYPE "public"."sponsor_status" AS ENUM('incomplete', 'active', 'past_due', 'canceled');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "horde_card" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"x_user_id" text NOT NULL,
	"handle" text NOT NULL,
	"x_username" text NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text NOT NULL,
	"email" text,
	"faction" "faction" NOT NULL,
	"class" "class" NOT NULL,
	"role" "role" NOT NULL,
	"timezone" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "horde_card_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "horde_card_x_user_id_unique" UNIQUE("x_user_id"),
	CONSTRAINT "horde_card_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "horde_card_alias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"handle" text NOT NULL,
	CONSTRAINT "horde_card_alias_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sponsor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"tagline" text NOT NULL,
	"logo_url" text NOT NULL,
	"url" text NOT NULL,
	"email" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"status" "sponsor_status" NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sponsor_slug_unique" UNIQUE("slug"),
	CONSTRAINT "sponsor_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horde_card" ADD CONSTRAINT "horde_card_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "horde_card_alias" ADD CONSTRAINT "horde_card_alias_card_id_horde_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."horde_card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waiting_list" ADD CONSTRAINT "waiting_list_email_unique" UNIQUE("email");