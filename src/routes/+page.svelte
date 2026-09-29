<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { PageData } from './$types.js';
  import type { Harm } from '$lib/types.js';
  import { HARMS } from '$lib/audit/constants.js';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { loadProfile, saveProfile, createDefaultProfile } from '$lib/engine/store.js';
  import home from '#spectra-wiki/page/home';
  import { text, fill, links, items, plainLines } from '$lib/wiki/page.js';
  import FactPicture from '$lib/components/FactPicture.svelte';

  const title = text(home, 'title');
  const description = text(home, 'description');
  const explainLinks = links(home, 'explain-links');

  const harms = Object.keys(HARMS) as Harm[];

  export let data: PageData;

  const cards = items(home, 'cards').map(c => {
    const [figure, says, alt] = c.lines.slice(0, 3).map(l => (l[0] as { value: string }).value);
    const step = data.cards.find(s => s.id === c.title)!;
    return { id: c.title, figure, says, alt, title: step.title, why: step.why };
  });
  const bars = plainLines(home, 'ai-bars').map(l => {
    const m = /^(\d+) (.+)$/.exec(l);
    if (!m) throw new Error(`wiki/pages/home.md ai-bars: "${l}" is not a number then a label`);
    return { value: +m[1], label: m[2] };
  });
  const scamLine = text(home, 'hero-scam-message');
  const at = scamLine.lastIndexOf(' ') + 1;
  const scam = { before: scamLine.slice(0, at), link: scamLine.slice(at) };
  const twoStep = cards.find(c => c.id === 'auth-2fa-001')!;
  const count = /^(\d+) of (\d+)\b/.exec(text(home, 'hero-chapter-count'));
  if (!count) throw new Error('wiki/pages/home.md hero-chapter-count: not "n of m"');
  const chapter = { done: +count[1], total: +count[2] };
  const trust = items(home, 'trust').map(t => ({ title: t.title, line: (t.lines[0][0] as { value: string }).value }));

  let flipped: Record<string, boolean> = {};
  const flip = (id: string) => (flipped = { ...flipped, [id]: !flipped[id] });
  const turnFrom = (e: MouseEvent, id: string) => {
    if ((e.target as Element).closest('a')) return;
    flip(id);
  };

  let row: HTMLDivElement;
  let first = 1, last = 3;
  function measure() {
    if (!row) return;
    const box = row.getBoundingClientRect();
    const shown = (Array.from(row.children) as HTMLElement[])
      .map((k, i) => ({ i, r: k.getBoundingClientRect() }))
      .filter(({ r }) => r.left >= box.left - 2 && r.right <= box.right + 2)
      .map(({ i }) => i + 1);
    if (shown.length) { first = shown[0]; last = shown[shown.length - 1]; }
  }
  function move(dir: 1 | -1) {
    row?.scrollBy({ left: dir * row.clientWidth, behavior: 'smooth' });
  }

  let returning = false;
  let continueHref = '/audit';

  let selected: Harm[] = [];
  let starting = false;

  let tailorEl: HTMLDetailsElement;
  let tailorOpen = false;

  let hydrated = false;

  async function toggle(harm: Harm) {
    selected = selected.includes(harm)
      ? selected.filter(h => h !== harm)
      : [...selected, harm];
    try {
      const stored = await loadProfile();
      if (selected.length === 0) {
        if (stored?.harms) {
          delete stored.harms;
          await saveProfile(stored);
        }
        return;
      }
      const profile = stored ?? createDefaultProfile();
      profile.harms = [...selected];
      await saveProfile(profile);
    } catch {
    }
  }

  onMount(async () => {
    hydrated = true;
    measure();
    try {
      const profile = await loadProfile();
      returning = !!profile && (
        Object.values(profile.implemented ?? {}).some(Boolean) ||
        Object.keys(profile.skipped ?? {}).length > 0 ||
        !!profile.harms?.length || !!profile.last_open);
      const last = profile?.last_open?.id;
      if (last && !profile?.implemented?.[last] && !profile?.skipped?.[last]) continueHref = `/checklist/${last}`;
      if (profile?.harms?.length) {
        selected = [...profile.harms];
        if (tailorEl) tailorEl.open = true;
        tailorOpen = true;
      }
    } catch {
    }
  });

  $: if (hydrated && tailorEl && $page.url.searchParams.get('edit') === 'harms' && !tailorEl.open) {
    tailorEl.open = true;
    tailorOpen = true;
    tick().then(() => requestAnimationFrame(() => {
      tailorEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  async function start(e: MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (starting) return;
    starting = true;
    try {
      const stored = await loadProfile();

      if (selected.length === 0 && !stored?.harms?.length) {
        await goto('/audit');
        return;
      }

      if (selected.length === 0) {
        delete stored!.harms;
        await saveProfile(stored!);
        await goto('/audit');
        return;
      }

      const profile = stored ?? createDefaultProfile();
      profile.harms = [...selected];
      await saveProfile(profile);
      await goto('/audit?from=harms');
    } catch {
      await goto('/audit');
    } finally {
      starting = false;
    }
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://spectra.fpszero.com/" />
</svelte:head>

<section class="px-4 sm:px-6 pt-8 sm:pt-14 pb-16">
  <div class="hero max-w-6xl mx-auto">
   <div>
    <h1 class="text-3xl font-bold text-white mb-5" data-page-title>{text(home, 'heading')}</h1>
    <p class="text-lg text-body mb-8 max-w-[34ch]">{text(home, 'who-for')}</p>
    <div class="flex flex-wrap items-center gap-3 min-h-[48px]" data-doors>
      {#if returning}
        <a href={continueHref} class="btn-primary">{text(home, 'continue')}</a>
      {:else}
        <a href="/start" class="btn-primary">{text(home, 'start-door')}</a>
      {/if}
      <a href="/real-or-scam" class="btn-ghost">{text(home, 'game-door')}</a>
      <a href="/quiz" class="btn-ghost">{text(home, 'quiz-door')}</a>
    </div>
    <p class="mt-6 text-sm text-body inline-flex items-center gap-2">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"
           stroke-linecap="round" stroke-linejoin="round" class="text-teal flex-shrink-0" aria-hidden="true">
        <path d="m3.5 8.5 3 3 6-7"/>
      </svg>
      {text(home, 'promise')}
    </p>
   </div>

    <div class="stack" role="img" aria-label={text(home, 'hero-cards-alt')}>
      <div class="panel hc s1" data-hero-card>
        <div class="flex items-start justify-between gap-3 mb-2">
          <span class="text-sm text-dim">{text(home, 'hero-scam-from')}</span>
          <span data-scam-tag data-hero-tag class="pill bg-red-dim text-red-light">{text(home, 'hero-scam')}</span>
        </div>
        <p class="text-base text-bright">{scam.before}<span class="text-teal-light underline underline-offset-2 [overflow-wrap:anywhere]">{scam.link}</span></p>
        <p class="mt-2.5 text-sm text-dim">{text(home, 'hero-scam-why')}</p>
      </div>
      <div class="panel hc s2" data-hero-card>
        <div class="flex items-start justify-between gap-3 mb-2">
          <span class="text-sm text-dim">{text(home, 'hero-step-label')}</span>
          <span data-hero-tag class="pill-teal">{text(home, 'hero-step-tag')}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-[34px] h-[34px] rounded-full grid place-items-center bg-teal-dim text-teal flex-none">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg>
          </span>
          <p class="text-base font-semibold text-bright leading-snug">{twoStep.title}</p>
        </div>
        <p class="mt-2.5 text-sm text-body" data-figure><span class="font-semibold text-bright">{twoStep.figure}</span> {twoStep.says}</p>
      </div>
      <div class="panel hc s3" data-hero-card>
        <div class="flex items-start justify-between gap-3 mb-2">
          <span class="text-sm text-dim">{text(home, 'hero-chapter-label')}</span>
          <span data-hero-tag class="pill-teal tabular-nums">{text(home, 'hero-chapter-count')}</span>
        </div>
        <p class="text-base font-semibold text-bright">{text(home, 'hero-chapter')}</p>
        <div class="mt-3 grid gap-[5px]" style="grid-template-columns: repeat({chapter.total}, 1fr)">
          {#each Array.from({ length: chapter.total }, (_, i) => i < chapter.done) as on}
            <i class="block h-2 rounded-full {on ? 'bg-teal' : 'bg-viz-off'}"></i>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="px-4 sm:px-6 pb-16" aria-labelledby="cards-heading">
  <div class="max-w-6xl mx-auto border-t border-border pt-14 sm:pt-20">
    <div class="sec-head mb-8 sm:mb-10">
      <h2 id="cards-heading" class="text-2xl font-bold text-bright">{text(home, 'cards-heading')}</h2>
      <p class="text-lg text-body">{text(home, 'cards-lead')}</p>
    </div>

    <div bind:this={row} on:scroll={measure} data-cards
         class="cards grid grid-flow-col gap-5 overflow-x-auto snap-x snap-mandatory pb-2">
      {#each cards as c (c.id)}
        {@const back = !!flipped[c.id]}
        <article class="card relative grid snap-start min-h-[26rem]" data-card={c.id}>
          <button type="button" aria-pressed={back} aria-label={text(home, 'flip-front')}
                  on:click={() => flip(c.id)} class="flipper"></button>
          <div data-turn class="turn grid {back ? 'turned' : ''}">
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <div data-face="front" class="face panel [grid-area:1/1] flex flex-col p-5 sm:p-6"
                 inert={back ? true : undefined} on:click={e => turnFrom(e, c.id)}>
              <FactPicture id={c.id} alt={c.alt} bars={c.id === 'ai-phishing-detect-001' ? bars : []}
                           labels={[text(home, 'dots-without'), text(home, 'dots-with')]}
                           caption={c.id === 'location-exposure-001' ? text(home, 'dots-caption') : ''} />
              <p class="mt-5 text-2xl font-bold text-bright">{c.figure}</p>
              <p class="mt-2 text-base text-body">{c.says}</p>
            </div>
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <div data-face="back" class="face back panel bg-teal-dim border-transparent [grid-area:1/1] flex flex-col p-5 sm:p-6"
                 inert={back ? undefined : true} on:click={e => turnFrom(e, c.id)}>
              <p class="text-sm font-semibold text-dim">{text(home, 'how-label')}</p>
              <p class="mt-2 text-sm text-body">{c.why}</p>
              <p class="mt-4 text-sm font-semibold text-dim">{text(home, 'step-label')}</p>
              <p class="mt-1 text-base font-semibold text-bright">{c.title}</p>
              <a href="/checklist/{c.id}" class="btn-primary btn-sm self-start mt-4">{text(home, 'show-me-how')}</a>
            </div>
          </div>
        </article>
      {/each}
    </div>

    <div class="flex items-center justify-end gap-3 mt-4">
      <span class="text-sm text-dim tabular-nums" aria-live="polite">{first === last
        ? fill(home, 'cards-position-one', { n: first, total: cards.length })
        : fill(home, 'cards-position', { first, last, total: cards.length })}</span>
      <button type="button" on:click={() => move(-1)} aria-label={text(home, 'cards-previous')} disabled={first === 1}
        class="w-11 h-11 rounded-full border border-muted bg-surface text-bright flex items-center justify-center
               hover:border-teal transition-colors disabled:opacity-40">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3.5 5.5 8 10 12.5"/></svg>
      </button>
      <button type="button" on:click={() => move(1)} aria-label={text(home, 'cards-next')} disabled={last === cards.length}
        class="w-11 h-11 rounded-full border border-muted bg-surface text-bright flex items-center justify-center
               hover:border-teal transition-colors disabled:opacity-40">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5"/></svg>
      </button>
    </div>
  </div>
</section>

<section class="px-4 sm:px-6 pb-16">
  <div class="max-w-3xl mx-auto">
    <p class="text-base text-bright font-medium text-center">{text(home, 'same-list')}</p>

    <details class="mt-2" bind:this={tailorEl} data-hydrated={hydrated ? 'true' : null}
             on:toggle={() => (tailorOpen = tailorEl.open)}>
      <summary class="text-base font-semibold text-body hover:text-bright transition-colors
                      cursor-pointer list-none min-h-[48px] flex items-center justify-center gap-2 select-none">
        {text(home, 'say-what')}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
             class="transition-transform duration-150 {tailorOpen ? 'rotate-180' : ''}">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </summary>

      <ul class="mt-4 space-y-2">
        {#each harms as harm}
          {@const isOn = selected.includes(harm)}
          <li>
            <button type="button"
              aria-pressed={isOn}
              on:click={() => toggle(harm)}
              class="w-full min-h-[56px] text-left px-4 py-3.5 rounded-xl border flex items-center gap-3.5
                     transition-colors duration-150 group
                     {isOn ? 'border-teal bg-teal-dim' : 'border-border bg-surface hover:border-muted'}">
              <span class="flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center" aria-hidden="true">
                {#if isOn}
                  <svg width="18" height="18" viewBox="0 0 14 14" fill="none" class="text-teal">
                    <circle cx="7" cy="7" r="6" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M4 7L6 9L10 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                {:else}
                  <span class="w-[15px] h-[15px] rounded-full border border-muted block group-hover:border-dim transition-colors"></span>
                {/if}
              </span>
              <span class="text-base {isOn ? 'text-white font-medium' : 'text-bright'}">{harm}</span>
            </button>
          </li>
        {/each}
      </ul>

      <div class="mt-6 text-center">
        <a href="/audit" on:click={start} class="btn-primary">{text(home, 'show-my-list')}</a>
      </div>
    </details>
  </div>
</section>

<section class="px-4 sm:px-6 border-t border-border">
  <div class="max-w-6xl mx-auto pt-12">
    <ul class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {#each trust as t, i}
        <li>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
               stroke-linecap="round" stroke-linejoin="round" class="text-teal mb-3" aria-hidden="true">
            {#if i === 0}<path d="M5 4.5h11.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h11.5"/>
            {:else if i === 1}<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>
            {:else if i === 2}<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/>
            {:else}<path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5"/>{/if}
          </svg>
          <p class="text-base font-semibold text-bright">{t.title}</p>
          <p class="text-sm text-body mt-1">{t.line}</p>
        </li>
      {/each}
    </ul>
    <p class="mt-10 flex flex-wrap items-center justify-center gap-x-6 text-base">
      {#each explainLinks as l}
        <a href={l.href} class="text-body hover:text-bright transition-colors min-h-[48px] inline-flex items-center">{l.text}</a>
      {/each}
    </p>
  </div>
</section>

<style>
  .cards { grid-auto-columns: 86%; scrollbar-width: none; }
  .cards::-webkit-scrollbar { display: none; }
  @media (min-width: 640px) { .cards { grid-auto-columns: calc((100% - 1.25rem) / 2); } }
  @media (min-width: 900px) { .cards { grid-auto-columns: calc((100% - 2.5rem) / 3); } }
  .card { perspective: 1400px; }
  .turn { transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1); transform-style: preserve-3d; }
  .turn.turned { transform: rotateY(180deg); }
  .face { backface-visibility: hidden; -webkit-backface-visibility: hidden; cursor: pointer; }
  .face.back { transform: rotateY(180deg); }

  .flipper { position: absolute; inset: 0; z-index: 10; border-radius: 1rem; pointer-events: none; background: transparent; }

  .sec-head { display: grid; gap: 0.75rem; }
  @media (min-width: 900px) { .sec-head { grid-template-columns: 1fr 1fr; gap: 2rem; align-items: end; } }

  .hero { display: grid; gap: 1.75rem; align-items: center; }
  @media (min-width: 900px) { .hero { grid-template-columns: 1.08fr 0.92fr; gap: 3.5rem; } }

  .stack { display: flex; flex-direction: column; gap: 14px; }
  .hc { width: min(400px, 90%); padding: 18px 20px; }
  .s1 { align-self: flex-start; margin-left: 2%; rotate: -2.2deg; }
  .s2 { align-self: flex-end; rotate: 1.6deg; }
  .s3 { align-self: flex-start; margin-left: 8%; rotate: -0.8deg; }

  @media (prefers-reduced-motion: no-preference) and (min-width: 641px) {
    .hc { animation: float 7s ease-in-out infinite; }
    .s2 { animation-delay: -2.3s; }
    .s3 { animation-delay: -4.6s; }
  }
  @keyframes float { 50% { translate: 0 -6px; } }

  @media (max-width: 640px) {
    .stack { gap: 12px; }
    .hc { width: 100%; padding: 14px 16px; }
    .s1 { margin-left: 0; rotate: -1deg; }
    .s2 { rotate: 0.8deg; width: 94%; }
    .s3 { margin-left: 0; rotate: none; width: 90%; }
  }
</style>
