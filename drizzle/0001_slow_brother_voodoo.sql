CREATE TABLE `favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`listing_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_favorites_user_listing` ON `favorites` (`user_id`,`listing_id`);--> statement-breakpoint
CREATE INDEX `idx_favorites_user_created` ON `favorites` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_favorites_listing_id` ON `favorites` (`listing_id`);
