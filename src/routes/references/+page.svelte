<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import note from '#spectra-wiki/page/references';
  import { text, lines } from '$lib/wiki/page.js';

  const TARGET = '/methodology#references';

  onMount(() => { void goto(TARGET, { replaceState: true }); });

  const [moved] = lines(note, 'moved');
</script>

<svelte:head>
  <title>{text(note, 'title')}</title>
  <meta http-equiv="refresh" content="0; url=/methodology#references" />
  <link rel="canonical" href="https://spectra.fpszero.com/methodology" />
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
  <p class="text-body leading-relaxed">{#each moved as p}{#if p.kind === 'link'}<a href={p.href} class="text-teal-light hover:text-teal underline underline-offset-2">{p.value}</a>{:else}{p.value}{/if}{/each}</p>
</div>
