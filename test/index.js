import { md, createStyleSheet, getMarkdown, registerLanguages } from '@aegisjsproject/markdown';
import javascript from 'highlight.js/languages/javascript.min.js';
import css from 'highlight.js/languages/css.min.js';
import xml from 'highlight.js/languages/xml.min.js';

registerLanguages({ javascript, css, xml });

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

	constructor() {
		super();

		this.#shadow = this.attachShadow({ mode: 'closed' });
		const container = document.createElement('div');
		container.id = 'container';
		container.part.add('container');

		this.#shadow.append(
			createStyleSheet('github', { media: '(prefers-color-scheme: light)' }),
			createStyleSheet('github-dark', { media: '(prefers-color-scheme: dark)' }),
			container,
		);
	}

	async attributeChangedCallback(name, oldVal, newVal) {
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
			this.#shadow.getElementById('container').replaceChildren(md`${val}`);
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
});

document.forms.test.addEventListener('reset', () => document.getElementById('preview').clear());
