<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  const TARGET = '/methodology#references';

  onMount(() => { void goto(TARGET, { replaceState: true }); });
</script>

<svelte:head>
  <title>References and standards | Spectra</title>
  <meta http-equiv="refresh" content="0; url=/methodology#references" />
  <link rel="canonical" href="https://spectra.fpszero.com/methodology" />
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
  <p class="text-body leading-relaxed">
    The references and standards now sit with the scoring they justify.
    <a href={TARGET} class="text-teal-light hover:text-teal underline underline-offset-2">Under the hood</a>
  </p>
</div>
