import terser from '@rollup/plugin-terser';
import { rollupImport } from '@shgysk8zer0/rollup-import';
import { importmap } from '@shgysk8zer0/importmap';

export default {
	input: 'markdown.js',
	external: ['@aegisjsproject/core/stringify.js'],
	plugins: [rollupImport(importmap)],
	output: [{
		file: 'markdown.cjs',
		format: 'cjs',
	}, {
		file: 'markdown.min.js',
		format: 'esm',
		plugins: [terser()],
	}],
};

