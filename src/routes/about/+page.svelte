<script lang="ts">
  import { onMount } from 'svelte';
  import about from '#spectra-wiki/page/about';
  import { text, lines, links, items } from '$lib/wiki/page.js';

  let disclaimerDetails: HTMLDetailsElement;

  onMount(() => {
    if (location.hash === '#disclaimer' && disclaimerDetails) disclaimerDetails.open = true;
  });

  const title = text(about, 'title');
  const description = text(about, 'description');
  const contents = links(about, 'contents');
  const what = lines(about, 'what');
  const disclaimer = lines(about, 'disclaimer');
  const disclaimerFull = lines(about, 'disclaimer-full');
  const privacy = lines(about, 'privacy');
  const privacyRows = items(about, 'privacy-rows');
  const methodology = lines(about, 'methodology');
  const methodologyLinks = links(about, 'methodology-links');
  const fpszero = lines(about, 'fpszero');
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://spectra.fpszero.com/about" />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
  <h1 class="text-3xl font-bold text-white mb-2">{text(about, 'heading')}</h1>
  <p class="text-dim text-sm mb-10">{text(about, 'tagline')}</p>

  <nav class="panel p-4 mb-10 flex flex-wrap gap-x-4 gap-y-2">
    {#each contents as s}
      <a href={s.href} class="inline-flex items-center min-h-[24px] text-sm text-dim hover:text-body transition-colors" data-about-contents>{s.text}</a>
    {/each}
  </nav>

  <div class="space-y-12 prose-custom">

    <section id="what">
      <h2 class="text-lg font-semibold text-bright mb-4">{text(about, 'what-heading')}</h2>
      {#each what as line, i}
        <p class={i < what.length - 1 ? 'text-body leading-relaxed mb-3' : 'text-body leading-relaxed'}>{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-bright">{p.value}</strong>{:else if p.kind === 'link'}<a href={p.href} class="text-teal-light link-inline">{p.value}</a>{/if}{/each}</p>
      {/each}
    </section>

    <section id="disclaimer">
      <div class="border border-teal/30 rounded-xl p-5 bg-teal-dim/10">
        <h2 class="text-lg font-semibold text-teal-light mb-3">{text(about, 'disclaimer-heading')}</h2>
        {#each disclaimer as line}
          <p class="text-body leading-relaxed mb-3">{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-bright">{p.value}</strong>{:else if p.kind === 'link'}<a href={p.href} class="text-teal-light link-inline">{p.value}</a>{/if}{/each}</p>
        {/each}
        <details bind:this={disclaimerDetails}>
          <summary class="cursor-pointer text-sm text-accent-light hover:opacity-80 py-1
                          list-none inline-flex items-center gap-2">
            {text(about, 'disclaimer-more')}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                 class="flex-shrink-0">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.4"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </summary>
          <div class="space-y-3 text-body text-sm leading-relaxed mt-3">
          {#each disclaimerFull as line}
          <p>{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-bright">{p.value}</strong>{:else if p.kind === 'link'}<a href={p.href} class="text-teal-light link-inline">{p.value}</a>{/if}{/each}</p>
          {/each}
          </div>
        </details>
      </div>
    </section>

    <section id="privacy">
      <h2 class="text-lg font-semibold text-bright mb-4">{text(about, 'privacy-heading')}</h2>
      {#each privacy as line}
        <p class="text-body leading-relaxed mb-3">{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-bright">{p.value}</strong>{:else if p.kind === 'link'}<a href={p.href} class="text-teal-light link-inline">{p.value}</a>{/if}{/each}</p>
      {/each}
      <div class="space-y-4">
        {#each privacyRows as item}
          <div class="panel p-4">
            <div class="text-sm font-medium text-teal-light mb-1">{item.title}</div>
            {#each item.lines as line}
            <p class="text-sm text-body leading-relaxed">{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-bright">{p.value}</strong>{:else if p.kind === 'link'}<a href={p.href} class="text-teal-light link-inline">{p.value}</a>{/if}{/each}</p>
            {/each}
          </div>
        {/each}
      </div>
    </section>

    <section id="methodology">
      <h2 class="text-lg font-semibold text-bright mb-4">{text(about, 'methodology-heading')}</h2>
      {#each methodology as line, i}
        <p class={i < methodology.length - 1 ? 'text-body leading-relaxed mb-3' : 'text-body leading-relaxed mb-5'}>{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-bright">{p.value}</strong>{:else if p.kind === 'link'}<a href={p.href} class="text-teal-light link-inline">{p.value}</a>{/if}{/each}</p>
      {/each}
      <div class="flex flex-col sm:flex-row gap-3">
        {#each methodologyLinks as l}
        <a href={l.href} class="btn-ghost">
          {l.text}
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 1L8 5L4 9"/></svg>
        </a>
        {/each}
      </div>
    </section>

    <section id="fpszero">
      <h2 class="text-lg font-semibold text-bright mb-4">{text(about, 'fpszero-heading')}</h2>
      {#each fpszero as line, i}
        <p class={i < fpszero.length - 1 ? 'text-body leading-relaxed mb-3' : 'text-body leading-relaxed'}>{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-bright">{p.value}</strong>{:else if p.kind === 'link'}<a href={p.href} class="text-teal-light link-inline">{p.value}</a>{/if}{/each}</p>
      {/each}
    </section>

  </div>
</div>

<style>
  .prose-custom h2 { margin-top: 0; }
</style>
