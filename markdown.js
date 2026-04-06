import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { stringify } from '@aegisjsproject/core/stringify.js';
import hljs from 'highlight.js/core.min.js';
import plaintext from 'highlight.js/languages/plaintext.min.js';

const SANITIZER = {
	elements: [
		'a', 'blockquote', 'br', 'code', 'del', 'em', 'h1', 'h2', 'h3', 'h4',
		'h5', 'h6', 'hr', 'img', 'li', 'ol', 'p', 'pre', 'strong', 'table',
		'tbody', 'td', 'th', 'thead', 'tr', 'ul', 'span', 'div', 'details',
		'summary', 'dialog', 'sup', 'sub', 'kbd', 'samp', 'var', 'mark', 'q',
		'cite', 'abbr', 'figure', 'figcaption', 'time', 'address', 's', 'u',
		'small', 'b', 'i', 'dfn', 'ins', 'slot',
	],
	attributes: [
		'href', 'src', 'alt', 'width', 'height','download', 'title', 'class', 'id',
		'loading', 'crossorigin', 'rel', 'decoding', 'target', 'popover',
		'srcset', 'sizes', 'media', 'datetime', 'dir', 'lang', 'name', 'hidden',
		'inert', 'itemscope', 'itemtype', 'itemprop', 'itemref', 'itemid',
	],
	comments: true,
	dataAttributes: true,
};

export const hljsURL = new URL(`https://unpkg.com/@highlightjs/cdn-assets@${hljs.versionString}/`);

export const registerLanguage =  (name, def) => hljs.registerLanguage(name, def);

export const registerLanguages = langsObj => Object.entries(langsObj)
	.forEach(([name, lang]) => registerLanguage(name, lang));

export const listLanguages = () => hljs.listLanguages();

export const getLanguage = lang => hljs.getLanguage(lang);

export const getLanguagesObject = () => Object.fromEntries(listLanguages().map(lang => [lang, getLanguage(lang)]));

registerLanguage('plaintext', plaintext);

const sluggify = str => str.trim().replaceAll(/[^A-Za-z0-9]+/g, '-').toLowerCase();

function cleanUp(template, {
	addHeadingIDs = true,
	crossOrigin = 'anonymous',
	loading = 'lazy',
	idPrefix = null,
} = {}) {
	const frag = template.content;

	if (addHeadingIDs) {
		frag.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
			heading.id = typeof idPrefix === 'string' ? `${idPrefix}-${sluggify(heading.textContent)}` : sluggify(heading.textContent);
		});
	}

	frag.querySelectorAll('img:not([laoding])').forEach(img => {
		img.crossOrigin = crossOrigin;
		img.loading = loading;
	});

	return frag;
}

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

export function parse(input, {
	gfm = true,
	breaks = false,
	silent = false,
	langPrefix = 'hljs language-',
	fallbackLang = 'plaintext',
	addHeadingIDs = true,
	idPrefix = null,
	sanitizer: {
		elements = SANITIZER.elements,
		attributes = SANITIZER.attributes,
		dataAttributes = SANITIZER.dataAttributes,
		comments = SANITIZER.comments,
	} = SANITIZER,
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

	const template = document.createElement('template');
	let raw = input.replaceAll(/\\`/g, '`');

	if (String.dedent instanceof Function && raw.startsWith('\n') && /\n\t*$/.test(raw)) {
		const tmp = [raw];
		tmp.raw = [raw];
		Object.freeze(tmp);
		raw = String.dedent(tmp);
	}

	const parsed = marked.parse(raw, { gfm, breaks, silent });

	template.setHTML(parsed, {
		sanitizer: { elements, attributes, dataAttributes, comments },
	});

	return cleanUp(template, { addHeadingIDs, idPrefix });
}

export function createMDParser({
	gfm = true,
	breaks = false,
	silent = false,
	langPrefix = 'hljs language-',
	fallbackLang = 'plaintext',
	addHeadingIDs = true,
	idPrefix = null,
	languages,
	sanitizer: {
		elements = SANITIZER.elements,
		attributes = SANITIZER.attributes,
		dataAttributes = SANITIZER.dataAttributes,
		comments = SANITIZER.comments,
	} = SANITIZER,
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
		const template = document.createElement('template');
		let raw = String.raw(strings, ...args.map(stringify)).replaceAll(/\\`/g, '`');

		if (String.dedent instanceof Function && raw.startsWith('\n') && /\n\t*$/.test(raw)) {
			const tmp = [raw];
			tmp.raw = [raw];
			Object.freeze(tmp);
			raw = String.dedent(tmp);
		}

		const parsed = marked.parse(raw, { gfm, breaks, silent });

		template.setHTML(parsed, {
			sanitizer: { elements: elements, attributes, comments, dataAttributes }
		});

		return cleanUp(template, { addHeadingIDs, idPrefix });
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

	const resp = await fetch(url, { mode, referrerPolicy, headers, ...rest }).catch(() => Response.error());

	if (! resp.ok) {
		throw new DOMException(`${resp.url} [${resp.status}]`, 'NetworkError');
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
