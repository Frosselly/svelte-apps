// services/image.service.ts
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function saveImage(file: File, ownerId: string): Promise<string> {
	if (!ALLOWED_TYPES.has(file.type)) {
		throw new Error(`Unsupported image type: ${file.type}`);
	}
	if (file.size > MAX_SIZE) {
		throw new Error('Image too large');
	}

	const buffer = Buffer.from(await file.arrayBuffer());

	// re-encode: strips EXIF/metadata, normalizes format, catches spoofed mime types
	// (sharp will throw if the actual bytes aren't a real image)
	const processed = await sharp(buffer)
		.rotate() // auto-orient from EXIF before stripping it
		.resize({ width: 1600, withoutEnlargement: true })
		.webp({ quality: 82 })
		.toBuffer();

	const filename = `${crypto.randomUUID()}.webp`;
	const relPath = `/uploads/recipes/${ownerId}/${filename}`;
	const absPath = path.join('static', relPath);

	await fs.mkdir(path.dirname(absPath), { recursive: true });
	await fs.writeFile(absPath, processed);

	return relPath;
}

export async function deleteImageFile(relPath: string) {
	if (!relPath) return;
	const absPath = path.join('static', relPath);
	await fs.unlink(absPath).catch((err) => {
		if (err.code !== 'ENOENT') throw err; // already gone is fine, anything else isn't
	});
}
