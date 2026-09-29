<script lang="ts">
  import Glossed from './Glossed.svelte';
  import { lineParts } from '$lib/audit/helpers.js';

  export let lines: string[];
  export let size: 'sm' | 'base' = 'sm';

  $: parts = lineParts(lines);
  $: type = size === 'base' ? 'text-base' : 'text-sm';
</script>

{#each parts as part}
  {#if part.kind === 'p'}
    <p class="{type} text-body leading-relaxed mb-2.5 last:mb-0"><Glossed text={part.text} /></p>
  {:else if part.kind === 'ol'}
    <ol class="{type} text-body leading-relaxed list-decimal pl-6 space-y-1 mb-2.5 last:mb-0 marker:text-dim">
      {#each part.items as item}<li class="pl-1"><Glossed text={item} /></li>{/each}
    </ol>
  {:else}
    <ul class="{type} text-body leading-relaxed list-disc pl-6 space-y-1 mb-2.5 last:mb-0 marker:text-dim">
      {#each part.items as item}<li class="pl-1"><Glossed text={item} /></li>{/each}
    </ul>
  {/if}
{/each}
