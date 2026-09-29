import { wiki } from '../_wiki.js';

const note = wiki.pages['chapters'];
if (!note) throw new Error('wiki: no note at wiki/pages/chapters.md');

export default note;
