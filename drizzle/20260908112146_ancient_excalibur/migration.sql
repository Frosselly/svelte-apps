PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipes` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`description` text,
	`created_at` integer,
	`updated_at` integer,
	`cook_time` integer NOT NULL,
	`prep_time` integer NOT NULL,
	`servings` integer NOT NULL,
	`image_url` text,
	`notes` text,
	`user_id` text,
	CONSTRAINT `recipes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_recipes`(`id`, `title`, `description`, `created_at`, `updated_at`, `cook_time`, `prep_time`, `servings`, `image_url`, `notes`, `user_id`) SELECT `id`, `title`, `description`, `created_at`, `updated_at`, `cook_time`, `prep_time`, `servings`, `image_url`, `notes`, `user_id` FROM `recipes`;--> statement-breakpoint
DROP TABLE `recipes`;--> statement-breakpoint
ALTER TABLE `__new_recipes` RENAME TO `recipes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;