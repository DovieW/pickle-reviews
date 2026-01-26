<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="color-scheme" content="dark" />
</svelte:head>

{@render children()}

<style>
	:global(html) {
		color-scheme: dark;
		background: #0b1220;
	}
	:global(body) {
		margin: 0;
		background: #0b1220;
	}
	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
	}
</style>
