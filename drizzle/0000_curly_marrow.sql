CREATE TYPE "public"."coupon_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."course_level" AS ENUM('beginner', 'intermediate', 'advanced', 'all-levels');--> statement-breakpoint
CREATE TYPE "public"."course_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('active', 'completed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('pending', 'paid', 'refunded', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('video', 'article', 'quiz', 'coding', 'exercise', 'resource', 'assignment');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('sslcommerz', 'stripe', 'paypal', 'cash', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'instructor', 'admin');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" "coupon_type" NOT NULL,
	"value" numeric(5, 2) NOT NULL,
	"course_id" integer,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"subtitle" text,
	"description" text NOT NULL,
	"full_description" text,
	"image" text NOT NULL,
	"preview_video_url" text,
	"level" "course_level" DEFAULT 'all-levels' NOT NULL,
	"category_id" integer NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"rating" numeric(3, 2) DEFAULT '0.00',
	"total_reviews" integer DEFAULT 0,
	"duration" integer,
	"featured" boolean DEFAULT false,
	"is_new" boolean DEFAULT true,
	"is_bestseller" boolean DEFAULT false,
	"certification" text,
	"requirements" jsonb DEFAULT '[]'::jsonb,
	"learning_outcomes" jsonb DEFAULT '[]'::jsonb,
	"target_audience" jsonb DEFAULT '[]'::jsonb,
	"language" text,
	"course_projects" jsonb DEFAULT '[]'::jsonb,
	"course_software" jsonb DEFAULT '[]'::jsonb,
	"course_features" jsonb DEFAULT '[]'::jsonb,
	"instructor_id" integer NOT NULL,
	"status" "course_status" DEFAULT 'draft',
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"status" "enrollment_status" DEFAULT 'active' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "enrollments_user_id_course_id_unique" UNIQUE("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"bio" text,
	"avatar" text,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "syllabus_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" text NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "syllabus_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "item_type" NOT NULL,
	"content" text,
	"duration" integer,
	"is_free" boolean DEFAULT false NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_item_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"last_position" integer,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_item_progress_user_id_item_id_unique" UNIQUE("user_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "course_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "course_reviews_user_id_course_id_unique" UNIQUE("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"user_id" integer NOT NULL,
	"enrollment_id" integer,
	"coupon_id" integer,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"status" "invoice_status" DEFAULT 'pending' NOT NULL,
	"issued_at" timestamp DEFAULT now(),
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"course_name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"transaction_id" text,
	"gateway_response" text,
	"receipt_number" text,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"installment_number" integer,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"instructor_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"transaction_id" text,
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "syllabus_sections" ADD CONSTRAINT "syllabus_sections_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "syllabus_items" ADD CONSTRAINT "syllabus_items_section_id_syllabus_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."syllabus_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_item_progress" ADD CONSTRAINT "user_item_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_item_progress" ADD CONSTRAINT "user_item_progress_item_id_syllabus_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."syllabus_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_course_idx" ON "coupons" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_courses_instructor" ON "courses" USING btree ("instructor_id");--> statement-breakpoint
CREATE INDEX "idx_courses_category" ON "courses" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_courses_slug" ON "courses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "enrollments_user_idx" ON "enrollments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "enrollments_course_idx" ON "enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_syllabus_sections_course" ON "syllabus_sections" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_syllabus_items_section" ON "syllabus_items" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "progress_user_idx" ON "user_item_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "progress_item_idx" ON "user_item_progress" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "reviews_course_idx" ON "course_reviews" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "invoices_user_idx" ON "invoices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invoices_enrollment_idx" ON "invoices" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "invoices_coupon_idx" ON "invoices" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "invoice_items_invoice_idx" ON "invoice_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payments_invoice_idx" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payments_transaction_idx" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "payments_receipt_idx" ON "payments" USING btree ("receipt_number");--> statement-breakpoint
CREATE INDEX "payouts_instructor_idx" ON "payouts" USING btree ("instructor_id");