
import type { RequestHandler } from './$types.js';
import { loadContentGraph } from '$lib/content/loader.js';

import { CHAPTERS } from '$lib/audit/chapters.js';
export const prerender = true;

const SITE = 'https://spectra.fpszero.com';

const PAGES: Array<[path: string, changefreq: string, priority: string]> = [
  ['/', 'weekly', '1.0'],
  ['/audit', 'weekly', '0.6'],
  ['/start', 'monthly', '0.8'],
  ['/real-or-scam', 'monthly', '0.8'],
  ['/quiz', 'monthly', '0.8'],
  ['/incident', 'monthly', '0.7'],
  ['/methodology', 'monthly', '0.9'],
  ['/resources', 'weekly', '0.8'],
  ['/how-it-works', 'monthly', '0.6'],
  ['/graph', 'weekly', '0.7'],
  ['/about', 'monthly', '0.7'],
  ['/timeline', 'monthly', '0.5'],
  ['/you', 'monthly', '0.5']
];

const CHAPTER = { changefreq: 'monthly', priority: '0.7' };

const STEP = { changefreq: 'monthly', priority: '0.6' };

const url = (path: string, changefreq: string, priority: string) =>
  `  <url>\n    <loc>${SITE}${path}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;

export const GET: RequestHandler = () => {
  const steps = [...loadContentGraph().items.keys()].sort();
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    PAGES.map(([p, f, pr]) => url(p, f, pr)).join('') +
    CHAPTERS.map(c => url(`/chapter/${c.id}`, CHAPTER.changefreq, CHAPTER.priority)).join('') +
    steps.map(id => url(`/checklist/${id}`, STEP.changefreq, STEP.priority)).join('') +
    '</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
