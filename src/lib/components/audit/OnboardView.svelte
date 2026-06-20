<script lang="ts">
  import type { AdversaryType, Track, Platform, EnvironmentFlag } from '$lib/types.js';
  import {
    ADVERSARY_OPTIONS, TRACK_OPTIONS, PLATFORM_OPTIONS, ENVIRONMENT_OPTIONS, tierDot
  } from '$lib/audit/constants.js';
  import { platformDisplay } from '$lib/audit/helpers.js';

  // State stays owned by the parent; this component is presentational.
  export let onboardStep: number;            // bound — child advances/rewinds steps
  export let isReconfiguring: boolean;
  export let onboardAdversaries: AdversaryType[];
  export let onboardTracks: Track[];
  export let onboardPlatforms: Platform[];
  export let onboardEnvironment: EnvironmentFlag[];
  export let toggleAdversary: (v: AdversaryType) => void;
  export let toggleTrack: (v: Track) => void;
  export let togglePlatform: (v: Platform) => void;
  export let toggleEnvironment: (v: EnvironmentFlag) => void;
  export let onFinish: () => void;
  export let onCancel: () => void;
</script>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-12">

  <div class="flex items-center gap-3 mb-10">
    {#if isReconfiguring}
      <button type="button"
        on:click={onCancel}
        class="text-xs font-mono text-dim hover:text-body transition-colors flex-shrink-0">
        ← Cancel
      </button>
    {/if}
    <div class="flex gap-1.5 items-center">
      {#each [1,2,3,4] as step}
        <div class="h-1.5 rounded-full transition-all duration-500 {step === onboardStep ? 'w-8 bg-amber' : step < onboardStep ? 'w-4 bg-amber/50' : 'w-4 bg-border'}"></div>
      {/each}
    </div>
    <span class="label-mono opacity-60">{onboardStep} of 4</span>
  </div>

  {#if onboardStep === 1}
  <div class="animate-fade-up">
    <h1 class="font-display text-2xl font-bold text-white mb-2">
      Who are you protecting yourself from?
    </h1>
    <p class="text-body text-sm mb-6 leading-relaxed">
      Be honest — there are no wrong answers. Spectra uses this to weight your checklist
      toward the threats that actually apply to your life.
    </p>

    <div class="flex items-center gap-4 mb-4">
      <span class="label-mono">Exposure level:</span>
      {#each [['common','bg-teal','text-teal-light','Common'],['elevated','bg-amber','text-amber-light','Elevated'],['high','bg-red','text-red-light','High risk']] as [k,dot,text,label]}
        <span class="flex items-center gap-1.5 text-xs font-mono {text}">
          <span class="w-2 h-2 rounded-full {dot} inline-block"></span>{label}
        </span>
      {/each}
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
      {#each ADVERSARY_OPTIONS as opt}
        {@const selected = onboardAdversaries.includes(opt.value)}
        <button type="button" on:click={() => toggleAdversary(opt.value)}
          class="text-left p-4 rounded-lg border transition-all duration-150 group
                 {selected
                   ? 'border-amber/50 bg-amber-dim/15 shadow-sm shadow-amber/5'
                   : 'border-border bg-surface hover:border-muted hover:bg-surface/80'}">
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full {tierDot[opt.tier]} flex-shrink-0 mt-0.5 opacity-80"></span>
              <span class="font-sans font-medium text-sm {selected ? 'text-white' : 'text-bright'}">{opt.label}</span>
            </div>
            <div class="flex-shrink-0 mt-0.5">
              {#if selected}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" fill="#d4862a" fill-opacity="0.2" stroke="#d4862a" stroke-width="1.5"/>
                  <path d="M4 7L6 9L10 5" stroke="#d4862a" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              {:else}
                <span class="w-3.5 h-3.5 rounded-full border border-muted block group-hover:border-dim transition-colors"></span>
              {/if}
            </div>
          </div>
          <p class="text-xs text-dim leading-relaxed pl-3.5">{opt.description}</p>
        </button>
      {/each}
    </div>

    <div class="flex items-center justify-between">
      <p class="text-xs text-muted font-mono">
        {onboardAdversaries.length === 0
          ? 'Select at least one to continue'
          : `${onboardAdversaries.length} selected — your checklist will be weighted accordingly`}
      </p>
      <button type="button"
        on:click={() => { if (onboardAdversaries.length > 0) onboardStep = 2; }}
        class="btn-primary {onboardAdversaries.length === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}">
        Next →
      </button>
    </div>
  </div>

  {:else if onboardStep === 2}
  <div class="animate-fade-up">
    <h1 class="font-display text-2xl font-bold text-white mb-2">Which devices do you use?</h1>
    <p class="text-body text-sm mb-8 leading-relaxed">
      We'll show you implementation steps for your specific operating system. Skip this if you're unsure — you can filter later.
    </p>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
      {#each PLATFORM_OPTIONS as opt}
        {@const selected = onboardPlatforms.includes(opt.value)}
        <button type="button" on:click={() => togglePlatform(opt.value)}
          class="p-4 rounded-lg border transition-all duration-150 flex items-center gap-3 group
                 {selected ? 'border-teal/50 bg-teal-dim/15' : 'border-border bg-surface hover:border-muted'}">
          {#if selected}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" fill="#2a8a8a" fill-opacity="0.2" stroke="#2a8a8a" stroke-width="1.5"/>
              <path d="M4 7L6 9L10 5" stroke="#2a8a8a" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          {:else}
            <span class="w-3.5 h-3.5 rounded-full border border-muted flex-shrink-0 group-hover:border-dim transition-colors"></span>
          {/if}
          <span class="font-sans font-medium text-sm {selected ? 'text-white' : 'text-bright'}">{opt.label}</span>
        </button>
      {/each}
    </div>
    <div class="flex items-center justify-between">
      <button type="button" on:click={() => onboardStep = 1} class="btn-ghost">← Back</button>
      <button type="button" on:click={() => onboardStep = 3} class="btn-primary">Next →</button>
    </div>
  </div>

  {:else if onboardStep === 3}
  <div class="animate-fade-up">
    <h1 class="font-display text-2xl font-bold text-white mb-2">Anything else that applies?</h1>
    <p class="text-body text-sm mb-6 leading-relaxed">
      These unlock additional checklist items specific to your situation.
      All optional — the general baseline always applies to everyone.
    </p>

    <div class="panel border border-teal/20 p-3.5 mb-3 flex items-center gap-3">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" fill="#2a8a8a" fill-opacity="0.2" stroke="#2a8a8a" stroke-width="1.5"/>
        <path d="M4 7L6 9L10 5" stroke="#2a8a8a" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <div>
        <p class="font-sans font-medium text-sm text-bright">General baseline</p>
        <p class="text-xs text-dim mt-0.5">Core security controls — always included for everyone.</p>
      </div>
    </div>

    <div class="space-y-2 mb-6">
      {#each TRACK_OPTIONS as opt}
        {@const selected = onboardTracks.includes(opt.value)}
        <button type="button" on:click={() => toggleTrack(opt.value)}
          class="w-full text-left p-3.5 rounded-lg border transition-all duration-150 flex items-start gap-3 group
                 {selected ? 'border-amber/50 bg-amber-dim/15' : 'border-border bg-surface hover:border-muted'}">
          {#if selected}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="flex-shrink-0 mt-0.5">
              <circle cx="7" cy="7" r="6" fill="#d4862a" fill-opacity="0.2" stroke="#d4862a" stroke-width="1.5"/>
              <path d="M4 7L6 9L10 5" stroke="#d4862a" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          {:else}
            <span class="w-3.5 h-3.5 rounded-full border border-muted flex-shrink-0 mt-0.5 group-hover:border-dim transition-colors"></span>
          {/if}
          <div>
            <p class="font-sans font-medium text-sm {selected ? 'text-white' : 'text-bright'}">{opt.label}</p>
            <p class="text-xs text-dim mt-0.5">{opt.description}</p>
          </div>
        </button>
      {/each}
    </div>

    {#if onboardAdversaries.length > 0}
    <div class="border border-border/60 rounded-lg p-4 mb-6 bg-surface/40">
      <p class="label-mono mb-2.5">Your setup</p>
      <div class="flex flex-wrap gap-1.5">
        {#each onboardAdversaries as adv}
          <span class="pill-amber">{ADVERSARY_OPTIONS.find(o => o.value === adv)?.label ?? adv}</span>
        {/each}
        {#each onboardPlatforms as p}
          <span class="pill-teal">{platformDisplay(p)}</span>
        {/each}
        {#each onboardTracks.filter(t => t !== 'general') as t}
          <span class="pill-dim">{TRACK_OPTIONS.find(o => o.value === t)?.label ?? t}</span>
        {/each}
      </div>
    </div>
    {/if}

    <div class="flex items-center justify-between">
      <button type="button" on:click={() => onboardStep = 2} class="btn-ghost">← Back</button>
      <button type="button" on:click={() => { if (onboardAdversaries.length > 0) onboardStep = 4; }}
        class="btn-primary {onboardAdversaries.length === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}">
        Next →
      </button>
    </div>
  </div>

  {:else if onboardStep === 4}
  <div class="animate-fade-up">
    <h1 class="font-display text-2xl font-bold text-white mb-2">Does any of this apply to you?</h1>
    <p class="text-body text-sm mb-6 leading-relaxed">
      All optional. These unlock environment-specific guidance on relevant checklist items.
      Nothing here is stored beyond your own device.
    </p>

    <div class="space-y-2.5 mb-8">
      {#each ENVIRONMENT_OPTIONS as opt}
        {@const selected = onboardEnvironment.includes(opt.value)}
        <button type="button" on:click={() => toggleEnvironment(opt.value)}
          class="w-full text-left p-4 rounded-lg border transition-all duration-150 flex items-start gap-3 group
                 {selected ? 'border-amber/50 bg-amber-dim/15' : 'border-border bg-surface hover:border-muted'}">
          {#if selected}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="flex-shrink-0 mt-0.5">
              <circle cx="7" cy="7" r="6" fill="#d4862a" fill-opacity="0.2" stroke="#d4862a" stroke-width="1.5"/>
              <path d="M4 7L6 9L10 5" stroke="#d4862a" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          {:else}
            <span class="w-3.5 h-3.5 rounded-full border border-muted flex-shrink-0 mt-0.5 group-hover:border-dim transition-colors"></span>
          {/if}
          <div>
            <p class="font-sans font-medium text-sm {selected ? 'text-white' : 'text-bright'}">{opt.label}</p>
            <p class="text-xs text-dim mt-0.5">{opt.detail}</p>
          </div>
        </button>
      {/each}
    </div>

    <div class="flex items-center justify-between">
      <button type="button" on:click={() => onboardStep = 3} class="btn-ghost">← Back</button>
      <button type="button" on:click={onFinish} class="btn-primary">
        Build my checklist →
      </button>
    </div>
  </div>
  {/if}

</div>
