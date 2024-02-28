import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { sanitizeString } from '@aegisjsproject/core/core.js';

export const hljsURL = new URL(`https://unpkg.com/@highlightjs/cdn-assets@${hljs.versionString}/`);

export function createStyleSheet(path, { media, base = hljsURL } = {}) {
	const link = document.createElement('link');
	link.relList.add('stylesheet');
	link.crossOrigin = 'anonymous';
	link.referrerPolicy = 'no-referrer';

	if (typeof media === 'string') {
		link.media = media;
	} else if (media instanceof MediaQueryList) {
		link.media = media.media;
	}

	link.href = new URL(`./styles/${path}.min.css`, base);
	return link;
}

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

	return (...args) => {
		const parsed = marked.parse(String.raw.apply(null, args), { gfm, breaks, silent });

		return sanitizeString(parsed, {
			allowElements, allowAttributes, allowCustomElements, allowUnknownMarkup,
			allowComments,
		});
	};
}

export const md = createMDParser({});

export async function getMarkdown(url, {
	mode = 'cors',
	referrerPolicy = 'no-referrer',
	parser =  md,
	headers = new Headers({ Accept: 'text/markdown' }),
	...rest
} = {}) {
	if (typeof headers === 'object' && ! (headers instanceof Headers)) {
		return await getMarkdown(url, { mode, referrerPolicy, parser, headers: new Headers(headers), ...rest });
	} else if (! headers.has('Accept')) {
		headers.set('Accept', 'text/markdown');
	}

	const resp = await fetch(url, { mode, referrerPolicy, headers, ...rest });

	if (! resp.ok) {
		throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
	} else if (! resp.headers.get('Content-Type').startsWith('text/markdown')) {
		throw new TypeError(`Invalid Content-Type: ${resp.headers.get('Content-Type')}.`);
	} else {
		return parser`${await resp.text()}`;
	}
}
