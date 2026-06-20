<script lang="ts">
  import type { UserProfile, AssessmentResult } from '$lib/types.js';
  import { ADVERSARY_OPTIONS, TRACK_OPTIONS } from '$lib/audit/constants.js';
  import { platformDisplay } from '$lib/audit/helpers.js';
  import { LIFE_EVENTS } from '$lib/audit/life-events.js';

  export let dataPanelOpen: boolean;   // bound
  export let clearConfirm: boolean;    // bound
  export let lifeEventsOpen: boolean;  // bound
  export let profile: UserProfile | null;
  export let result: AssessmentResult | null;
  export let exportStatus: 'idle' | 'done' | 'error';
  export let importStatus: 'idle' | 'done' | 'error';
  export let importError: string;
  export let onReconfigure: () => void;
  export let onLifeEvent: (ev: typeof LIFE_EVENTS[number]) => void;
  export let onViewResults: () => void;
  export let onExport: () => void;
  export let onImport: (e: Event) => void;
  export let onClear: () => void;

  let importInput: HTMLInputElement;
</script>

<button type="button" class="fixed inset-0 bg-void/70 backdrop-blur-sm z-40"
  on:click={() => { dataPanelOpen = false; clearConfirm = false; }} aria-label="Close panel"></button>

<div class="fixed top-0 right-0 h-full w-full max-w-sm bg-surface border-l border-border
            z-50 overflow-y-auto shadow-2xl flex flex-col sidebar-scroll">

  <div class="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
    <h2 class="font-display font-semibold text-white">Data &amp; Settings</h2>
    <button type="button" on:click={() => { dataPanelOpen = false; clearConfirm = false; }}
      class="text-dim hover:text-body transition-colors font-mono text-lg leading-none">✕</button>
  </div>

  <div class="flex-1 px-5 py-5 space-y-6">

    <section>
      <p class="label-mono mb-3">Your Threat Model</p>
      <div class="space-y-3">
        <div>
          <p class="text-xs text-dim font-mono mb-1.5">Adversaries ({profile?.adversaries?.length ?? 0})</p>
          <div class="flex flex-wrap gap-1.5">
            {#each (profile?.adversaries ?? []) as adv}
              <span class="pill-amber">{ADVERSARY_OPTIONS.find(o => o.value === adv)?.label ?? adv}</span>
            {:else}
              <span class="text-xs text-muted font-mono">None — <button type="button" class="text-amber-light underline" on:click={() => { dataPanelOpen = false; onReconfigure(); }}>set up now</button></span>
            {/each}
          </div>
        </div>
        <div>
          <p class="text-xs text-dim font-mono mb-1.5">Platforms</p>
          <div class="flex flex-wrap gap-1.5">
            {#each (profile?.platforms ?? []).filter(p => p !== 'all') as plat}
              <span class="pill-teal">{platformDisplay(plat)}</span>
            {:else}
              <span class="text-xs text-muted font-mono">All platforms</span>
            {/each}
          </div>
        </div>
        <div>
          <p class="text-xs text-dim font-mono mb-1.5">Tracks</p>
          <div class="flex flex-wrap gap-1.5">
            {#each (profile?.tracks ?? ['general']) as track}
              <span class="pill-dim">{TRACK_OPTIONS.find(o => o.value === track)?.label ?? track === 'general' ? 'General baseline' : track}</span>
            {/each}
          </div>
        </div>
      </div>
      <button type="button" on:click={() => { dataPanelOpen = false; onReconfigure(); }}
        class="btn-ghost text-xs py-1.5 px-3 mt-3">
        Reconfigure
      </button>
    </section>

    <section>
      <div class="flex items-center justify-between mb-3">
        <p class="label-mono">Has anything changed?</p>
        <button type="button"
          on:click={() => lifeEventsOpen = !lifeEventsOpen}
          class="text-xs font-mono text-dim hover:text-body transition-colors">
          {lifeEventsOpen ? 'Hide ↑' : 'Update ↓'}
        </button>
      </div>
      {#if lifeEventsOpen}
      <div class="space-y-2">
        {#each LIFE_EVENTS as ev}
          {@const applied = profile?.life_events_applied?.includes(ev.id)}
          <button type="button"
            on:click={() => !applied && onLifeEvent(ev)}
            class="w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors
                   {applied ? 'border-teal/20 bg-teal-dim/10 cursor-default' : 'border-border hover:border-muted'}">
            <span class="text-base flex-shrink-0">{ev.icon}</span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-sans {applied ? 'text-teal-light' : 'text-body'}">{ev.label}</p>
              {#if !applied && ((ev.adversary_delta?.length ?? 0) > 0 || (ev.track_delta?.length ?? 0) > 0)}
                <p class="text-xs font-mono text-muted mt-0.5">
                  {[...(ev.adversary_delta || []), ...(ev.track_delta || [])].slice(0,2).join(', ')} added
                </p>
              {/if}
            </div>
            {#if applied}
              <span class="text-xs font-mono text-teal-light flex-shrink-0">Applied ✓</span>
            {/if}
          </button>
        {/each}
      </div>
      <p class="text-xs text-muted font-mono mt-2">Adds relevant threat vectors to your profile without resetting anything.</p>
      {/if}
    </section>

    <section>
      <p class="label-mono mb-3">Progress</p>
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-void border border-border rounded-lg p-3 text-center">
          <p class="font-display text-2xl font-bold text-white">{result?.total_implemented ?? 0}</p>
          <p class="text-xs text-dim font-mono">items done</p>
        </div>
        <div class="bg-void border border-border rounded-lg p-3 text-center">
          <p class="font-display text-2xl font-bold
                     {(result?.overall_score ?? 0) > 65 ? 'text-teal-light' : (result?.overall_score ?? 0) > 35 ? 'text-amber-light' : 'text-red-light'}">
            {result?.overall_score ?? 0}
          </p>
          <p class="text-xs text-dim font-mono">security score</p>
        </div>
      </div>
      <button type="button" on:click={() => { dataPanelOpen = false; onViewResults(); }}
        class="btn-ghost text-xs py-1.5 px-3 mt-3 w-full text-center">View full results →</button>
      {#if profile?.last_active}
        <p class="text-xs text-muted font-mono mt-2">Last active: {new Date(profile.last_active).toLocaleDateString()}</p>
      {/if}
    </section>

    <section>
      <p class="label-mono mb-1">Export Your Data</p>
      <p class="text-xs text-dim font-mono mb-3">Downloads as JSON. Nothing is sent anywhere.</p>
      <button type="button" on:click={onExport} class="btn-ghost text-xs py-1.5 px-3 w-full text-center">
        {exportStatus === 'done' ? '✓ Downloaded' : exportStatus === 'error' ? 'Export failed' : '↓ Export profile.json'}
      </button>
    </section>

    <section>
      <p class="label-mono mb-1">Import Profile</p>
      <p class="text-xs text-dim font-mono mb-3">Restore a previously exported Spectra profile.</p>
      <label class="btn-ghost text-xs py-1.5 px-3 w-full text-center block cursor-pointer">
        {importStatus === 'done' ? '✓ Imported' : importStatus === 'error' ? `Error: ${importError}` : '↑ Choose file to import'}
        <input type="file" accept=".json" class="hidden" on:change={onImport} bind:this={importInput}/>
      </label>
    </section>

    <section class="border-t border-border pt-5">
      <p class="label-mono text-red-light mb-1">Clear All Data</p>
      <p class="text-xs text-dim font-mono mb-3">Permanently deletes everything from this browser.</p>
      {#if clearConfirm}
        <div class="border border-red/40 rounded-lg p-3 mb-3 bg-red-dim/10">
          <p class="text-xs text-red-light font-mono mb-3">Delete everything — score, checkmarks, threat model. Sure?</p>
          <div class="flex gap-2">
            <button type="button" on:click={onClear}
              class="flex-1 py-1.5 px-3 rounded border border-red/60 bg-red-dim/20
                     text-red-light text-xs font-mono hover:bg-red-dim/40 transition-colors">
              Yes, delete everything
            </button>
            <button type="button" on:click={() => clearConfirm = false}
              class="flex-1 py-1.5 px-3 rounded border border-border text-dim text-xs font-mono hover:text-body transition-colors">
              Cancel
            </button>
          </div>
        </div>
      {:else}
        <button type="button" on:click={onClear}
          class="text-xs font-mono text-red-light border border-red/30 rounded px-3 py-1.5
                 hover:bg-red-dim/20 transition-colors w-full text-center">
          Clear all data
        </button>
      {/if}
    </section>

    <section class="border-t border-border pt-4">
      <p class="text-xs text-muted font-mono leading-relaxed">
        All data lives in your browser's IndexedDB. No server, no account, no analytics. Nothing you enter is ever transmitted.
      </p>
    </section>

  </div>
</div>
