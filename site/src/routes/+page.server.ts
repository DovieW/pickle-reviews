import fs from 'node:fs/promises';
import path from 'node:path';
import { parsePicklesMarkdown, type PickleItem } from '$lib/pickles';

export type PageData = {
	items: PickleItem[];
	sections: string[];
	tags: string[];
};

export async function load(): Promise<PageData> {
	const mdPath = path.resolve(process.cwd(), '..', 'Pickles Tracking List.md');
	const markdown = await fs.readFile(mdPath, 'utf-8');
	const items = parsePicklesMarkdown(markdown);
	const sections = Array.from(new Set(items.map((i) => i.section)));
	const tags = Array.from(new Set(items.flatMap((i) => i.tags))).sort((a, b) => a.localeCompare(b));
	return { items, sections, tags };
}
