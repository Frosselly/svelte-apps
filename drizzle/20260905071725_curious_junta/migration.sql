PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` text PRIMARY KEY,
	`name` text(50) NOT NULL UNIQUE,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `categories_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_categories`(`id`, `name`, `created_by`, `created_at`) SELECT `id`, `name`, `created_by`, `created_at` FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ingredients` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL UNIQUE
);
--> statement-breakpoint
INSERT INTO `__new_ingredients`(`id`, `name`) SELECT `id`, `name` FROM `ingredients`;--> statement-breakpoint
DROP TABLE `ingredients`;--> statement-breakpoint
ALTER TABLE `__new_ingredients` RENAME TO `ingredients`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipe_categories` (
	`id` text PRIMARY KEY,
	`recipe_id` text,
	`category_id` text,
	CONSTRAINT `fk_recipe_categories_recipe_id_recipes_id_fk` FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
	CONSTRAINT `recipe_categories_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_recipe_categories`(`id`, `recipe_id`, `category_id`) SELECT `id`, `recipe_id`, `category_id` FROM `recipe_categories`;--> statement-breakpoint
DROP TABLE `recipe_categories`;--> statement-breakpoint
ALTER TABLE `__new_recipe_categories` RENAME TO `recipe_categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipe_ingredients` (
	`id` text PRIMARY KEY,
	`recipe_id` text,
	`ingredient_id` text,
	`amount` integer NOT NULL,
	`unit` text NOT NULL,
	CONSTRAINT `fk_recipe_ingredients_recipe_id_recipes_id_fk` FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
	CONSTRAINT `recipe_ingredients_ingredient_id_ingredients_id_fk` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_recipe_ingredients`(`id`, `recipe_id`, `ingredient_id`, `amount`, `unit`) SELECT `id`, `recipe_id`, `ingredient_id`, `amount`, `unit` FROM `recipe_ingredients`;--> statement-breakpoint
DROP TABLE `recipe_ingredients`;--> statement-breakpoint
ALTER TABLE `__new_recipe_ingredients` RENAME TO `recipe_ingredients`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_steps` (
	`id` text PRIMARY KEY,
	`stepNr` integer,
	`description` text,
	`recipe_id` text,
	CONSTRAINT `fk_steps_recipe_id_recipes_id_fk` FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_steps`(`id`, `stepNr`, `description`, `recipe_id`) SELECT `id`, `stepNr`, `description`, `recipe_id` FROM `steps`;--> statement-breakpoint
DROP TABLE `steps`;--> statement-breakpoint
ALTER TABLE `__new_steps` RENAME TO `steps`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `categories_name_unique`;