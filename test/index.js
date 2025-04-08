import { md, createStyleSheet, getMarkdown, registerLanguages, parse } from '@aegisjsproject/markdown';
import { css } from '@aegisjsproject/core/parsers/css.js';
import javascript from 'highlight.js/languages/javascript.min.js';
import cssLang from 'highlight.js/languages/css.min.js';
import xml from 'highlight.js/languages/xml.min.js';

const styles = css`:host {
	color-scheme: light dark;
	padding: 0.8rem;
}

:host(:popover-open) {
	max-height: 95dvh;
	width: 80%;
	border: none;
}

:host(:popover-open)::backdrop {
	background-color: rgba(0, 0, 0, 0.7);
	backdrop-filter: blur(4px);
}`;

registerLanguages({ javascript, css: cssLang, xml });

document.head.append(
	createStyleSheet('github', { media: '(prefers-color-scheme: light)' }),
	createStyleSheet('github-dark', { media: '(prefers-color-scheme: dark)' }),
);

document.getElementById('header').append(md`
	# Hello, World!

	## It is currently ${new Date()}.
`);

customElements.define('md-preview', class HTMLMDPreviewElement extends HTMLElement {
	#shadow;
	#connected = Promise.withResolvers();

	constructor() {
		super();

		this.#shadow = this.attachShadow({ mode: 'open' });
		const container = document.createElement('div');
		container.id = 'container';
		container.part.add('container');

		this.#shadow.append(
			createStyleSheet('github', { media: '(prefers-color-scheme: light)' }),
			createStyleSheet('github-dark', { media: '(prefers-color-scheme: dark)' }),
			container,
		);

		this.#shadow.adoptedStyleSheets = [styles];
	}

	connectedCallback() {
		if (this.textContent.length !== 0 && ! this.hasAttribute('src')) {
			this.content = this.textContent;
		}

		this.#connected.resolve();
	}

	disconnectedCallback() {
		this.#connected = Promise.withResolvers();
	}

	async attributeChangedCallback(name, oldVal, newVal) {
		await this.#connected.promise;

		switch(name) {
			case 'src':
				if (typeof newVal === 'string') {
					this.#shadow.getElementById('container').replaceChildren(await getMarkdown(this.src));
				} else {
					this.#shadow.getElementById('container').replaceChildren();
				}
				break;

			default:
				throw new Error(`Unhandled attribute change: ${name}.`);
		}
	}

	set content(val) {
		if (typeof val === 'string' && val.length !== 0) {
			this.#shadow.getElementById('container').replaceChildren(parse(val));
			this.scrollIntoView({ behavior: 'smooth', block: 'start' });
		} else {
			this.#shadow.getElementById('container').replaceChildren();
		}
	}

	get src() {
		return this.getAttribute('src');
	}

	set src(val) {
		if (typeof val === 'string' || val instanceof URL) {
			this.setAttribute('src', val);
		} else {
			this.removeAttribute('src');
		}
	}

	clear() {
		this.content = null;
	}

	static get observedAttributes() {
		return ['src'];
	}
});

document.forms.test.addEventListener('submit', event => {
	event.preventDefault();
	const data = new FormData(event.target);
	document.getElementById('preview').content = data.get('md');
	document.getElementById('preview').showPopover();
});

document.forms.test.addEventListener('reset', () => document.getElementById('preview').clear());
