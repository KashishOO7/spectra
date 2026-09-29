import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import { join } from 'node:path';
import { readWiki, WIKI_FOLDERS } from './src/lib/wiki/read';

const VIRTUAL = '#spectra-wiki';
// No `#` in the resolved id. The dev server serves a virtual module at a URL made from this id, and a
// `#` there is read by the browser as the start of a fragment: it asked for `/@id/__x00__`, got a
// 404, and no page could load its words. Measured 2026-09-16; the build bundles it and never showed it.
const RESOLVED = '\0spectra-wiki/';

/**
 * The content wiki, parsed at build time into one module per note, each exporting its note as data.
 * The browser never receives markdown or an Obsidian comment, and a malformed note stops the build
 * instead of reaching a page.
 *
 *   #spectra-wiki/page/<name>   one note of wiki/pages/, for the page that shows it
 *   #spectra-wiki/<folder>      every note of a small folder read as a set: glossary, playbooks
 *
 * WHY ONE MODULE PER NOTE. A bundler cannot split one module between pages, so one module for the
 * whole wiki would make every page that shows any note download all of them (29.7 KB gzipped on 13
 * of 15 pages, measured). Asking for the whole wiki, or the whole of wiki/pages/, is refused.
 *
 * WHY `#spectra-wiki` AND `enforce: 'pre'`. A `virtual:` name only Vite can resolve, so nothing
 * outside Vite could read a note, validate included. Node refuses any `name:` import as a URL scheme. A `#` name is a Node subpath
 * import, so `package.json` points `#spectra-wiki/*` at `src/lib/wiki/node/` for everything outside
 * Vite, and this plugin claims every such name first inside Vite. `pre` is what makes it first:
 * without it Vite's own resolver would follow `package.json` and bundle the `node:fs` reader into
 * the browser.
 *
 * WHY A VIRTUAL MODULE AND NOT AN IMPORT OF EACH NOTE. Importing `wiki/glossary/*.md` directly
 * made the browser fetch those files from the dev server, which refused them with a 403, and every
 * glossary mark disappeared. A virtual module is built in Node, so no file in
 * `wiki/` is ever served to anyone, and `wiki/_rules/` is never read here at all.
 *
 * The glossary is parsed here, at build time, so its `%%` comments never reach the bundle.
 */
function wiki(): Plugin {
  let root = process.cwd();
  return {
    name: 'spectra-wiki',
    enforce: 'pre',
    configResolved(config) { root = config.root; },
    resolveId(id) {
      if (id === VIRTUAL || id === `${VIRTUAL}/pages` || id === `${VIRTUAL}/page`) {
        throw new Error(`${id} would put every note on every page. Import one: ${VIRTUAL}/page/<name>.`);
      }
      return id.startsWith(`${VIRTUAL}/`) ? RESOLVED + id.slice(VIRTUAL.length + 1) : null;
    },
    load(id) {
      if (!id.startsWith(RESOLVED)) return null;
      const want = id.slice(RESOLVED.length);
      const wiki = readWiki(root, f => this.addWatchFile(f));
      if (want.startsWith('page/')) {
        const name = want.slice('page/'.length);
        const note = wiki.pages[name];
        if (!note) throw new Error(`${VIRTUAL}/${want}: no note at wiki/pages/${name}.md`);
        return `export default ${JSON.stringify(note)};`;
      }
      // A whole folder: any folder the reader reads except pages, which is one note per page.
      const folder = want as keyof typeof wiki;
      if (want === 'pages' || !(folder in wiki)) {
        throw new Error(`${VIRTUAL}/${want} is not a note or a folder the site reads (${Object.keys(wiki).filter(k => k !== 'pages').join(', ')}, or page/<name>)`);
      }
      return `export default ${JSON.stringify(wiki[folder])};`;
    },
    configureServer(server) {
      // A note added or deleted is not a file any module already watches, so the folder is watched
      // and every note module rebuilt on any change inside it.
      server.watcher.add(join(root, 'wiki'));
      const read = new RegExp(String.raw`[\\/]wiki[\\/](${WIKI_FOLDERS.join('|')})[\\/][^\\/]+\.md$`);
      server.watcher.on('all', (_event, file) => {
        if (!read.test(file)) return;
        for (const mod of server.moduleGraph.idToModuleMap.values()) {
          if (mod.id?.startsWith(RESOLVED)) server.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: 'full-reload' });
      });
    }
  };
}

export default defineConfig({
  plugins: [wiki(), sveltekit()],
  assetsInclude: ['**/*.yaml', '**/*.yml']
});
