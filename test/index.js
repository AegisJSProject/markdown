import { md } from '@shgysk8zer0/aegis-markdown';

document.getElementById('header').append(md`
# Hello, World!
`);

function createStyleSheet(src, { media } = {}) {
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.crossOrigin = 'anonymous';
	link.referrerPolicy = 'no-referrer';

	if (typeof media === 'string') {
		link.media = media;
	}

	link.href = src;

	return link;
}

const lightStyle = src => createStyleSheet(src, { media: '(prefers-color-scheme: light)' });
const darkStyle = src => createStyleSheet(src, { media: '(prefers-color-scheme: dark)' });

customElements.define('md-preview', class HTMLMDPreviewElement extends HTMLElement {
	#shadow;

	constructor() {
		super();

		this.#shadow = this.attachShadow({ mode: 'closed' });
		const container = document.createElement('div');
		container.id = 'container';
		container.part.add('container');

		this.#shadow.append(
			lightStyle('../node_modules/@highlightjs/cdn-assets/styles/github.min.css'),
			darkStyle('../node_modules/@highlightjs/cdn-assets/styles/github-dark.min.css'),
			container,
		);
	}

	set content(val) {
		if (typeof val === 'string' && val.length !== 0) {
			this.#shadow.getElementById('container').replaceChildren(md`${val}`);
			this.scrollIntoView({ behavior: 'smooth', block: 'start' });
		} else {
			this.#shadow.getElementById('container').replaceChildren();
		}
	}

	clear() {
		this.content = null;
	}
});

document.forms.test.addEventListener('submit', event => {
	event.preventDefault();
	const data = new FormData(event.target);
	document.getElementById('preview').content = data.get('md');
});

document.forms.test.addEventListener('reset', () => document.getElementById('preview').clear());
