<script lang="ts">
  import chapters from '#spectra-wiki/page/chapters';
  import { items, text } from '$lib/wiki/page.js';

  export let chapter: string;

  const STORIES: Record<string, string[]> = Object.fromEntries(items(chapters, 'stories').map(it => {
    const lines = it.lines.map(l => (l.length === 1 && l[0].kind === 'text' ? l[0].value : ''));
    if (lines.length !== 3 || lines.some(l => !l)) throw new Error(`chapters.md: "${it.title}" needs three plain lines, one per picture`);
    return [it.title, lines];
  }));
  $: lines = STORIES[chapter] ?? [];
  $: if (!lines.length) throw new Error(`ChapterStory: no story for "${chapter}"`);
</script>

<div data-story role="group" aria-label={text(chapters, 'story-label')}
     class="story grid grid-flow-col auto-cols-[84%] gap-3 overflow-x-auto snap-x snap-mandatory pb-1
            sm:grid-flow-row sm:grid-cols-3 sm:auto-cols-auto sm:overflow-visible">
  {#each lines as line, i}
    <figure class="snap-start m-0 rounded-2xl border border-border bg-surface overflow-hidden">
      <div class="relative h-32 grid place-items-center bg-surface-2 border-b border-border text-viz">
        <span class="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-teal text-xs font-semibold grid place-items-center num" aria-hidden="true">{i + 1}</span>
        <svg width="160" height="110" viewBox="0 0 160 110" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          {#if chapter === 'lock-your-accounts'}
            {#if i === 0}
              <ellipse cx="72" cy="24" rx="40" ry="10" class="s"/>
              <path d="M32 24v54c0 5.5 18 10 40 10s40-4.5 40-10V24" class="s"/>
              {#each [40, 53, 66] as y, r}<rect x="46" y={y} width="52" height="7" rx="3.5" stroke="none" class={r === 1 ? 'on' : 'off'}/>{/each}
              <path d="M112 56c16 4 24 14 28 28" stroke-dasharray="3 6"/>
            {:else if i === 1}
              <rect x="34" y="14" width="92" height="60" rx="6" class="s"/>
              <path d="M22 82h116l-8 10H30z" class="on" stroke="none"/>
              <rect x="50" y="30" width="60" height="10" rx="3" class="off" stroke="none"/>
              <rect x="50" y="46" width="60" height="10" rx="3" class="off" stroke="none"/>
              {#each [0, 1, 2, 3, 4, 5] as d}<circle cx={57 + d * 9} cy="51" r="2" class="on" stroke="none"/>{/each}
              <rect x="66" y="61" width="28" height="8" rx="4" class="on" stroke="none"/>
            {:else}
              <rect x="58" y="6" width="44" height="98" rx="9" class="s"/>
              <rect x="70" y="24" width="20" height="16" rx="3"/>
              <path d="M74 24v-4a6 6 0 0 1 12 0v4"/>
              <rect x="66" y="54" width="28" height="12" rx="6" class="off" stroke="none"/>
              <rect x="66" y="72" width="28" height="12" rx="6" class="on" stroke="none"/>
              <path d="M76 75l8 6M84 75l-8 6" class="cut"/>
            {/if}
          {:else if chapter === 'spot-a-scam'}
            {#if i === 0}
              <rect x="58" y="6" width="44" height="98" rx="9" class="s"/>
              <path d="M64 28h32a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H74l-7 6v-6h-3a4 4 0 0 1-4-4V32a4 4 0 0 1 4-4z" class="off" stroke="none"/>
              <circle cx="80" cy="43" r="9" class="s"/>
              <path d="M80 38v5l3 3"/>
            {:else if i === 1}
              <path d="M18 28h54a5 5 0 0 1 5 5v26a5 5 0 0 1-5 5H36l-9 8v-8h-9a5 5 0 0 1-5-5V33a5 5 0 0 1 5-5z" class="s"/>
              <path d="M26 40h40M26 51h24" class="line"/>
              <path d="M82 46c14-12 30-12 40 0" stroke-dasharray="3 6"/>
              <path d="M117 40l6 6-7 4"/>
              <circle cx="136" cy="44" r="8" class="on" stroke="none"/>
              <path d="M122 76c0-10 6-16 14-16s14 6 14 16z" class="on" stroke="none"/>
            {:else}
              <rect x="30" y="6" width="44" height="98" rx="9" class="s"/>
              <rect x="38" y="28" width="28" height="36" rx="4" class="off" stroke="none"/>
              <circle cx="52" cy="40" r="5" class="on" stroke="none"/>
              <path d="M44 56c1.5-5 4.5-7 8-7s6.5 2 8 7" class="on" stroke="none"/>
              <circle cx="116" cy="54" r="20" class="s"/>
              <path d="M106 54l7 7 13-14"/>
            {/if}
          {:else if chapter === 'ai-and-fakes'}
            {#if i === 0}
              <rect x="38" y="6" width="44" height="98" rx="9" class="s"/>
              <circle cx="60" cy="40" r="10" class="on" stroke="none"/>
              <rect x="48" y="72" width="24" height="10" rx="5" class="on" stroke="none"/>
              <path d="M96 40c6 5 6 15 0 20M106 34c10 8 10 24 0 32M116 28c14 11 14 33 0 44"/>
            {:else if i === 1}
              <path d="M14 55h8l5-14 6 28 6-22 5 16 5-8h8"/>
              <path d="M66 55h24" stroke-dasharray="3 5"/>
              <path d="M86 49l6 6-6 6"/>
              <path d="M100 55h8l5-14 6 28 6-22 5 16 5-8h8" class="copy"/>
            {:else}
              <path d="M16 26h72a6 6 0 0 1 6 6v30a6 6 0 0 1-6 6H40l-11 10V68H16a6 6 0 0 1-6-6V32a6 6 0 0 1 6-6z" class="s"/>
              {#each [0, 1, 2, 3] as d}<circle cx={34 + d * 14} cy="47" r="4" class="off" stroke="none"/>{/each}
              <circle cx="128" cy="47" r="20" class="s"/>
              <path d="M120 39l16 16M136 39l-16 16"/>
            {/if}
          {:else if chapter === 'protect-your-phone'}
            {#if i === 0}
              <rect x="18" y="4" width="36" height="18" rx="5"/><rect x="62" y="4" width="36" height="18" rx="5"/><rect x="106" y="4" width="36" height="18" rx="5"/>
              <path d="M24 88V36a10 10 0 0 1 10-10h32a10 10 0 0 1 10 10v36h52a8 8 0 0 1 8 8v8" class="s"/>
              <path d="M18 88h124"/>
              <rect x="96" y="38" width="20" height="34" rx="4" class="on" stroke="none"/>
              <rect x="99" y="42" width="14" height="24" rx="1.5" class="s" stroke="none"/>
            {:else if i === 1}
              <rect x="58" y="6" width="44" height="98" rx="9" class="s"/>
              {#each [0, 1, 2, 3] as d}<circle cx={68 + d * 8} cy="26" r="2.5" class={d < 2 ? 'on' : 'off'} stroke="none"/>{/each}
              {#each [0, 1, 2] as row}{#each [0, 1, 2] as col}<circle cx={68 + col * 12} cy={44 + row * 14} r="4" class="off" stroke="none"/>{/each}{/each}
              <circle cx="80" cy="86" r="4" class="off" stroke="none"/>
            {:else}
              <rect x="58" y="6" width="44" height="98" rx="9" class="s"/>
              {#each [22, 32, 42, 74, 84] as y, r}<path d="M66 {y}h{r % 2 ? 20 : 28}" class="line" stroke-dasharray="2 4"/>{/each}
              <rect x="70" y="52" width="20" height="14" rx="3" class="on" stroke="none"/>
              <path d="M74 52v-4a6 6 0 0 1 12 0v4"/>
            {/if}
          {:else if chapter === 'who-can-find-you'}
            {#if i === 0}
              <rect x="20" y="40" width="96" height="22" rx="11" class="s"/>
              <path d="M32 51h46" class="line"/>
              <circle cx="122" cy="68" r="14" class="s"/>
              <path d="M132 78l12 12"/>
            {:else if i === 1}
              <rect x="30" y="8" width="100" height="94" rx="6" class="s"/>
              <circle cx="56" cy="36" r="12" class="on" stroke="none"/>
              <path d="M78 30h36M78 42h26" class="line"/>
              <path d="M58 60s-8-7-8-13a8 8 0 0 1 16 0c0 6-8 13-8 13z" class="off" stroke="none"/>
              <path d="M78 58h36M42 76h72M42 88h52" class="line"/>
            {:else}
              <rect x="30" y="8" width="100" height="94" rx="6" class="s"/>
              <path d="M42 30h76M42 44h60M42 58h70" class="line" opacity="0.4"/>
              <path d="M62 66l36 24M98 66l-36 24"/>
              <path d="M138 30a12 12 0 1 1-4-9" /><path d="M136 14v8h-8"/>
            {/if}
          {:else if chapter === 'cut-down-tracking'}
            {#if i === 0}
              <rect x="24" y="12" width="112" height="86" rx="7" class="s"/>
              <path d="M24 26h112"/>
              <path d="M38 42h60M38 54h84M38 66h76M38 78h52" class="line"/>
            {:else if i === 1}
              <rect x="50" y="34" width="60" height="44" rx="6" class="s"/>
              <path d="M50 44h60"/>
              {#each [[16, 18], [80, 8], [144, 18], [14, 90], [146, 92], [80, 104]] as [x, y]}
                <path d="M80 56L{x} {y}" stroke-dasharray="2 5"/><circle cx={x} cy={y} r="5" class="on" stroke="none"/>
              {/each}
            {:else}
              <rect x="50" y="34" width="60" height="44" rx="6" class="s"/>
              <path d="M50 44h60"/>
              <path d="M80 50l12 5v9c0 6-5 10-12 12-7-2-12-6-12-12v-9z" class="on" stroke="none"/>
              {#each [[16, 18], [144, 18], [14, 90], [146, 92]] as [x, y]}<circle cx={x} cy={y} r="5" class="off" stroke="none"/>{/each}
            {/if}
          {:else if chapter === 'if-something-happens'}
            {#if i === 0}
              <rect x="16" y="41" width="48" height="28" rx="3" class="s"/>
              <circle cx="40" cy="55" r="7"/><path d="M22 47h5M53 63h5"/>
              <path d="M64 55h40" stroke-dasharray="3 6"/><path d="M98 49l6 6-6 6"/>
              <circle cx="128" cy="44" r="9" class="on" stroke="none"/>
              <path d="M112 78c0-12 7-19 16-19s16 7 16 19z" class="on" stroke="none"/>
            {:else if i === 1}
              <rect x="58" y="6" width="44" height="98" rx="9" class="s"/>
              <path d="M80 26l16 9H64z" class="on" stroke="none"/>
              <path d="M68 39v18M76 39v18M84 39v18M92 39v18"/>
              <path d="M64 61h32"/>
              <path d="M110 34c6 4 6 12 0 16M118 28c10 7 10 21 0 28"/>
            {:else}
              <rect x="56" y="41" width="48" height="28" rx="3" class="s"/>
              <circle cx="80" cy="55" r="7"/><path d="M62 47h5M93 63h5"/>
              <path d="M124 38a44 44 0 0 1 0 34" stroke-dasharray="3 6"/><path d="M130 66l-6 7-7-5"/>
              <path d="M36 38a44 44 0 0 0 0 34" opacity="0.35"/>
            {/if}
          {:else}
            {#if i === 0}
              <path d="M34 42h52a14 14 0 0 1 0 28c-6 0-9-6-14-6h-24c-5 0-8 6-14 6a14 14 0 0 1 0-28z" class="s"/>
              <path d="M40 50v12M34 56h12"/><circle cx="78" cy="52" r="2.5" class="on" stroke="none"/><circle cx="84" cy="60" r="2.5" class="on" stroke="none"/>
              <rect x="110" y="44" width="30" height="26" rx="3" class="on" stroke="none"/>
              <path d="M110 52h30M125 44v26" class="gap"/>
              <path d="M125 44s-4-10-10-8 2 8 10 8zm0 0s4-10 10-8-2 8-10 8z"/>
            {:else if i === 1}
              <rect x="58" y="6" width="44" height="98" rx="9" class="s"/>
              <path d="M66 34h28a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H76l-6 6v-6h-4a4 4 0 0 1-4-4V38a4 4 0 0 1 4-4z" class="off" stroke="none"/>
              <rect x="72" y="72" width="16" height="12" rx="3" class="on" stroke="none"/>
              <path d="M75 72v-3a5 5 0 0 1 10 0v3"/>
            {:else}
              <circle cx="50" cy="36" r="11" class="on" stroke="none"/>
              <path d="M30 88c0-18 9-28 20-28s20 10 20 28z" class="on" stroke="none"/>
              <circle cx="112" cy="50" r="8" class="off" stroke="none"/>
              <path d="M98 88c0-13 6-20 14-20s14 7 14 20z" class="off" stroke="none"/>
              <path d="M76 22h34a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5h-4l-5 5v-5H76a5 5 0 0 1-5-5V27a5 5 0 0 1 5-5z" class="s"/>
            {/if}
          {/if}
        </svg>
      </div>
      <figcaption class="px-3.5 pt-3 pb-3.5 text-sm font-semibold text-bright leading-snug">{line}</figcaption>
    </figure>
  {/each}
</div>

<style>
  .s { fill: rgb(var(--c-surface)); }
  .off { fill: rgb(var(--c-viz-off)); }
  .on { fill: currentColor; }
  .line { stroke: rgb(var(--c-viz-off)); stroke-width: 4; }
  .cut { stroke: rgb(var(--c-surface)); stroke-width: 2.2; }
  .gap { stroke: rgb(var(--c-surface-2)); stroke-width: 2; }
  .copy { opacity: 0.6; }
  .num { color: rgb(var(--c-surface)); }
  .story { scrollbar-width: none; }
</style>
