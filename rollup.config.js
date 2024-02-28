const externalPackages = ['@aegisjsproject/core', 'marked', 'marked-highlight', 'highlight.js'];

export default {
	input: 'markdown.js',
	output: {
		file: 'markdown.cjs',
		format: 'cjs',
	},
	external: id => externalPackages.some(pkg => id.startsWith(pkg)),
};

