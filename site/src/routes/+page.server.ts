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

	const allowedSections = ['Not Rated', 'Best', 'Good', "Ok - Wouldn't Buy", "Bad - Wouldn't Eat"] as const;
	const allowed = new Set<string>(allowedSections);

	const items = parsePicklesMarkdown(markdown).filter((i) => allowed.has(i.section));
	const sections = allowedSections.filter((s) => items.some((i) => i.section === s));
	const tags = Array.from(new Set(items.flatMap((i) => i.tags))).sort((a, b) => a.localeCompare(b));
	return { items, sections, tags };
}
