import { wiki } from '../_wiki.js';

const note = wiki.pages['names'];
if (!note) throw new Error('wiki: no note at wiki/pages/names.md');

export default note;
