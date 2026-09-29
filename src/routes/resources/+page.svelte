<script lang="ts">
  import type { PageData } from './$types.js';
  import type { Resource, ChecklistItem } from '$lib/types.js';
  import note from '#spectra-wiki/page/guides';
  import { text, lines } from '$lib/wiki/page.js';

  const title = text(note, 'title');
  const description = text(note, 'description');
  const why = lines(note, 'why');
  const [noPlacement] = lines(note, 'no-placement');

  export let data: PageData;

  $: resources = Object.values(data.graph?.resources ?? {}) as Resource[];
  $: items = Object.values(data.graph?.items ?? {}) as ChecklistItem[];

  $: referencedBy = (() => {
    const map = new Map<string, ChecklistItem[]>();
    for (const item of items) {
      if (item.status !== 'active') continue;
      for (const ref of item.resources ?? []) {
        if (!map.has(ref.id)) map.set(ref.id, []);
        map.get(ref.id)!.push(item);
      }
    }
    return map;
  })();

  $: listed = resources
    .filter(r => r.status === 'active')
    .sort((a, b) =>
      (referencedBy.get(b.id)?.length ?? 0) - (referencedBy.get(a.id)?.length ?? 0) ||
      a.title.localeCompare(b.title));

</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://spectra.fpszero.com/resources" />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">

  <h1 class="text-3xl font-bold text-white mb-3">{text(note, 'heading')}</h1>

  <p class="text-body text-base leading-relaxed max-w-2xl mb-10">
    {text(note, 'lead')}
  </p>

  <section class="mb-12">
    <h2 class="label-section mb-4">{text(note, 'where-heading')}</h2>

    <ul class="space-y-5">
      {#each listed as guide}
        {@const steps = referencedBy.get(guide.id) ?? []}
        <li class="border-b border-border/50 pb-5 last:border-0">
          <p class="mb-1.5">
            <a href={guide.url} target="_blank" rel="noopener noreferrer"
               class="text-lg font-semibold text-bright hover:text-teal-light transition-colors">
              {guide.title}
            </a>
            <span class="text-muted text-sm ml-1.5" aria-hidden="true">&#8599;</span>
          </p>
          <p class="text-sm text-body leading-relaxed mb-1">{guide.description}</p>
          {#if steps.length}
            <p class="text-sm text-dim leading-relaxed">
              {steps.length === 1 ? text(note, 'used-by-one') : text(note, 'used-by-many')}
              {#each steps as step, i}<span class="text-muted">{step.title}</span>{#if i < steps.length - 1}<span class="text-muted">; </span>{/if}{/each}
            </p>
          {/if}
        </li>
      {/each}
    </ul>

    {#if listed.length === 0}
      <p class="text-sm text-dim">{text(note, 'none')}</p>
    {/if}
  </section>

  <section>
    <h2 class="label-section mb-4">{text(note, 'why-heading')}</h2>
    {#each why as line, i}
    <p class={i < why.length - 1 ? 'text-sm text-body leading-relaxed mb-3 max-w-2xl' : 'text-sm text-body leading-relaxed max-w-2xl'}>{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong>{p.value}</strong>{:else if p.kind === 'link'}<a href={p.href} class="underline hover:text-dim transition-colors">{p.value}</a>{/if}{/each}</p>
    {/each}
  </section>

  <p class="text-sm text-muted mt-12">{#each noPlacement as p}{#if p.kind === 'link'}<a href={p.href} class="underline hover:text-dim transition-colors">{p.value}</a>{:else}{p.value}{/if}{/each}</p>
</div>
