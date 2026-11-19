CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`merchant` text,
	`category` text,
	`note` text,
	`occurred_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `transactions_occurred_at` ON `transactions` (`occurred_at`);