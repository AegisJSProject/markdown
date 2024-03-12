# `@aegisjsproject/markdown`

Markdown parser for [`@aegisjsproject/core`](https://github.com/AegisJSProject/core)

[![CodeQL](https://github.com/AegisJSProject/markdown/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/AegisJSProject/markdown/actions/workflows/codeql-analysis.yml)
![Node CI](https://github.com/AegisJSProject/markdown/workflows/Node%20CI/badge.svg)
![Lint Code Base](https://github.com/AegisJSProject/markdown/workflows/Lint%20Code%20Base/badge.svg)

[![GitHub license](https://img.shields.io/github/license/AegisJSProject/markdown.svg)](https://github.com/AegisJSProject/markdown/blob/master/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/AegisJSProject/markdown.svg)](https://github.com/AegisJSProject/markdown/commits/master)
[![GitHub release](https://img.shields.io/github/release/AegisJSProject/markdown?logo=github)](https://github.com/AegisJSProject/markdown/releases)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/AegisJSProject?logo=github)](https://github.com/sponsors/shgysk8zer0)

[![npm](https://img.shields.io/npm/v/@aegisjsproject/markdown)](https://www.npmjs.com/package/@aegisjsproject/markdown)
![node-current](https://img.shields.io/node/v/@aegisjsproject/markdown)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/%40aegisjsproject%2Fmarkdown)

[![npm](https://img.shields.io/npm/dw/@aegisjsproject/markdown?logo=npm)](https://www.npmjs.com/package/@aegisjsproject/markdown)

[![GitHub followers](https://img.shields.io/github/followers/AegisJSProject.svg?style=social)](https://github.com/AegisJSProject)
![GitHub forks](https://img.shields.io/github/forks/AegisJSProject/markdown.svg?style=social)
![GitHub stars](https://img.shields.io/github/stars/AegisJSProject/markdown.svg?style=social)
[![Twitter Follow](https://img.shields.io/twitter/follow/shgysk8zer0.svg?style=social)](https://twitter.com/shgysk8zer0)

[![Donate using Liberapay](https://img.shields.io/liberapay/receives/shgysk8zer0.svg?logo=liberapay)](https://liberapay.com/shgysk8zer0/donate "Donate using Liberapay")
- - -

- [Code of Conduct](./.github/CODE_OF_CONDUCT.md)
- [Contributing](./.github/CONTRIBUTING.md)
<!-- - [Security Policy](./.github/SECURITY.md) -->

## Adding language support

In order to reduce bundle size, only plaintext is available/supported by default.
However, you can easily add support for additional languages in a variety of ways:

### Registering from Static Imports

**Note**: All languages provided by `highlight.js` may be found at [`/es/languages/${lang}.min.js`](https://unpkg.com/browse/@highlightjs/cdn-assets/es/languages/).

```js
import { registerLanguage } from '@aegisjsproject/markdown';
import javascript from 'highlight.js/lanuages/javascript.min.js';
import xml from 'highlight.js/languages/xml.min.js';
import css from 'highlight.js/languages/css.min.js';

registerLanguage('javascript', javascript);
registerLanguage('xml', xml);
registerLanguage('css',css);

// Or
import { registerLanguages } from '@aegisjsproject/markdown';
import javascript from 'highlight.js/lanuages/javascript.min.js';
import xml from 'highlight.js/languages/xml.min.js';
import css from 'highlight.js/languages/css.min.js';

registerLanguages({ javascript, xml, css });
```

### Dynamically Loading and Registering using Dynamic Imports

This uses `import()` for dynamic loading of language modules from `unpkg.com`.

**Note**: These are case-sensitive and **MUST** be the correct filename (without extension).

```js
import { loadLanguages } from '@aegisjsproject/markdown';

await loadLanguages('javascript', 'css', 'xml', 'typescript');
```

## Example

```js
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
```
