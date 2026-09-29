import { wiki } from '../_wiki.js';

const note = wiki.pages['tricks'];
if (!note) throw new Error('wiki: no note at wiki/pages/tricks.md');

export default note;
