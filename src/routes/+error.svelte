<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>{$page.status === 404 ? 'Page not found' : 'Something went wrong'} | Spectra</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-16">
  <p class="label-mono mb-3">{$page.status}</p>
  <h1 class="font-display text-3xl font-bold text-white mb-3">
    {$page.status === 404 ? "That page isn't here" : 'Something went wrong'}
  </h1>
  <p class="text-body text-base leading-relaxed max-w-xl mb-8">
    {$page.status === 404
      ? 'The link may be old, or the page may have moved. Nothing is kept on a server, so nothing of yours is affected.'
      : 'Reloading usually fixes it. Nothing is kept on a server, so nothing of yours is affected.'}
  </p>
  <div class="flex flex-wrap gap-4">
    <a href="/" class="btn-primary text-sm">Back to the start →</a>
    <a href="/audit" class="text-dim hover:text-body underline transition-colors text-sm">Your list →</a>
  </div>
</div>
