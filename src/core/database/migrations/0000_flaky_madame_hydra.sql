CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` text PRIMARY KEY NOT NULL,
	`subscription_id` text NOT NULL,
	`amount` real NOT NULL,
	`changed_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reminder_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`subscription_id` text,
	`days_before` integer NOT NULL,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`service_key` text,
	`category_id` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text NOT NULL,
	`billing_cycle` text NOT NULL,
	`custom_cycle_days` integer,
	`next_billing_date` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`is_shared` integer DEFAULT false NOT NULL,
	`shared_with_name` text,
	`shared_split_percent` integer,
	`last_used_at` integer,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
