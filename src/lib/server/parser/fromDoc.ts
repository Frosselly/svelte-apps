import * as cheerio from 'cheerio';
import { docToHTML } from './docParser';
import type { CreateRecipeModel, Ingredient } from '$lib/schemas/models';

export async function docToRecipe(file: File) {
	const html = await docToHTML(file);
	// const $ = cheerio.load(html);
	// const noImage = $('img').first().attr('src') || undefined;
	// console.log(html)
	const recipe = extractRecipe2(html);
	const forOutput = { ...recipe, image: !!recipe.image };
	console.log('extractRecipe', forOutput);
	return forOutput;
}

//
function extractRecipe1(html): Omit<CreateRecipeModel, 'userId'> {
	const $ = cheerio.load(html);

	const clean = (str = '') =>
		str
			.replace(/\u00a0/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

	const bodyElements = $('body').find('p, table, ul, ol, img').toArray();

	// TITLE = first non-empty paragraph
	const title = clean(
		$('p')
			.toArray()
			.map((el) => $(el).text())
			.find((text) => clean(text))
	);

	// IMAGE = first image
	const image = $('img').first().attr('src') || undefined;

	// SERVINGS
	let servings = 0;
	const pageText = clean($.text());

	const servingsMatch = pageText.match(/PORCIJŲ(?:\s+SKAIČIUS)?\s*:?\s*(\d+)/i);

	if (servingsMatch) {
		servings = Number(servingsMatch[1]);
	}

	// PREP TIME
	let prepTime = 0;

	const prepMatch = pageText.match(
		/PARUOŠIMO(?:\s+LAIKAS)?\s*:?\s*([^.]+(?:VAL\.?|MIN\.?))/i
	);

	if (prepMatch) {
		prepTime = Number(clean(prepMatch[1]));
	}

	// INGREDIENTS
	const ingredients: Ingredient[] = [];

	const ingredientTable = $('table').first();

	if (ingredientTable.length) {
		ingredientTable.find('tr').each((_, row) => {
			const cells = $(row)
				.find('td')
				.toArray()
				.map((td) => clean($(td).text()));

			if (!cells.length) return;

			const amountCell = cells[0] || '';
			const ingredientCell = cells.slice(1).join(' ');

			const amountMatch = amountCell.match(/^([\d.,\/]+)\s*(.*)$/u);

			ingredients.push({
				amount: Number(amountMatch?.[1]) || 0,
				unit: amountMatch?.[2] || '',
				name: ingredientCell
			});
		});
	} else {
		const ingredientList = $('ul').first();

		if (ingredientList.length) {
			ingredientList.find('li').each((_, li) => {
				const text = clean($(li).text());

				const match = text.match(/^([\d.,\/]+)\s+(\S+)\s+(.+)$/u);

				if (!match) {
					ingredients.push({
						amount: 0,
						unit: '',
						name: text
					});
					return;
				}

				ingredients.push({
					amount: Number(match[1]),
					unit: match[2],
					name: match[3]
				});
			});
		}
	}

	// STEPS
	const steps: string[] = [];

	let inPreparationSection = false;

	$('p').each((_, p) => {
		const text = clean($(p).text());

		if (/PARUOŠIMO BŪDAS/i.test(text)) {
			inPreparationSection = true;
			return;
		}

		if (!inPreparationSection) return;

		const stepMatch = text.match(/^(\d+)\.?\s*(.*)$/);

		if (stepMatch) {
			steps.push(stepMatch[2]);
		}
	});

	return {
		title,
		image,
		servings,
		prepTime,
		cookTime: 0,
		ingredients,
		steps
	};
}
function extractRecipe2(html): Partial<Omit<CreateRecipeModel, 'userId'>> {
	const $ = cheerio.load(html);

	const clean = (s = '') =>
		s
			.replace(/\u00a0/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

	// -------------------
	// TITLE
	// -------------------
	const title = clean($('p').first().text());

	// -------------------
	// IMAGE (real URL, not boolean)
	// -------------------
	const image =
		$('img').first().attr('src') ||
		$('a[href$=".jpg"], a[href$=".png"]').first().attr('href') ||
		null;

	// -------------------
	// RAW TEXT
	// -------------------
	const text = clean($.text());

	// -------------------
	// SERVINGS
	// -------------------
	const servings =
		text.match(/porcij(?:ų|u)\s*skai[čČ]ius\s*:?\s*(\d+)/i)?.[1] || null;

	// -------------------
	// PREP TIME (fix NaN issue)
	// -------------------
	const prepRaw = $('p')
		.toArray()
		.map((el) => clean($(el).text()))
		.find((t) => /paruo[šŠ]imo\s*laikas/i.test(t));

	$('p')
		.toArray()
		.forEach((el) => {
			console.log(clean($(el).text()));
		});
	const prepTime = parseTimeToMinutes(prepRaw);

	// -------------------
	// INGREDIENTS
	// -------------------
	const ingredients = [];

	$('ul li, table tr').each((_, el) => {
		const row = clean($(el).text());

		// skip metadata rows
		if (/paruo[Šš]imo|porcij/i.test(row)) return;

		// table style: "150 gramų Sūris"
		const tableMatch = row.match(/^(\d+(?:[.,]\d+)?)\s*(\w+)?\s*(.+)$/u);

		if (tableMatch) {
			ingredients.push({
				amount: tableMatch[1],
				unit: tableMatch[2] || '',
				name: tableMatch[3]
			});
		} else {
			ingredients.push({
				amount: null,
				unit: '',
				name: row
			});
		}
	});

	// -------------------
	// STEPS
	// -------------------
	const steps = [];

	let inSteps = false;

	$('p').each((_, el) => {
		const t = clean($(el).text());

		if (/gaminimo eiga/i.test(t)) {
			inSteps = true;
			return;
		}

		if (!inSteps) return;

		const parts = t.split(/<br\s*\/?>|\n/gi);

		for (const p of parts) {
			const step = clean(p);
			if (!step) continue;

			steps.push(step);
		}
	});

	return {
		title,
		image,
		servings: servings ? Number(servings) : null,
		prepTime,
		cookTime: null,
		ingredients,
		steps
	};
}

function parseTimeToMinutes(text = '') {
	const t = text
		.toLowerCase()
		.replace(/\u00a0/g, ' ')
		.replace(',', '.');

	// extract number
	const numMatch = t.match(/(\d+(?:\.\d+)?)/);
	if (!numMatch) return null;

	const value = parseFloat(numMatch[1]);

	// hours
	if (t.includes('val')) {
		return Math.round(value * 60);
	}

	// minutes
	if (t.includes('min')) {
		return Math.round(value);
	}

	return null;
}

// -----------------------------
function extractRecipe3(html): Partial<Omit<CreateRecipeModel, 'userId'>> {
	const $ = cheerio.load(html);

	let ingredients = extractIngredientsFromTable($);
	if (!ingredients.length) ingredients = extractIngredientsFromList($);
	return {
		title: getTitle($),
		image: getImage($),
		prepTime: extractTimeMinutes($) || 0,
		cookTime: 0,
		ingredients,
		steps: extractSteps($)
	};
}
// -----------------------------
function extractSteps($) {
	const steps = [];
	let started = false;

	$('p').each((_, el) => {
		const text = $(el).text().trim();

		// heuristic: skip very short/meta lines
		if (!started && text.length > 80) {
			started = true;
		}

		if (!started) return;

		// ignore metadata-like lines
		if (/komentar|autori|recept/i.test(text)) return;

		// split inline <br>
		text.split(/<br\s*\/?>/gi).forEach((part) => {
			const t = part.trim();
			if (t.length > 10) steps.push(t);
		});
	});

	return steps;
}
function extractIngredientsFromTable($) {
	const ingredients = [];

	$('table tr').each((_, row) => {
		const cells = $(row)
			.find('td')
			.toArray()
			.map((td) => $(td).text().trim());

		if (cells.length < 2) return;

		// heuristic split, not language-based
		const amount = cells[0];
		const name = cells.slice(1).join(' ');

		ingredients.push({ amount, name });
	});

	return ingredients;
}
function extractIngredientsFromList($) {
	return $('ul li')
		.toArray()
		.map((li) => ({
			text: $(li).text().trim()
		}));
}
function extractTimeMinutes($) {
	const text = $.text()
		.replace(/\u00a0/g, ' ')
		.toLowerCase();

	// matches: 1 val, 1.5 val, 45 min, ~2 h, etc.
	const match = text.match(/(\d+(?:[.,]\d+)?)\s*(val|h|min)/i);
	if (!match) return null;

	let value = parseFloat(match[1].replace(',', '.'));
	const unit = match[2];

	if (unit.startsWith('val') || unit === 'h') return Math.round(value * 60);
	if (unit === 'min') return Math.round(value);

	return null;
}
function getImage($) {
	return (
		$('img').first().attr('src') ||
		$('a[href$=".jpg"], a[href$=".png"]').first().attr('href') ||
		null
	);
}
function getTitle($) {
	return (
		$('p, h1, h2')
			.toArray()
			.map((el) => $(el).text().trim())
			.find((t) => t.length > 5) || null
	);
}
// -----------------------------
