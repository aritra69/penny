ALTER TABLE `waitlist` ADD `code` text;--> statement-breakpoint
ALTER TABLE `waitlist` ADD `referred_by` text;--> statement-breakpoint
ALTER TABLE `waitlist` ADD `tracks_with` text;--> statement-breakpoint
CREATE UNIQUE INDEX `waitlist_code_unique` ON `waitlist` (`code`);