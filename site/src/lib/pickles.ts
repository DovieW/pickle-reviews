export type PickleItem = {
	section: string;
	name: string;
	url?: string;
	detail?: string;
	tags: string[];
	image?: string;
	notes?: string;
	checked: boolean;
};

const HEADING_RE = /^##\s+(.*)$/;
const ITEM_RE = /^- \[( |x)\]\s+(.*)$/;
const TAG_RE = /(^|\s)#([A-Za-z0-9_\-]+)/g;
const IMG_SRC_RE = /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/i;

function extractTags(text: string): string[] {
	const tags: string[] = [];
	let match: RegExpExecArray | null;
	while ((match = TAG_RE.exec(text)) !== null) {
		tags.push(match[2]);
	}
	return Array.from(new Set(tags));
}

function extractLink(text: string): { name: string; url?: string; detail?: string } {
	// Matches markdown links: [Name](url)
	const m = text.match(/^\[([^\]]+)\]\(([^)]+)\)(.*)$/);
	if (!m) return { name: text.trim() };
	const [, name, url, rest] = m;
	const detail = (rest ?? '').trim();
	return { name: name.trim(), url, detail: detail || undefined };
}

export function parsePicklesMarkdown(markdown: string): PickleItem[] {
	const lines = markdown.split(/\r?\n/);
	let section = 'Uncategorized';
	const items: PickleItem[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		const heading = line.match(HEADING_RE);
		if (heading) {
			section = heading[1].trim();
			continue;
		}

		const item = line.match(ITEM_RE);
		if (!item) continue;

		const checked = item[1] === 'x';
		const remainder = item[2].trim();

		// Notes/tags/images often appear on indented following lines.
		const extraLines: string[] = [];
		let j = i + 1;
		while (j < lines.length && /^\s+/.test(lines[j]) && !lines[j].match(ITEM_RE) && !lines[j].match(HEADING_RE)) {
			extraLines.push(lines[j].trim());
			j++;
		}
		i = j - 1;

		const extraText = extraLines.join(' ');
		const tags = extractTags(remainder + ' ' + extraText);
		const imgMatch = (remainder + ' ' + extraText).match(IMG_SRC_RE);
		const image = imgMatch?.[1];

		const link = extractLink(remainder);

		const noteLines = extraLines
			.map((l) => l.replace(IMG_SRC_RE, '').replace(TAG_RE, '').trim())
			.filter(Boolean);

		items.push({
			section,
			name: link.name,
			url: link.url,
			detail: link.detail,
			tags,
			image,
			notes: noteLines.length ? noteLines.join('\n') : undefined,
			checked
		});
	}

	return items;
}
