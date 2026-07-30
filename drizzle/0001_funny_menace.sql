PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text,
	`created_at` integer,
	`updated_at` integer,
	`cook_time` integer NOT NULL,
	`prep_time` integer NOT NULL,
	`notes` text,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_recipes`("id", "title", "description", "category", "created_at", "updated_at", "cook_time", "prep_time", "notes", "user_id") SELECT "id", "title", "description", "category", "created_at", "updated_at", "cook_time", "prep_time", "notes", "user_id" FROM `recipes`;--> statement-breakpoint
DROP TABLE `recipes`;--> statement-breakpoint
ALTER TABLE `__new_recipes` RENAME TO `recipes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;