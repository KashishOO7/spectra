<script lang="ts">
  import { onMount } from 'svelte';
  import note from '#spectra-wiki/page/faq';
  import { text, rows, items, type Part, type Item } from '$lib/wiki/page.js';

  const GROUPS = ['happened', 'about', 'data', 'how', 'games', 'trust'] as const;
  type Group = (typeof GROUPS)[number];

  const title = text(note, 'title');
  const description = text(note, 'description');
  const names = rows(note, 'groups', GROUPS, 1);
  const questions: Record<Group, Item[]> = Object.fromEntries(GROUPS.map(g => [g, items(note, g)])) as Record<Group, Item[]>;

  const slug = (q: string) => q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const plain = (line: Part[]) => line.map(p => p.value).join('');

  let active: Group | 'all' = 'happened';
  let hydrated = false;

  function choose(g: Group | 'all') {
    active = g;
    history.replaceState(history.state, '', g === 'all' ? '#all' : `#${g}`);
  }

  function follow() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash === 'all' || (GROUPS as readonly string[]).includes(hash)) { active = hash as Group | 'all'; return; }
    const g = GROUPS.find(g => questions[g].some(q => slug(q.title) === hash));
    if (!g) return;
    active = g;
    requestAnimationFrame(() => {
      const el = document.getElementById(hash);
      if (el instanceof HTMLDetailsElement) { el.open = true; el.scrollIntoView(); }
    });
  }

  onMount(() => {
    follow();
    hydrated = true;
    addEventListener('hashchange', follow);
    return () => removeEventListener('hashchange', follow);
  });

  const ld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GROUPS.flatMap(g => questions[g].map(q => ({
      '@type': 'Question',
      name: q.title,
      acceptedAnswer: { '@type': 'Answer', text: q.lines.map(plain).join(' ') }
    })))
  }).replace(/</g, '\\u003c');
  const ldTag = `<script type="application/ld+json">${ld}</` + `script>`;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://spectra.fpszero.com/faq" />
  {@html ldTag}
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
  <h1 class="text-3xl font-bold text-white mb-3">{text(note, 'heading')}</h1>
  <p class="text-lg text-body mb-8">{text(note, 'lead')}</p>

  <div class="topics" role="group" aria-label={text(note, 'topics-label')} data-faq-topics>
    {#each GROUPS as g}
      <button type="button" class="topic" aria-pressed={hydrated && active === g} on:click={() => choose(g)}>
        {names[g][0]}
      </button>
    {/each}
    <button type="button" class="topic" aria-pressed={hydrated && active === 'all'} on:click={() => choose('all')}>
      {text(note, 'all')}
    </button>
  </div>

  {#each GROUPS as g}
    <section id={g} class="mt-8" hidden={hydrated && active !== 'all' && active !== g} data-faq-group={g}>
      <h2 class="text-xl font-bold text-bright mb-3">{names[g][0]}</h2>
      <div class="space-y-3">
        {#each questions[g] as q}
          <details id={slug(q.title)} class="panel qa" data-faq-question>
            <summary class="flex items-start justify-between gap-4 p-4 sm:p-5 cursor-pointer">
              <span class="text-base font-semibold text-bright">{q.title}</span>
              <svg class="chev flex-none mt-1 text-dim" width="16" height="16" viewBox="0 0 16 16" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>
            </summary>
            <div class="px-4 sm:px-5 pb-5 space-y-3">
              {#each q.lines as line, i}
                <p class={i === 0 ? 'text-base text-bright' : 'text-base text-body'}>{#each line as p}{#if p.kind === 'strong'}<strong>{p.value}</strong>{:else if p.kind === 'link'}<a href={p.href} class="link-inline">{p.value}</a>{:else}{p.value}{/if}{/each}</p>
              {/each}
            </div>
          </details>
        {/each}
      </div>
    </section>
  {/each}

</div>

<style>
  .topics { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .topics .topic { border-radius: 14px; text-align: left; }
  .topics .topic:last-child { grid-column: 1 / -1; }
  @media (min-width: 640px) {
    .topics { display: flex; flex-wrap: wrap; }
    .topics .topic { justify-content: center; border-radius: 999px; }
  }
  .topic {
    display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px;
    border-radius: 999px; border: 1px solid rgb(var(--c-muted)); background: rgb(var(--c-surface));
    color: rgb(var(--c-bright)); font-weight: 600; font-size: 15px;
  }
  .topic:hover { border-color: rgb(var(--c-teal)); }
  .topic[aria-pressed='true'] { background: rgb(var(--c-teal-dim)); border-color: rgb(var(--c-teal)); color: rgb(var(--c-teal-light)); }
  .qa summary { list-style: none; }
  .qa summary::-webkit-details-marker { display: none; }
  .qa[open] .chev { transform: rotate(180deg); }
  section { scroll-margin-top: 80px; }
  details { scroll-margin-top: 80px; }
</style>
