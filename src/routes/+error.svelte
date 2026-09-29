<script lang="ts">
  import { page } from '$app/stores';
  import note from '#spectra-wiki/page/error';
  import { text, link } from '$lib/wiki/page.js';

  const start = link(note, 'start');
  const list = link(note, 'list');
</script>

<svelte:head>
  <title>{$page.status === 404 ? text(note, 'title-not-found') : text(note, 'title-failed')}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-16">
  <p class="label-mono mb-3">{$page.status}</p>
  <h1 class="text-3xl font-bold text-white mb-3">
    {$page.status === 404 ? text(note, 'heading-not-found') : text(note, 'heading-failed')}
  </h1>
  <p class="text-body text-base leading-relaxed max-w-xl mb-8">
    {$page.status === 404 ? text(note, 'body-not-found') : text(note, 'body-failed')}
  </p>
  <div class="flex flex-wrap gap-4">
    <a href={start.href} class="btn-primary text-sm">{start.text}</a>
    <a href={list.href} class="text-dim hover:text-body underline transition-colors text-sm">{list.text}</a>
  </div>
</div>
