import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { createHTMLParser, text } from '@shgysk8zer0/aegis';

const parseStr = args => text.apply(null, args);

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
	const parser = createHTMLParser({
		allowElements, allowAttributes, allowCustomElements, allowUnknownMarkup,
		allowComments,
	});

	const marked = new Marked(
		markedHighlight({
			langPrefix,
			highlight(code, lang) {
				const language = hljs.getLanguage(lang) ? lang : fallbackLang;
				return hljs.highlight(code, { language }).value;
			}
		})
	);

	return (...args) => parser([marked.parse(parseStr(args), { gfm, breaks, silent })]);
}

export const md = createMDParser({});
