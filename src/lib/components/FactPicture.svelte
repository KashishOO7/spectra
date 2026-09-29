<script lang="ts">
  export let id: string;
  export let alt: string;
  export let bars: Array<{ value: number; label: string }> = [];
  export let caption = '';
  export let labels: [string, string] = ['', ''];

  const dots = (on: number) => Array.from({ length: 100 }, (_, i) => i < on);
  const KNOWN = ['auth-password-manager-001', 'recovery-email-first-001', 'auth-2fa-001',
                 'ai-phishing-detect-001', 'ai-voice-clone-001', 'location-exposure-001'];
  if (!KNOWN.includes(id)) throw new Error(`FactPicture: no drawing for "${id}"`);
</script>

<div role="img" aria-label={alt}
     class="h-36 rounded-xl bg-surface-2 border border-border flex flex-col items-center justify-center gap-2 px-4">
  {#if id === 'auth-password-manager-001'}
    <svg width="200" height="92" viewBox="0 0 200 92" aria-hidden="true">
      {#each [0, 1, 2, 3] as i}
        <g transform="translate({22 + i * 52} 4)" class="text-dim">
          <circle cx="0" cy="9" r="8" fill="currentColor" opacity="0.55"/>
          <path d="M-13 38a13 13 0 0 1 26 0z" fill="currentColor" opacity="0.55"/>
        </g>
        {#each [0, 1] as j}
          <g transform="translate({6 + (i * 2 + j) * 24} 62)" class="text-viz">
            <rect width="14" height="10" rx="2" fill="currentColor"/>
            <path d="M1 1.5 7 6l6-4.5" style="stroke: rgb(var(--c-surface-2))" stroke-width="1.3" fill="none"/>
          </g>
        {/each}
      {/each}
    </svg>
  {:else if id === 'recovery-email-first-001'}
    <svg width="200" height="100" viewBox="0 0 200 100" aria-hidden="true" class="text-viz">
      {#each [[30, 22], [170, 22], [30, 78], [170, 78]] as [x, y]}
        <line x1={x} y1={y} x2="100" y2="50" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
        <rect x={x - 16} y={y - 9} width="32" height="18" rx="5" style="fill: rgb(var(--c-viz-off))" stroke="currentColor" stroke-width="1.5"/>
      {/each}
      <rect x="78" y="35" width="44" height="30" rx="5" fill="currentColor"/>
      <path d="M82 40 100 53l18-13" style="stroke: rgb(var(--c-surface-2))" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>
  {:else if id === 'auth-2fa-001'}
    <div class="flex items-start gap-6" aria-hidden="true">
      {#each [[100, labels[0]], [1, labels[1]]] as [on, label]}
        <div class="flex flex-col items-center gap-1.5">
          <div class="grid grid-cols-10 gap-[3px]">
            {#each dots(+on) as filled}<i class="block w-[6px] h-[6px] rounded-full {filled ? 'bg-viz' : 'bg-viz-off'}"></i>{/each}
          </div>
          <span class="text-xs text-dim text-center leading-tight max-w-[7.5rem]">{#each String(label).split(' ') as word, w}{w ? ' ' : ''}{#if word.includes('-')}<span class="whitespace-nowrap">{word}</span>{:else}{word}{/if}{/each}</span>
        </div>
      {/each}
    </div>
  {:else if id === 'ai-phishing-detect-001'}
    <div class="w-full max-w-[18rem] grid gap-2" aria-hidden="true">
      {#each bars as b}
        <div class="grid grid-cols-[minmax(0,1fr)_4rem_2.5rem] items-center gap-2">
          <span class="text-xs text-dim leading-tight" data-bar-label>{b.label}</span>
          <span class="h-2.5 rounded-full bg-viz-off overflow-hidden"><span class="block h-full rounded-full bg-viz" style="width: {b.value}%"></span></span>
          <span class="text-xs font-bold text-bright text-right tabular-nums">{b.value}%</span>
        </div>
      {/each}
    </div>
  {:else if id === 'ai-voice-clone-001'}
    <svg width="220" height="64" viewBox="0 0 220 64" aria-hidden="true" class="text-viz">
      {#each [0, 1, 2, 3, 4, 5] as i}
        {@const locked = i >= 4}
        <g transform="translate({18 + i * 37} 6)">
          <rect x="-7" y="0" width="14" height="24" rx="7" fill={locked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.6"/>
          <path d="M-11 18a11 11 0 0 0 22 0M0 29v6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          {#if locked}
            <rect x="-6" y="44" width="12" height="9" rx="2" fill="currentColor"/>
            <path d="M-3.5 44v-3a3.5 3.5 0 0 1 7 0v3" stroke="currentColor" stroke-width="1.5" fill="none"/>
          {/if}
        </g>
      {/each}
    </svg>
  {:else if id === 'location-exposure-001'}
    <div class="grid gap-[3px]" style="grid-template-columns: repeat(20, 6px)" aria-hidden="true">
      {#each dots(46) as filled}<i class="block w-[6px] h-[6px] rounded-full {filled ? 'bg-viz' : 'bg-viz-off'}"></i>{/each}
    </div>
  {/if}
  {#if caption}<p class="text-xs text-dim" aria-hidden="true">{caption}</p>{/if}
</div>
