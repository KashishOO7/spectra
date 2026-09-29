<script lang="ts">
  import type { Track } from '$lib/types.js';
  import { OFFERED_TRACKS } from '$lib/audit/constants.js';
  import note from '#spectra-wiki/page/onboarding';
  import { text } from '$lib/wiki/page.js';


  export let isReconfiguring: boolean;
  export let onboardTracks: Track[];
  export let toggleTrack: (v: Track) => void;
  export let onFinish: () => void;
  export let onCancel: () => void;
</script>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-12">

  {#if isReconfiguring}
  <div class="mb-10">
    <button type="button"
      on:click={onCancel}
      class="text-sm text-dim hover:text-body transition-colors">
      {text(note, 'cancel')}
    </button>
  </div>
  {/if}

  <div class="animate-fade-up">
    <h1 class="text-2xl font-semibold text-white mb-2" data-sentence>{text(note, 'heading')}</h1>
    <p class="text-body text-sm mb-6 leading-relaxed">
      {text(note, 'lead')}
    </p>

    <div class="panel border border-teal/20 p-3.5 mb-3 flex items-center gap-3">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="text-teal">
        <circle cx="7" cy="7" r="6" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M4 7L6 9L10 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <div>
        <p class="font-sans font-medium text-sm text-bright">{text(note, 'basics')}</p>
        <p class="text-xs text-dim mt-0.5">{text(note, 'basics-detail')}</p>
      </div>
    </div>

    <div class="space-y-2 mb-8">
      {#each OFFERED_TRACKS as opt}
        {@const selected = onboardTracks.includes(opt.value)}
        <button type="button" on:click={() => toggleTrack(opt.value)}
          class="w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-start gap-3 group
                 {selected ? 'border-teal/50 bg-teal-dim/15' : 'border-border bg-surface hover:border-muted'}">
          <span class="flex-shrink-0 flex items-center h-[1.55em] text-sm" aria-hidden="true">
          {#if selected}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="text-teal">
              <circle cx="7" cy="7" r="6" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M4 7L6 9L10 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          {:else}
            <span class="w-3.5 h-3.5 rounded-full border border-muted group-hover:border-dim transition-colors"></span>
          {/if}
          </span>
          <div>
            <p class="font-sans font-medium text-sm {selected ? 'text-white' : 'text-bright'}">{opt.label}</p>
            <p class="text-xs text-dim mt-0.5">{opt.description}</p>
          </div>
        </button>
      {/each}
    </div>

    <div class="flex items-center justify-end">
      <button type="button" on:click={onFinish} class="btn-primary">
        {text(note, 'build')}
      </button>
    </div>
  </div>

</div>
