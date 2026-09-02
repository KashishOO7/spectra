<script lang="ts">

  import { onMount, tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { UserProfile } from '$lib/types.js';
  import { LIFE_EVENTS } from '$lib/audit/life-events.js';
  import type { LifeEvent } from '$lib/audit/life-events.js';
  import { ADVERSARY_OPTIONS, TRACK_OPTIONS, ENVIRONMENT_OPTIONS } from '$lib/audit/constants.js';
  import {
    loadProfile, saveProfile, exportProfile, importProfile, clearAllData,
    applyLifeEvent, revertLifeEvent, createDefaultProfile, derivedAdversaries
  } from '$lib/engine/store.js';
  import { assessment, bumpProfile } from '$lib/engine/session.js';
  import { assessFromAnywhere, invalidateAssessment } from '$lib/engine/lazyAssessment.js';
  import { coverageOf, coverageLine, PENDING_LABEL, COVERED_MEANS } from '$lib/engine/coverage.js';
  import { encodeFingerprint, decodeFingerprint } from '$lib/engine/fingerprint.js';
  import { qrSvg } from '$lib/engine/qr.js';
  import type { AdversaryType, Track, AssessmentResult } from '$lib/types.js';

  export let open: boolean;                 
  export let onClose: () => void;

  let profile: UserProfile | null = null;
  let panel: HTMLElement;
  let importInput: HTMLInputElement;

  let exportStatus: 'idle' | 'done' | 'error' = 'idle';
  let importStatus: 'idle' | 'done' | 'error' = 'idle';
  let importError = '';
  let clearConfirm = false;
  let clearStatus: 'idle' | 'done' | 'error' = 'idle';
  let clearError = '';
  let lifeEventsOpen = false;
  let pendingLifeEvent: LifeEvent | null = null;

  const deltaLabel = (v: string) =>
    ADVERSARY_OPTIONS.find(o => o.value === v)?.label
    ?? TRACK_OPTIONS.find(o => o.value === v)?.label
    ?? v.replace(/_/g, ' ');

  async function refresh() {
    try {
      profile = await loadProfile();
    } catch {
      profile = null;
    }
  }

  async function afterWrite() {
    await refresh();
    invalidateAssessment();
    fetched = await assessFromAnywhere();
    bumpProfile();
  }

  onMount(() => {
    void refresh();
    if (!$assessment) void assessFromAnywhere().then(r => { fetched = r; });
  });

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  const focusables = () =>
    panel ? [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(n => n.offsetParent !== null) : [];

  $: if (open && panel) void tick().then(() => focusables()[0]?.focus());

  function trapTab(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    const nodes = focusables();
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement as HTMLElement | null;
    const inside = !!active && panel.contains(active);

    if (e.shiftKey && (!inside || active === first)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (!inside || active === last)) { e.preventDefault(); first.focus(); }
  }

  $: harms = profile?.harms ?? [];

  $: manualOnly = (() => {
    const derived = new Set(derivedAdversaries(profile?.harms));
    return (profile?.adversariesManual ?? []).filter(a => !derived.has(a));
  })();
  $: manualLabels = manualOnly.map(a => ADVERSARY_OPTIONS.find(o => o.value === a)?.label ?? a);
  $: nothingPicked = harms.length === 0 && manualLabels.length === 0;

  $: environmentLabels = (profile?.environment_flags ?? [])
    .map(f => ENVIRONMENT_OPTIONS.find(o => o.value === f)?.label ?? f);

  let fetched: AssessmentResult | null = null;
  $: result = $assessment ?? fetched;
  $: coverage = coverageOf(result);
  $: onAudit = $page.url.pathname.startsWith('/audit');

  async function changeThis() {
    onClose();
    await tick();
    if (onAudit) window.dispatchEvent(new CustomEvent('spectra:configure'));
    else await goto('/audit?configure=1');
  }

  async function seeEverything() {
    onClose();
    await tick();
    if (onAudit) window.dispatchEvent(new CustomEvent('spectra:results'));
    else await goto('/audit?view=results');
  }

  async function handleExport() {
    try {
      const json = await exportProfile();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spectra-profile-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      exportStatus = 'done';
      setTimeout(() => { exportStatus = 'idle'; }, 3000);
    } catch {
      exportStatus = 'error';
      setTimeout(() => { exportStatus = 'idle'; }, 3000);
    }
  }

  async function handleImport(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      if (
        typeof parsed !== 'object' || parsed === null || Array.isArray(parsed) ||
        !Array.isArray((parsed as Record<string, unknown>).tracks) ||
        !Array.isArray((parsed as Record<string, unknown>).platforms)
      ) {
        throw new Error('Not a valid Spectra profile');
      }
      await importProfile(text);
      await afterWrite();
      importStatus = 'done';
      setTimeout(() => { importStatus = 'idle'; }, 3000);
    } catch (err: any) {
      importError = err?.message ?? 'Invalid file';
      importStatus = 'error';
      setTimeout(() => { importStatus = 'idle'; importError = ''; }, 4000);
    }
    input.value = '';
  }

  let shareCode = '';
  let shareUrl = '';
  let shareQr: string | null = null;
  let showShare = false;
  let copyStatus: 'idle' | 'done' | 'error' = 'idle';
  let pasteCode = '';
  let pasteStatus: 'idle' | 'done' | 'error' = 'idle';
  let pasteError = '';

  async function buildShare() {
    const profile = (await loadProfile()) ?? createDefaultProfile();
    shareCode = encodeFingerprint(profile);
    shareUrl = `${location.origin}/#${shareCode}`;
    shareQr = qrSvg(shareUrl, {
      size: 168,
      title: 'Scan to load this setup on another device'
    });
    showShare = true;
  }

  async function copyShare(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copyStatus = 'done';
    } catch {
      copyStatus = 'error';
    }
    setTimeout(() => { copyStatus = 'idle'; }, 2500);
  }

  async function applyPasted() {
    pasteError = '';
    const decoded = decodeFingerprint(pasteCode);
    if (!decoded) {
      pasteError = 'That code was not recognised.';
      pasteStatus = 'error';
      setTimeout(() => { pasteStatus = 'idle'; pasteError = ''; }, 4000);
      return;
    }
    const profile = (await loadProfile()) ?? createDefaultProfile();
    profile.harms = decoded.harms;
    profile.tracks = decoded.tracks;
    profile.platforms = decoded.platforms;
    profile.adversariesManual = decoded.adversariesManual;
    profile.implemented = decoded.implemented;
    profile.skipped = decoded.skipped;
    profile.snoozed = decoded.snoozed;
    await saveProfile(profile);
    await afterWrite();
    pasteStatus = 'done';
    pasteCode = '';
    setTimeout(() => { pasteStatus = 'idle'; }, 3000);
  }

  async function handleClear() {
    if (!clearConfirm) { clearConfirm = true; return; }
    clearError = '';
    try {
      await clearAllData();
    } catch (err: any) {
      clearError = err?.message ?? 'Some data could not be cleared.';
    }
    profile = createDefaultProfile();
    clearConfirm = false;
    invalidateAssessment();
    fetched = await assessFromAnywhere();
    bumpProfile();
    clearStatus = clearError ? 'error' : 'done';
    setTimeout(() => { clearStatus = 'idle'; clearError = ''; }, 5000);
  }

  async function handleLifeEvent(ev: LifeEvent) {
    if (ev.sensitive && pendingLifeEvent?.id !== ev.id) { pendingLifeEvent = ev; return; }
    pendingLifeEvent = null;
    await applyLifeEvent(
      ev.id, ev.label,
      [...ev.adversary_delta] as AdversaryType[],
      [...ev.track_delta] as Track[],
      !!ev.sensitive
    );
    await afterWrite();
  }

  async function handleRevertLifeEvent(ev: LifeEvent) {
    const others = LIFE_EVENTS.filter(
      e => e.id !== ev.id && profile?.life_events_applied?.includes(e.id)
    );
    await revertLifeEvent(
      ev.id,
      [...ev.adversary_delta] as AdversaryType[],
      [...ev.track_delta] as Track[],
      {
        adversaries: others.flatMap(e => [...e.adversary_delta]) as AdversaryType[],
        tracks: others.flatMap(e => [...e.track_delta]) as Track[]
      }
    );
    await afterWrite();
  }
</script>

<svelte:window on:keydown={(e) => {
  if (!open) return;
  if (e.key === 'Escape') onClose();
  else trapTab(e);
}} />

<button type="button" class="fixed inset-0 bg-void/70 backdrop-blur-sm z-40"
  on:click={onClose} aria-label="Close Your setup" tabindex="-1"></button>

<div bind:this={panel}
     role="dialog" aria-modal="true" aria-label="Your setup"
     class="fixed top-0 right-0 h-full w-full max-w-sm bg-surface border-l border-border
            z-50 overflow-y-auto shadow-2xl flex flex-col sidebar-scroll">

  <div class="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
    <h2 class="font-display font-semibold text-white">Your setup</h2>
    <button type="button" on:click={onClose}
      class="w-11 h-11 -mr-2 flex items-center justify-center text-dim hover:text-body
             transition-colors text-lg leading-none" aria-label="Close Your setup">✕</button>
  </div>

  <div class="flex-1 px-5 py-5 space-y-6">

    <section>
      <p class="label-mono mb-3">Who you're protecting yourself from</p>
      {#if nothingPicked}
        <p class="text-sm text-dim mb-3 leading-relaxed">
          Nothing picked yet, so you're seeing the basics.
        </p>
      {:else}
        <ul class="space-y-1.5 mb-3">
          {#each harms as harm}
            <li class="text-sm text-body leading-snug">{harm}</li>
          {/each}
          {#each manualLabels as label}
            <li class="text-sm text-body leading-snug">{label}</li>
          {/each}
        </ul>
      {/if}
      <button type="button" on:click={changeThis} class="btn-ghost text-xs py-1.5 px-3">
        Change this
      </button>
    </section>

    {#if environmentLabels.length > 0}
    <section>
      <p class="label-mono mb-3">What applies where you are</p>
      <ul class="space-y-1.5">
        {#each environmentLabels as label}
          <li class="text-sm text-body leading-snug">{label}</li>
        {/each}
      </ul>
    </section>
    {/if}

    <section>
      <p class="label-mono mb-3">What's on your list</p>
      <p class="text-sm text-body mb-3">
        {coverage ? `${coverage.applicable} things on your list` : PENDING_LABEL}
      </p>
      <button type="button" on:click={seeEverything} class="btn-ghost text-xs py-1.5 px-3">
        See everything, in detail
      </button>
    </section>

    <section>
      <p class="label-mono mb-3">How far you've got</p>
      <p class="text-sm text-body" data-testid="panel-coverage">{coverageLine(coverage)}</p>
      <p class="text-sm text-dim mt-1 leading-relaxed">{COVERED_MEANS}</p>
      {#if coverage}
        <p class="text-sm text-muted mt-2">
          {coverage.done} of {coverage.applicable} things done{#if coverage.skipped}&nbsp;· {coverage.skipped} skipped{/if}
        </p>
      {/if}
    </section>

    {#if result && result.reverify_items.length > 0}
    <section>
      <p class="label-mono mb-3">Worth re-checking</p>
      <p class="text-sm text-body mb-2 leading-relaxed">
        {#if result.reverify_items.length === 1}
          One thing you've marked done has changed. Worth a re-read.
        {:else}
          {result.reverify_items.length} things you've marked done have changed. Worth a re-read.
        {/if}
      </p>
      <ul class="space-y-1.5">
        {#each result.reverify_items as item}
          <li class="text-sm text-dim leading-snug">{item.simple_description ?? item.title}</li>
        {/each}
      </ul>
    </section>
    {/if}

    <section>
      <button type="button" on:click={() => lifeEventsOpen = !lifeEventsOpen}
        aria-expanded={lifeEventsOpen}
        class="text-sm text-dim hover:text-body transition-colors py-2 mb-1 text-left">
        {lifeEventsOpen ? 'Hide ↑' : 'Something changed in my life'}
      </button>
      {#if lifeEventsOpen}
      <div class="space-y-2">
        {#each LIFE_EVENTS as ev}
          {@const applied = profile?.life_events_applied?.includes(ev.id)}
          {@const confirming = pendingLifeEvent?.id === ev.id}
          <div class="rounded-lg border transition-colors
                      {applied ? 'border-teal/20 bg-teal-dim/10' : confirming ? 'border-amber/40 bg-amber-dim/10' : 'border-border'}">
            <button type="button" on:click={() => !applied && handleLifeEvent(ev)}
              class="w-full text-left flex items-center gap-3 p-3 {applied ? 'cursor-default' : ''}">
              <span class="text-base flex-shrink-0">{ev.icon}</span>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-sans {applied ? 'text-teal-light' : 'text-body'}">{ev.label}</p>
                {#if !applied && ((ev.adversary_delta?.length ?? 0) > 0 || (ev.track_delta?.length ?? 0) > 0)}
                  <p class="text-sm text-muted mt-0.5">
                    Adds {[...(ev.adversary_delta || []), ...(ev.track_delta || [])].slice(0,2).map(deltaLabel).join(', ')}
                  </p>
                {/if}
              </div>
              {#if applied}<span class="text-sm text-teal-light flex-shrink-0">Applied ✓</span>{/if}
            </button>
            {#if confirming}
              <div class="px-3 pb-3 -mt-1">
                <p class="text-sm text-body leading-relaxed mb-2">
                  This reorders your checklist. It will not write what happened to your timeline &mdash;
                  the entry will read “Your setup updated”. You can undo it here at any time.
                </p>
                <div class="flex gap-2">
                  <button type="button" on:click={() => handleLifeEvent(ev)}
                    class="flex-1 py-2 px-3 rounded border border-amber/50 bg-amber-dim/20 text-amber-light text-sm hover:bg-amber-dim/40 transition-colors">
                    Apply
                  </button>
                  <button type="button" on:click={() => pendingLifeEvent = null}
                    class="flex-1 py-2 px-3 rounded border border-border text-dim text-sm hover:text-body transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            {/if}
            {#if applied}
              <div class="px-3 pb-2.5 -mt-1">
                <button type="button" on:click={() => handleRevertLifeEvent(ev)}
                  class="text-sm text-muted hover:text-amber-light transition-colors py-1">
                  Undo this
                </button>
              </div>
            {/if}
          </div>
        {/each}
      </div>
      <p class="text-sm text-muted mt-2">Reorders your checklist. Nothing here is written to your timeline in words.</p>
      {/if}
    </section>

    <section>
      <p class="label-mono mb-3">Save a copy</p>
      <p class="text-sm text-dim mb-3 leading-relaxed">
        Saves a file to your device. Nothing is sent anywhere, but this file describes your
        situation, so mind where it lands.
      </p>
      <button type="button" on:click={handleExport}
        class="btn-ghost text-xs py-2 px-3 w-full text-center">
        {exportStatus === 'done' ? '✓ Downloaded' : exportStatus === 'error' ? 'Export failed' : '↓ Export profile.json'}
      </button>
      <p class="text-sm text-dim mt-3 mb-2">Restore a previously exported Spectra profile.</p>
      <button type="button" on:click={() => importInput?.click()}
        class="btn-ghost text-xs py-2 px-3 w-full text-center">
        {importStatus === 'done' ? '✓ Imported' : importStatus === 'error' ? `Error: ${importError}` : '↑ Choose file to import'}
      </button>
      <input type="file" accept=".json" class="hidden" tabindex="-1" aria-hidden="true"
        bind:this={importInput} on:change={handleImport}/>
    </section>

    <section>
      <p class="label-mono mb-3">Move this to another device</p>

      {#if !showShare}
        <p class="text-sm text-dim mb-3 leading-relaxed">
          Your setup fits in twenty characters. Send it as a link, scan it as a code, or write it
          down. It carries what you tapped and what you have done, never your notes or timeline.
        </p>
        <button type="button" on:click={buildShare}
          class="btn-ghost text-xs py-2 px-3 w-full text-center">
          Show my setup code
        </button>
      {:else}
        <div class="flex flex-col items-center gap-3 mb-4">
          {#if shareQr}
            <div class="rounded-lg overflow-hidden border border-border p-2 bg-white">
              {@html shareQr}
            </div>
          {/if}
          <p class="font-mono text-sm text-bright tracking-wider select-all break-all text-center">
            {shareCode}
          </p>
        </div>

        <div class="flex gap-2 mb-3">
          <button type="button" on:click={() => copyShare(shareUrl)}
            class="btn-ghost text-xs py-2 px-3 flex-1 text-center">
            {copyStatus === 'done' ? '✓ Copied' : copyStatus === 'error' ? 'Copy failed' : 'Copy link'}
          </button>
          <button type="button" on:click={() => copyShare(shareCode)}
            class="btn-ghost text-xs py-2 px-3 flex-1 text-center">
            Copy code
          </button>
        </div>

        <p class="text-sm text-dim leading-relaxed mb-3">
          The code sits after the <span class="font-mono">#</span> in that link, and browsers never
          send that part to a server. Ours never receives it. Whatever you send the link
          <em>through</em> can still see it.
        </p>

        <a href="/playbook#{shareCode}"
          class="btn-ghost text-xs py-2 px-3 w-full text-center block">
          Print this list on paper
        </a>
      {/if}

      <div class="mt-4 pt-4 border-t border-border/50">
        <label class="block text-sm text-dim mb-2" for="paste-code">
          Or enter a code from another device
        </label>
        <div class="flex gap-2">
          <input id="paste-code" type="text" bind:value={pasteCode}
            placeholder="20 characters"
            autocomplete="off" spellcheck="false"
            class="flex-1 min-w-0 bg-void border border-border rounded px-3 py-2 text-sm font-mono
                   text-bright placeholder:text-muted focus:border-amber/50 focus:outline-none"/>
          <button type="button" on:click={applyPasted} disabled={!pasteCode.trim()}
            class="btn-ghost text-xs py-2 px-3 flex-shrink-0 disabled:opacity-40">
            Use it
          </button>
        </div>
        {#if pasteStatus === 'done'}
          <p class="text-sm text-teal-light mt-2">Loaded. Your list has been updated.</p>
        {:else if pasteStatus === 'error'}
          <p class="text-sm text-red-light mt-2">{pasteError}</p>
        {/if}
      </div>
    </section>

    <section class="border-t border-border pt-5">
      <p class="label-mono text-red-light mb-3">Start over</p>
      {#if clearStatus === 'error'}
        <p class="text-sm text-amber-light border border-amber/30 bg-amber-dim/10 rounded px-3 py-2 mb-3">{clearError}</p>
      {:else if clearStatus === 'done'}
        <p class="text-sm text-teal-light border border-teal/30 bg-teal-dim/10 rounded px-3 py-2 mb-3">
          Cleared. Nothing is left in this browser's storage.
        </p>
      {/if}
      {#if clearConfirm}
        <div class="border border-red/40 rounded-lg p-3 bg-red-dim/10">
          <p class="text-sm text-red-light mb-3 leading-relaxed">
            This clears everything Spectra stored on this device. It cannot be undone. It does not
            clear your browser history.
          </p>
          <div class="flex gap-2">
            <button type="button" on:click={handleClear}
              class="flex-1 py-2 px-3 rounded border border-red/60 bg-red-dim/20
                     text-red-light text-sm hover:bg-red-dim/40 transition-colors">
              Start over
            </button>
            <button type="button" on:click={() => clearConfirm = false}
              class="flex-1 py-2 px-3 rounded border border-border text-dim text-sm hover:text-body transition-colors">
              Cancel
            </button>
          </div>
        </div>
      {:else}
        <button type="button" on:click={handleClear}
          class="text-sm text-red-light border border-red/30 rounded px-3 py-2
                 hover:bg-red-dim/20 transition-colors w-full text-center">
          Start over
        </button>
      {/if}
    </section>

    <section class="border-t border-border pt-4">
      <p class="text-sm text-muted leading-relaxed">
        Spectra has no accounts. Nothing here leaves your browser.
      </p>
    </section>

  </div>
</div>
