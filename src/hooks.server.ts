import type { Handle } from '@sveltejs/kit';
import home from '#spectra-wiki/page/home';
import { text } from '$lib/wiki/page.js';

const SITE = 'https://spectra.fpszero.com';

const attr = (s: string) => s.replace(/&(?!(?:[a-z]+|#\d+);)/gi, '&amp;').replace(/"/g, '&quot;');

export const handle: Handle = ({ event, resolve }) =>
  resolve(event, {
    transformPageChunk: ({ html }) => {
      if (!html.includes('</head>')) return html;
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
      const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/)?.[1];
      const alt = attr(`${text(home, 'heading')} ${text(home, 'promise')}`);
      const tags = [
        `<meta property="og:site_name" content="Spectra" />`,
        `<meta property="og:type" content="${event.url.pathname.startsWith('/checklist/') ? 'article' : 'website'}" />`,
        title ? `<meta property="og:title" content="${title}" />` : '',
        description ? `<meta property="og:description" content="${description}" />` : '',
        `<meta property="og:url" content="${SITE}${event.url.pathname}" />`,
        `<meta property="og:image" content="${SITE}/og.png" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="${alt}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`
      ].filter(Boolean).join('\n    ');
      return html.replace('</head>', `    ${tags}\n  </head>`);
    }
  });
