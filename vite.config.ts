import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import { join } from 'node:path';
import { readWiki, WIKI_FOLDERS } from './src/lib/wiki/read';

const VIRTUAL = '#spectra-wiki';
const RESOLVED = '\0spectra-wiki/';

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
      const folder = want as keyof typeof wiki;
      if (want === 'pages' || !(folder in wiki)) {
        throw new Error(`${VIRTUAL}/${want} is not a note or a folder the site reads (${Object.keys(wiki).filter(k => k !== 'pages').join(', ')}, or page/<name>)`);
      }
      return `export default ${JSON.stringify(wiki[folder])};`;
    },
    configureServer(server) {
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
