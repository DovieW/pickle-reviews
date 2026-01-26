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

	let { data } = $props<{ data: { items: PickleItem[]; tags: string[] } }>();

	let query = $state('');
	let selectedTag = $state<string>('');

	const filtered = $derived(() => {
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

	const sections = $derived(() => {
		const m = new Map<string, PickleItem[]>();
		for (const item of filtered) {
			const list = m.get(item.section) ?? [];
			list.push(item);
			m.set(item.section, list);
		}
		return Array.from(m.entries());
	});
</script>

<svelte:head>
	<title>Pickles Tracking List</title>
</svelte:head>

<main>
	<header>
		<h1>Pickles Tracking List</h1>
		<p class="meta">Read-only view generated from Obsidian.</p>
	</header>

	<section class="controls">
		<input class="search" type="search" placeholder="Search (name, section, tag)" bind:value={query} />

		<select class="tag" bind:value={selectedTag}>
			<option value="">All tags</option>
			{#each data.tags as t}
				<option value={t}>#{t}</option>
			{/each}
		</select>
	</section>

	{#each sections as [section, items]}
		<section class="section">
			<h2>{section} <span class="count">({items.length})</span></h2>
			<div class="grid">
				{#each items as item}
					<article class="card" data-checked={item.checked}>
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
		color: #0f172a;
	}

	header {
		margin-bottom: 16px;
	}

	h1 {
		font-size: 28px;
		margin: 0 0 6px;
	}

	.meta {
		margin: 0;
		color: #475569;
		font-size: 14px;
	}

	.controls {
		display: flex;
		gap: 10px;
		align-items: center;
		margin: 18px 0 24px;
		flex-wrap: wrap;
	}

	.search {
		flex: 1;
		min-width: 240px;
		padding: 10px 12px;
		border: 1px solid #cbd5e1;
		border-radius: 10px;
		background: #fff;
	}

	.tag {
		padding: 10px 12px;
		border: 1px solid #cbd5e1;
		border-radius: 10px;
		background: #fff;
	}

	.section {
		margin-top: 28px;
	}

	h2 {
		font-size: 18px;
		margin: 0 0 10px;
	}

	.count {
		color: #64748b;
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
		gap: 10px;
		border: 1px solid #e2e8f0;
		border-radius: 14px;
		background: #fff;
		overflow: hidden;
		box-shadow: 0 1px 1px rgba(15, 23, 42, 0.04);
	}

	.card[data-checked='true'] {
		opacity: 0.55;
	}

	.thumb {
		width: 92px;
		height: 92px;
		object-fit: cover;
		background: #f1f5f9;
	}

	.body {
		padding: 10px 10px 10px 0;
	}

	h3 {
		font-size: 14px;
		margin: 0 0 8px;
		line-height: 1.2;
	}

	a {
		color: #0f172a;
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
		border: 1px solid #e2e8f0;
		background: #f8fafc;
		border-radius: 999px;
		padding: 4px 8px;
		font-size: 12px;
		cursor: pointer;
	}

	.tagpill:hover {
		background: #eef2ff;
		border-color: #c7d2fe;
	}
</style>
