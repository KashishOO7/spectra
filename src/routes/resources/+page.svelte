<script lang="ts">
  import type { PageData } from './$types.js';
  import type { Resource, ChecklistItem } from '$lib/types.js';

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
  <title>Tools &amp; Resources | Spectra</title>
  <meta name="description" content="The guides our steps point at. Spectra does not keep a tool catalogue and does not name apps." />
  <link rel="canonical" href="https://spectra.fpszero.com/resources" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Spectra" />
  <meta property="og:title" content="Tools &amp; Resources | Spectra" />
  <meta property="og:description" content="The guides our steps point at. Spectra does not keep a tool catalogue and does not name apps." />
  <meta property="og:url" content="https://spectra.fpszero.com/resources" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Tools &amp; Resources | Spectra" />
  <meta name="twitter:description" content="The guides our steps point at. Spectra does not keep a tool catalogue and does not name apps." />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">

  <h1 class="font-display text-3xl font-bold text-white mb-3">Tools &amp; Resources</h1>

  <p class="text-body text-base leading-relaxed max-w-2xl mb-10">
    We don't keep a tool catalogue and we don't name apps. These are the guides our steps point
    at: people who track this properly and update it more often than we could.
  </p>

  <section class="mb-12">
    <h2 class="label-section mb-4">Where our steps send you</h2>

    <ul class="space-y-5">
      {#each listed as guide}
        {@const steps = referencedBy.get(guide.id) ?? []}
        <li class="border-b border-border/50 pb-5 last:border-0">
          <p class="mb-1.5">
            <a href={guide.url} target="_blank" rel="noopener noreferrer"
               class="font-display text-lg font-semibold text-bright hover:text-amber-light transition-colors">
              {guide.title}
            </a>
            <span class="text-muted text-sm ml-1.5" aria-hidden="true">&#8599;</span>
          </p>
          <p class="text-sm text-body leading-relaxed mb-1">{guide.description}</p>
          {#if steps.length}
            <p class="text-[13px] text-dim leading-relaxed">
              {steps.length === 1 ? 'Used by this step:' : 'Used by these steps:'}
              {#each steps as step, i}<span class="text-muted">{step.title}</span>{#if i < steps.length - 1}<span class="text-muted">; </span>{/if}{/each}
            </p>
          {/if}
        </li>
      {/each}
    </ul>

    {#if listed.length === 0}
      <p class="text-sm text-dim">No step currently points anywhere.</p>
    {/if}
  </section>

  <section>
    <h2 class="label-section mb-4">Why we send you elsewhere</h2>
    <p class="text-sm text-body leading-relaxed mb-3 max-w-2xl">
      We used to name specific apps. We stopped, because a recommendation is a claim about a
      company, and companies get bought, change their terms, or quietly start doing something new.
      Nothing on this page would move when that happened.
    </p>
    <p class="text-sm text-body leading-relaxed max-w-2xl">
      So we keep the part that stays true, which is what to look for in a tool, and the guides above
      keep the part that changes, which is which one to pick this year. They update far more often
      than we could, and they publish the standards they use.
    </p>
  </section>

  <p class="text-[13px] text-muted mt-12">
    Nothing here is a paid placement, an affiliate link, or a commercial relationship.
    <a href="/methodology#references" class="underline hover:text-dim transition-colors">Where our sources come from</a>
  </p>
</div>
