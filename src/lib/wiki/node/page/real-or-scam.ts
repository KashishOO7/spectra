import { wiki } from '../_wiki.js';

const note = wiki.pages['real-or-scam'];
if (!note) throw new Error('wiki: no note at wiki/pages/real-or-scam.md');

export default note;
