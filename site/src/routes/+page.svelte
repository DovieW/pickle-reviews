<script lang="ts">
	type PickleItem = {
		section: string;
		name: string;
		url?: string;
		tags: string[];
		image?: string;
		notes?: string;
		checked: boolean;
	};

	let { data } = $props<{ data: { items: PickleItem[]; tags: string[]; sections: string[] } }>();

	const sectionId = (s: string) =>
		s
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

	const jumpTo = (section: string) => {
		document.getElementById(sectionId(section))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	let query = $state('');
	let selectedTag = $state<string>('');

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return data.items.filter((item) => {
			if (selectedTag && !item.tags.includes(selectedTag)) return false;
			if (!q) return true;
			return (
				item.name.toLowerCase().includes(q) ||
				item.section.toLowerCase().includes(q) ||
				item.tags.some((t) => t.toLowerCase().includes(q))
			);
		});
	});

	const sections = $derived.by(() => {
		const m = new Map<string, PickleItem[]>();
		for (const item of filtered) {
			const list = m.get(item.section) ?? [];
			list.push(item);
			m.set(item.section, list);
		}

		// Keep section order consistent (Best -> Good -> Bad -> Not Rated)
		return data.sections
			.map((s) => [s, m.get(s) ?? []] as const)
			.filter(([, items]) => items.length > 0);
	});
</script>

<svelte:head>
	<title>Pickles Tracking List</title>
</svelte:head>

<main>
	<div class="top">
		<header>
			<h1>Pickles Tracking List</h1>
		</header>

		<section class="controls">
			<select class="tag" bind:value={selectedTag}>
				<option value="">All tags</option>
				{#each data.tags as t}
					<option value={t}>#{t}</option>
				{/each}
			</select>

			<nav class="sections" aria-label="Jump to section">
				{#each data.sections as s}
					<button class="sectionbtn" type="button" onclick={() => jumpTo(s)}>{s}</button>
				{/each}
			</nav>

			<input class="search" type="search" placeholder="Search" bind:value={query} />
		</section>
	</div>

	{#each sections as [section, items]}
		<section class="section" id={sectionId(section)}>
			<h2>{section} <span class="count">({items.length})</span></h2>
			<div class="grid">
				{#each items as item}
					<article class="card" data-checked={item.checked} data-has-image={item.image ? 'true' : 'false'}>
						{#if item.image}
							<img class="thumb" src={item.image} alt={item.name} loading="lazy" />
						{/if}
						<div class="body">
							<h3>
								{#if item.url}
									<a href={item.url} target="_blank" rel="noreferrer">{item.name}</a>
								{:else}
									{item.name}
								{/if}
							</h3>
							{#if item.tags.length}
								<div class="tags">
									{#each item.tags as t}
										<button class="tagpill" type="button" onclick={() => (selectedTag = t)}>#{t}</button>
									{/each}
								</div>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</section>
	{/each}
</main>

<style>
	main {
		max-width: 1100px;
		margin: 0 auto;
		padding: 24px 16px 64px;
		font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
		color: #e2e8f0;
	}

	.top {
		position: sticky;
		top: 0;
		z-index: 10;
		background: #0b1220;
		padding: 18px 0 12px;
		border-bottom: 1px solid #0f172a;
	}

	header {
		margin-bottom: 10px;
	}

	h1 {
		font-size: 28px;
		margin: 0 0 6px;
	}


	.controls {
		display: flex;
		gap: 10px;
		align-items: center;
		margin: 0;
		flex-wrap: wrap;
	}

	.sections {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.sectionbtn {
		border: 1px solid #334155;
		background: #111827;
		color: #e2e8f0;
		border-radius: 999px;
		padding: 8px 10px;
		font-size: 12px;
		cursor: pointer;
		white-space: nowrap;
		line-height: 1;
	}
	.sectionbtn:hover {
		background: #0b1220;
		border-color: #475569;
	}

	.search {
		width: 190px;
		padding: 8px 10px;
		border: 1px solid #334155;
		border-radius: 10px;
		background: #0f172a;
		color: #e2e8f0;
		margin-left: auto;
	}
	.search::placeholder {
		color: #64748b;
	}

	.tag {
		padding: 10px 12px;
		border: 1px solid #334155;
		border-radius: 10px;
		background: #0f172a;
		color: #e2e8f0;
	}

	.section {
		margin-top: 28px;
		padding-top: 16px;
		border-top: 1px solid #0f172a;
		scroll-margin-top: 140px;
	}

	h2 {
		font-size: 18px;
		margin: 0 0 10px;
		color: #f1f5f9;
	}

	.count {
		color: #94a3b8;
		font-weight: 500;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 12px;
	}

	.card {
		display: grid;
		grid-template-columns: 92px 1fr;
		gap: 12px;
		border: 1px solid #1e293b;
		border-radius: 14px;
		background: #0f172a;
		overflow: hidden;
		box-shadow: 0 1px 1px rgba(0, 0, 0, 0.35);
	}

	.card[data-has-image='false'] {
		grid-template-columns: 1fr;
	}

	.card[data-checked='true'] {
		opacity: 0.55;
	}

	.thumb {
		width: 92px;
		height: 92px;
		object-fit: cover;
		background: #0b1220;
	}

	.body {
		padding: 12px 12px 12px 0;
	}
	.card[data-has-image='false'] .body {
		padding: 12px;
	}

	h3 {
		font-size: 14px;
		margin: 0 0 8px;
		line-height: 1.2;
		color: #e2e8f0;
	}

	a {
		color: #e2e8f0;
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}

	.tags {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.tagpill {
		border: 1px solid #334155;
		background: #111827;
		color: #e2e8f0;
		border-radius: 999px;
		padding: 4px 8px;
		font-size: 12px;
		cursor: pointer;
	}

	.tagpill:hover {
		background: #0b1220;
		border-color: #475569;
	}
</style>
