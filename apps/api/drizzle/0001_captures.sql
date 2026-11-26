CREATE TABLE "captures" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_id" text,
	"source" text NOT NULL,
	"sender" text NOT NULL,
	"message" text NOT NULL,
	"fingerprint" text NOT NULL,
	"kind" text NOT NULL,
	"outcome" text NOT NULL,
	"reason" text,
	"confidence" real,
	"received_at" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "status" text DEFAULT 'confirmed' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "account_hint" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "reference_hash" text;--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "captures_user_received_at" ON "captures" USING btree ("user_id","received_at");--> statement-breakpoint
CREATE INDEX "captures_user_fingerprint" ON "captures" USING btree ("user_id","fingerprint");--> statement-breakpoint
CREATE INDEX "transactions_user_reference" ON "transactions" USING btree ("user_id","reference_hash");