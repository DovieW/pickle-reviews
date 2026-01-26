import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ pages: 'build', assets: 'build' }),
		paths: {
			base: '/obsidian-pickle-tracking-list'
		},
		prerender: {
			entries: ['*']
		}
	}
};

export default config;
