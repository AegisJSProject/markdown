import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { sanitizeString } from '@aegisjsproject/core/parsers/html.js';
import { stringify } from '@aegisjsproject/core/stringify.js';
import hljs from 'highlight.js/core.min.js';
import plaintext from 'highlight.js/languages/plaintext.min.js';

export const hljsURL = new URL(`https://unpkg.com/@highlightjs/cdn-assets@${hljs.versionString}/`);

export const registerLanguage =  (name, def) => hljs.registerLanguage(name, def);

export const registerLanguages = langsObj => Object.entries(langsObj)
	.forEach(([name, lang]) => registerLanguage(name, lang));

export const listLanguages = () => hljs.listLanguages();

export const getLanguage = lang => hljs.getLanguage(lang);

export const getLanguagesObject = () => Object.fromEntries(listLanguages().map(lang => [lang, getLanguage(lang)]));

registerLanguage('plaintext', plaintext);

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
	languages,
	allowElements,
	allowAttributes,
	allowCustomElements,
	allowUnknownMarkup,
	allowComments,
} = {}) {
	if (typeof languages === 'object' && languages !== null) {
		registerLanguages(languages);
	}

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
		const parsed = marked.parse(String.raw(strings, ...args.map(stringify)), { gfm, breaks, silent });

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

export async function loadLanguage(lang) {
	await import(`${hljsURL}es/languages/${lang}.min.js`)
		.then(mod => registerLanguage(lang, mod.default));
}

export const loadLanguages = async (...langs) => Promise.all(langs.map(loadLanguage));
