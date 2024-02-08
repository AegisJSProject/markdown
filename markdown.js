import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { text, sanitizeString } from '@shgysk8zer0/aegis';

export function createMDParser({
	gfm = true,
	breaks = false,
	silent = false,
	langPrefix = 'hljs language-',
	fallbackLang = 'plaintext',
	allowElements,
	allowAttributes,
	allowCustomElements,
	allowUnknownMarkup,
	allowComments,
} = {}) {
	const marked = new Marked(
		markedHighlight({
			langPrefix,
			highlight(code, lang) {
				const language = hljs.getLanguage(lang) ? lang : fallbackLang;
				return hljs.highlight(code, { language }).value;
			}
		})
	);

	return (strings, ...args) => {
		const parsed = marked.parse(text(strings, ...args), { gfm, breaks, silent });

		return sanitizeString(parsed, {
			allowElements, allowAttributes, allowCustomElements, allowUnknownMarkup,
			allowComments,
		});
	};
}

export const md = createMDParser({});
