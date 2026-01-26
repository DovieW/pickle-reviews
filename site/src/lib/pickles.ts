export type InlinePart = { text: string; url?: string };

export type PickleItem = {
	section: string;
	/** Plain-text title (used for search/filter) */
	name: string;
	/** Title with clickable links (parsed from the markdown line) */
	titleParts: InlinePart[];
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

function parseInlineLinks(text: string): { parts: InlinePart[]; plain: string } {
	const parts: InlinePart[] = [];
	let plain = '';

	const re = /\[([^\]]+)\]\(([^)]+)\)/g;
	let lastIndex = 0;
	let m: RegExpExecArray | null;

	while ((m = re.exec(text)) !== null) {
		const [full, label, url] = m;
		const before = text.slice(lastIndex, m.index);
		if (before) {
			parts.push({ text: before });
			plain += before;
		}
		parts.push({ text: label, url });
		plain += label;
		lastIndex = m.index + full.length;
	}

	const tail = text.slice(lastIndex);
	if (tail) {
		parts.push({ text: tail });
		plain += tail;
	}

	return { parts: parts.length ? parts : [{ text }], plain: plain.replace(/\s+/g, ' ').trim() || text.trim() };
}

function extractLink(text: string): { name: string; url?: string; detail?: string; titleParts: InlinePart[] } {
	// Keep existing behavior (first link drives URL), but also parse inline links everywhere.
	const { parts, plain } = parseInlineLinks(text);
	const firstLink = parts.find((p) => p.url);

	// If the line starts with a link, keep trailing text as "detail" (previous behavior).
	const leading = text.match(/^\[([^\]]+)\]\(([^)]+)\)(.*)$/);
	if (leading) {
		const [, name, url, rest] = leading;
		const detail = (rest ?? '').trim();
		return { name: plain || name.trim(), url, detail: detail || undefined, titleParts: parts };
	}

	return { name: plain, url: firstLink?.url, detail: undefined, titleParts: parts };
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
			titleParts: link.titleParts,
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
