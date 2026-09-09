PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` text PRIMARY KEY,
	`name` text(50) NOT NULL UNIQUE,
	`created_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_categories`(`id`, `name`, `created_at`) SELECT `id`, `name`, `created_at` FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;