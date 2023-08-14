import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/kit/vite';

const config = {
  kit: {
    adapter: adapter(),
  },
  preprocess: vitePreprocess(),
  vitePlugin: {
		inspector: true,
	},
};

export default config;