PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipe_ingredients` (
	`id` text PRIMARY KEY,
	`recipe_id` text,
	`ingredient_id` text,
	`amount` integer NOT NULL,
	`unit` text,
	CONSTRAINT `fk_recipe_ingredients_recipe_id_recipes_id_fk` FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
	CONSTRAINT `recipe_ingredients_ingredient_id_ingredients_id_fk` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_recipe_ingredients`(`id`, `recipe_id`, `ingredient_id`, `amount`, `unit`) SELECT `id`, `recipe_id`, `ingredient_id`, `amount`, `unit` FROM `recipe_ingredients`;--> statement-breakpoint
DROP TABLE `recipe_ingredients`;--> statement-breakpoint
ALTER TABLE `__new_recipe_ingredients` RENAME TO `recipe_ingredients`;--> statement-breakpoint
PRAGMA foreign_keys=ON;