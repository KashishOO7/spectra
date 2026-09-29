import { wiki } from '../_wiki.js';

const note = wiki.pages['coverage'];
if (!note) throw new Error('wiki: no note at wiki/pages/coverage.md');

export default note;
