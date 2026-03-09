/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE_NAME = `spectra-${version}`;

// Assets to precache: SvelteKit build output + static files
const PRECACHE = [...build, ...files];

// Install: precache all assets
sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE);
    })
  );
  // Take control immediately without waiting for old SW to expire
  sw.skipWaiting();
});

// Activate: clean up old caches
sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      for (const key of keys) {
        if (key !== CACHE_NAME) {
          await caches.delete(key);
        }
      }
      // Claim all open clients immediately
      await sw.clients.claim();
    })
  );
});

// Fetch: cache-first for precached assets, network-first otherwise
sw.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip cross-origin requests (Google Fonts etc)
  if (url.origin !== sw.location.origin) return;

  // Skip chrome-extension and non-http(s)
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(respond(event.request));
});

async function respond(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const cache = await caches.open(CACHE_NAME);

  // Cache-first for precached assets (build output + static files)
  if (PRECACHE.includes(url.pathname)) {
    const cached = await cache.match(request);
    if (cached) return cached;
  }

  // Network-first for everything else, cache successful responses
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network failed — try cache
    const cached = await cache.match(request);
    if (cached) return cached;

    // Both failed — return an offline page for navigation requests
    if (request.mode === 'navigate') {
      const offline = await cache.match('/');
      if (offline) return offline;
    }

    return new Response('Offline — and no cached version available.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}