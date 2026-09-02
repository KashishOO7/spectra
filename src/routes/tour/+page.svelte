<script lang="ts">
  import { TOUR, TOUR_IMAGE } from './tour-data.js';

  let stop = 0;
  let picked: number | null = null;
  let zoomed = false;

  $: current = TOUR[stop];

  function go(i: number) {
    if (i < 0 || i >= TOUR.length) return;
    stop = i;
    picked = null;
  }

  function onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null;
    if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
    if (e.key === 'Escape' && zoomed) { zoomed = false; return; }
    if (zoomed) return;
    if (e.key === 'ArrowRight') go(stop + 1);
    if (e.key === 'ArrowLeft') go(stop - 1);
  }
</script>

<svelte:window on:keydown={onKey} />

<svelte:head>
  <title>Take the tour | Spectra</title>
  <meta name="description"
        content="{TOUR.length} screens from Spectra with every control boxed and explained, so you can see where everything is before you start." />
  <link rel="canonical" href="https://spectra.fpszero.com/tour" />
</svelte:head>

<div class="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">

  <header class="mb-8">
    <h1 class="font-display text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
      Every control, and why it is there
    </h1>
    <p class="text-body leading-relaxed max-w-2xl">
      {TOUR.length} screens from the running product, with the real buttons boxed. Press a box or a
      note to read what it does. Nothing here is a mock-up: every screenshot and every highlight was
      captured from the app itself.
    </p>
  </header>

  <div class="grid gap-7 lg:grid-cols-[230px_minmax(0,1fr)]">

    <nav class="flex lg:flex-col gap-2 lg:gap-0 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0"
         aria-label="Tour stops">
      {#each TOUR as t, i}
        <button type="button" on:click={() => go(i)}
          aria-current={i === stop ? 'step' : undefined}
          class="flex-none lg:w-full text-left px-3 py-2.5 rounded-lg lg:rounded-none
                 lg:border-l-2 border-b-2 lg:border-b-0 transition-colors min-h-[44px]
                 {i === stop
                   ? 'border-amber bg-amber-dim/15 text-white'
                   : 'border-border text-dim hover:text-body hover:bg-surface/60'}">
          <span class="font-mono text-[11px] text-amber-light mr-2">{String(i + 1).padStart(2, '0')}</span>
          <span class="text-sm leading-snug whitespace-nowrap lg:whitespace-normal">{t.title}</span>
        </button>
      {/each}
    </nav>

    <div>
      <p class="label-mono text-amber-light mb-2">Stop {stop + 1} of {TOUR.length}</p>
      <h2 class="font-display text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
        {current.title}
      </h2>
      <p class="text-body leading-relaxed mb-5 max-w-2xl">{current.blurb}</p>

      <div class="flex justify-end mb-2">
        <button type="button" on:click={() => zoomed = true}
          class="btn-ghost text-sm min-h-[44px] px-3">
          Open this screen full size
        </button>
      </div>

      <div class="tour-shot relative rounded-lg overflow-hidden border border-border bg-void
                  leading-none">
        <img src="/tour/{current.file}" alt={current.title}
             width={TOUR_IMAGE.width} height={TOUR_IMAGE.height}
             loading="lazy" decoding="async" class="w-full h-auto block" />

        <button type="button" on:click={() => zoomed = true}
          aria-label="{current.title}, full size"
          class="absolute inset-0 w-full h-full cursor-zoom-in"></button>

        {#each current.spots as s, j}
          <button type="button"
            on:click={() => picked = picked === j ? null : j}
            on:mouseenter={() => picked = j}
            aria-label={s.label}
            class="tour-spot absolute rounded border-2 transition-colors
                   {picked === j ? 'border-amber-light bg-amber-dim/25' : 'border-amber bg-transparent'}"
            style="left:{s.left}%;top:{s.top}%;width:{s.width}%;height:{s.height}%">
            <span class="tour-pin font-mono">{j + 1}</span>
          </button>
        {/each}
      </div>

      <ol class="grid gap-2 mt-5 sm:grid-cols-2 xl:grid-cols-3">
        {#each current.spots as s, j}
          <li>
            <button type="button"
              on:click={() => picked = picked === j ? null : j}
              on:mouseenter={() => picked = j}
              class="w-full h-full text-left flex gap-3 px-3.5 py-3 rounded-lg border transition-colors
                     {picked === j ? 'border-amber/50 bg-surface' : 'border-border bg-surface/40 hover:bg-surface'}">
              <span class="font-mono text-xs text-amber-light pt-0.5 flex-none">{j + 1}</span>
              <span class="min-w-0">
                <span class="block text-[15px] text-bright font-medium mb-1">{s.label}</span>
                <span class="block text-[15px] text-body leading-relaxed">{s.body}</span>
              </span>
            </button>
          </li>
        {/each}
      </ol>

      <div class="flex items-center gap-3 mt-7 pt-5 border-t border-border">
        <button type="button" class="btn-ghost text-sm" on:click={() => go(stop - 1)}
                disabled={stop === 0}>Back</button>
        {#if stop < TOUR.length - 1}
          <button type="button" class="btn-ghost text-sm" on:click={() => go(stop + 1)}>Next screen</button>
        {:else}
          <a href="/" class="btn-primary text-sm">Start with your own list</a>
        {/if}
        <span class="font-mono text-[12px] text-dim ml-auto tabular-nums">
          {String(stop + 1).padStart(2, '0')} / {String(TOUR.length).padStart(2, '0')}
        </span>
      </div>

      <p class="text-sm text-dim mt-4">
        Use the left and right arrow keys to move between screens.
      </p>
    </div>
  </div>
</div>

{#if zoomed}
  <div class="fixed inset-0 z-[100] bg-void/95 overflow-auto p-4 sm:p-8"
       role="dialog" aria-modal="true" aria-label="{current.title}, full size">
    <div class="flex items-center justify-between gap-4 mb-4 max-w-[1280px] mx-auto">
      <p class="text-sm text-bright">{current.title}</p>
      <button type="button" class="btn-ghost text-sm" on:click={() => zoomed = false}>
        Close
      </button>
    </div>
    <img src="/tour/{current.file}" alt={current.title}
         class="block mx-auto rounded-lg border border-border max-w-none"
         width={TOUR_IMAGE.width} height={TOUR_IMAGE.height} />
  </div>
{/if}

<style>
  .tour-spot {
    box-shadow: 0 0 0 3px rgb(var(--c-amber) / 0.12);
  }
  .tour-spot:hover {
    box-shadow: 0 0 0 6px rgb(var(--c-amber) / 0.16);
  }
  .tour-pin {
    position: absolute;
    top: -10px;
    left: -10px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgb(var(--c-amber));
    color: rgb(var(--c-void));
    font-size: 11px;
    line-height: 20px;
    text-align: center;
  }
</style>
