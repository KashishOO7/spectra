<script lang="ts">
  import note from '#spectra-wiki/page/how-it-works';
  import { text, lines, items, link } from '$lib/wiki/page.js';

  const title = text(note, 'title');
  const description = text(note, 'description');
  const steps = items(note, 'steps');
  const why = lines(note, 'why');
  const limits = items(note, 'limits');
  const start = link(note, 'start');
  const underTheHood = link(note, 'under-the-hood');
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://spectra.fpszero.com/how-it-works" />
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-12">

  <h1 class="text-3xl font-bold text-white mb-4">{text(note, 'heading')}</h1>
  <p class="text-body text-lg leading-relaxed mb-2">
    {text(note, 'lead')}
  </p>
  <p class="text-dim text-sm mb-10">{text(note, 'reading-time')}</p>

  <ol class="space-y-3 mb-12">
    {#each steps as step, i}
      <li class="panel p-5 flex gap-4 items-start">
        <span class="text-2xl font-bold text-bright leading-none w-7 shrink-0"
              aria-hidden="true">{i + 1}</span>
        <div>
          <h2 class="text-bright font-semibold text-base mb-1.5">{step.title}</h2>
          {#each step.lines as line}
          <p class="text-sm text-body leading-relaxed">{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong>{p.value}</strong>{:else if p.kind === 'link'}<a href={p.href} class="link-inline">{p.value}</a>{/if}{/each}</p>
          {/each}
        </div>
      </li>
    {/each}
  </ol>

  <section class="mb-12">
    <h2 class="text-lg font-semibold text-bright mb-3">{text(note, 'why-heading')}</h2>
    {#each why as line, i}
    <p class={i < why.length - 1 ? 'text-body leading-relaxed mb-3' : 'text-body leading-relaxed'}>{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong>{p.value}</strong>{:else if p.kind === 'link'}<a href={p.href} class="link-inline">{p.value}</a>{/if}{/each}</p>
    {/each}
  </section>

  <section class="mb-12">
    <h2 class="text-lg font-semibold text-bright mb-4">{text(note, 'limits-heading')}</h2>
    <div class="space-y-3">
      {#each limits as l}
        <div class="border-l-2 border-border pl-4">
          <p class="font-sans font-medium text-sm text-bright mb-1">{l.title}</p>
          {#each l.lines as line}
          <p class="text-sm text-body leading-relaxed">{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong>{p.value}</strong>{:else if p.kind === 'link'}<a href={p.href} class="link-inline">{p.value}</a>{/if}{/each}</p>
          {/each}
        </div>
      {/each}
    </div>
  </section>

  <div class="pt-8 border-t border-border flex flex-col sm:flex-row gap-3">
    <a href={start.href} class="btn-primary">{start.text}</a>
    <a href={underTheHood.href} class="btn-ghost">
      {underTheHood.text}
      <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round"><path d="M4 1L8 5L4 9"/></svg>
    </a>
  </div>
</div>
