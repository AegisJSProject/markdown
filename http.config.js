export default {
	open: true,
	routes: {
		'/': async (req) => {
			if (req.destination === 'document') {
				// Hack to make it not read-only
				const importmap = await import('@shgysk8zer0/importmap').then(mod => ({ ...mod.importmap }));
				const { readFile } = await import('node:fs/promises');
				importmap.imports['@aegisjsproject/markdown'] = '/markdown.min.js';
				importmap.imports['@aegisjsproject/markdown/'] = '/';
				const json = JSON.stringify(importmap);
				const hash = new Uint8Array(await crypto.subtle.digest('SHA-384', new TextEncoder().encode(json)));
				const integrity = 'sha384-' + hash.toBase64();
				const doc = await readFile('./test/index.html', { encoding: 'utf-8' })
					.then(doc => doc.replace('{{ importmap }}', json).replace('{{ integrity }}', integrity));

				const csp = `default-src 'none';
					script-src 'self' https://unpkg.com/@shgysk8zer0/ https://unpkg.com/@aegisjsproject/ https://unpkg.com/@highlightjs/ '${integrity}';
					style-src 'self' blob: https://unpkg.com/@highlightjs/;
					img-src 'self' https://img.shields.io/ https://github.com/AegisJSProject/markdown/workflows/ https://github.com/AegisJSProject/markdown/actions/workflows/;
					connect-src 'self';
					trusted-types empty#html empty#script aegis-sanitizer#html;
					require-trusted-types-for 'script'`;

				return new Response(doc, {
					headers: {
						'Content-Type': 'text/html',
						'Content-Security-Policy': csp.replaceAll(/[\n\t]/g, ' '),
					}
				});
			} else {
				return new Response(req.destination, {
					headers: { 'Content-Type': 'text/plain' },
				});
			}
		}
	},
	responsePostprocessors: [
		resp => {
			const types = ['text/plain', 'text/css', 'application/javascript', 'application/json', 'text/css', 'image/svg+xml', 'text/markdown'];

			if (types.includes(resp.headers.get('Content-Type'))) {
				resp.headers.set('Content-Encoding', 'deflate');
				return new CompressionStream('deflate');
			} else if (resp.headers.get('Content-Type') === 'application/octet-stream') {
				resp.headers.set('Content-Type', 'text/markdown');
				resp.headers.set('Content-Encoding', 'deflate');
				return new CompressionStream('deflate');
			}
		}
	]
};
