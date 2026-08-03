CREATE TABLE `listing_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`kind` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`r2_key` text NOT NULL,
	`processing_status` text DEFAULT 'uploaded' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_listing_documents_listing_id` ON `listing_documents` (`listing_id`);--> statement-breakpoint
CREATE INDEX `idx_listing_documents_kind_status` ON `listing_documents` (`kind`,`processing_status`);--> statement-breakpoint
CREATE TABLE `listings` (
	`id` text PRIMARY KEY NOT NULL,
	`publisher_id` text NOT NULL,
	`title` text NOT NULL,
	`city` text DEFAULT '深圳' NOT NULL,
	`district` text NOT NULL,
	`community` text NOT NULL,
	`monthly_rent_cents` integer NOT NULL,
	`available_from` text NOT NULL,
	`lease_ends_at` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending_review' NOT NULL,
	`exposure_score` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_listings_publisher_id` ON `listings` (`publisher_id`);--> statement-breakpoint
CREATE INDEX `idx_listings_browse` ON `listings` (`city`,`district`,`status`);--> statement-breakpoint
CREATE INDEX `idx_listings_available_from` ON `listings` (`available_from`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`read_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_messages_conversation` ON `messages` (`listing_id`,`sender_id`,`recipient_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`display_name` text,
	`role` text DEFAULT 'seeker' NOT NULL,
	`real_name_status` text DEFAULT 'not_started' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_users_phone` ON `users` (`phone`);--> statement-breakpoint
CREATE INDEX `idx_users_real_name_status` ON `users` (`real_name_status`);--> statement-breakpoint
CREATE TABLE `verification_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`real_name_status` text DEFAULT 'pending' NOT NULL,
	`contract_status` text DEFAULT 'pending' NOT NULL,
	`payment_status` text DEFAULT 'skipped' NOT NULL,
	`contract_name_masked` text,
	`contract_address_masked` text,
	`reviewed_by` text,
	`review_note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_verification_cases_user_id` ON `verification_cases` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_verification_cases_review_status` ON `verification_cases` (`real_name_status`,`contract_status`);--> statement-breakpoint
CREATE TABLE `viewing_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`seeker_id` text NOT NULL,
	`requested_date` text NOT NULL,
	`requested_time` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_viewing_requests_listing_status` ON `viewing_requests` (`listing_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_viewing_requests_seeker_id` ON `viewing_requests` (`seeker_id`);