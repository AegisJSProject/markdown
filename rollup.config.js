const externalPackages = ['@shgysk8zer0/aegis', 'marked', 'marked-highlight', 'highlight.js'];

export default {
	input: 'markdown.js',
	output: {
		file: 'markdown.cjs',
		format: 'cjs',
	},
	external: id => externalPackages.some(pkg => id.startsWith(pkg)),
};

