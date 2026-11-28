export const categoryStyles: Record<string, string> = {
	dessert: 'bg-blush-300 ',
	dinner: 'bg-lavender-400'
};

export const categoryLabel: Record<string, string> = {
	dessert: 'Dessert',
	dinner: 'Dinner'
};

export function formatMinutes(minutes: number | null | undefined) {
	if (!minutes) return null;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h && m) return `${h}h ${m}m`;
	if (h) return `${h}h`;
	return `${m}m`;
}

export function initials(name: string | null | undefined) {
	if (!name) return '?';
	return name
		.split(' ')
		.map((part) => part[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();
}
