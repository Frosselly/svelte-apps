export interface Todo {
	id: string;
	description: string;
	completed: boolean;
}

export type Recipe = {
	id: string;
	title: string;
	description: string;
	category: 'dessert' | 'dinner' | null;
	createdAt: Date | null;
	updatedAt: Date | null;
	cookTime: number;
	prepTime: number;
	servings: number;
	imageUrl: string | null;
	notes: string | null;
	userid: string | null;
	authorName: string | null;
	authorId: string | null;
};

export type SortOption = 'newest' | 'oldest' | 'quickest';
