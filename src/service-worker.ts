/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE_NAME = `spectra-${version}`;

const PRECACHE = [...build, ...files];

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE);
    })
  );
  sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      for (const key of keys) {
        if (key !== CACHE_NAME) {
          await caches.delete(key);
        }
      }
      await sw.clients.claim();
    })
  );
});

sw.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== sw.location.origin) return;

  if (!url.protocol.startsWith('http')) return;

  event.respondWith(respond(event.request));
});

async function respond(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const cache = await caches.open(CACHE_NAME);
  const isPrecached = PRECACHE.includes(url.pathname);

  if (isPrecached) {
    const cached = await cache.match(request);
    if (cached) return cached;
  }

  try {
    const response = await fetch(request);
    if (isPrecached && response.status === 200) {
      cache.put(url.pathname, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (request.mode === 'navigate') {
      const shell = await cache.match(url.pathname) ?? await cache.match('/');
      if (shell) return shell;
    }

    return new Response('Offline. No cached version available.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}