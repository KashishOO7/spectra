<script lang="ts">

  import { onMount, tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { UserProfile } from '$lib/types.js';
  import { LIFE_EVENTS } from '$lib/audit/life-events.js';
  import type { LifeEvent } from '$lib/audit/life-events.js';
  import { ADVERSARY_OPTIONS, TRACK_OPTIONS, OFFERED_TRACKS, tierDot } from '$lib/audit/constants.js';
  import { leadSentence } from '$lib/audit/helpers.js';
  import {
    loadProfile, saveProfile, exportProfile, importProfile, clearAllData,
    applyLifeEvent, revertLifeEvent, createDefaultProfile, derivedAdversaries,
    InvalidProfileError, ClearIncompleteError
  } from '$lib/engine/store.js';
  import { assessment, bumpProfile } from '$lib/engine/session.js';
  import { assessFromAnywhere, invalidateAssessment } from '$lib/engine/lazyAssessment.js';
  import { coverageOf, PENDING_LABEL } from '$lib/engine/coverage.js';
  import { encodeFingerprint, encodeSetup, decodeFingerprint } from '$lib/engine/fingerprint.js';
  import { qrSvg } from '$lib/engine/qr.js';
  import type { AdversaryType, Track, AssessmentResult } from '$lib/types.js';
  import note from '#spectra-wiki/page/setup-panel';
  import { text, fill, pieces, link, placed, named } from '$lib/wiki/page.js';

  const familySetup = link(note, 'family-setup');
  const openYou = link(note, 'open-you');

  export let open = true;
  export let onClose: () => void = () => {};
  export let inline = false;

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

  $: if (open && panel && !inline) void tick().then(() => focusables()[0]?.focus());

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

  let advOpen = false;

  async function toggleAdversary(v: AdversaryType) {
    const p = (await loadProfile()) ?? createDefaultProfile();
    const now = p.adversariesManual ?? [];
    const next = now.includes(v) ? now.filter(a => a !== v) : [...now, v];
    if (next.length > 0) p.adversariesManual = next;
    else delete p.adversariesManual;
    await saveProfile(p);
    await afterWrite();
  }

  $: manualPicked = new Set(profile?.adversariesManual ?? []);

  $: situationLabels = (profile?.tracks ?? [])
    .filter(t => OFFERED_TRACKS.some(o => o.value === t))
    .map(t => TRACK_OPTIONS.find(o => o.value === t)?.label ?? t);

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

  async function changeHarms() {
    onClose();
    await tick();
    await goto('/?edit=harms', { noScroll: true });
  }

  async function seeEverything() {
    onClose();
    await tick();
    await goto('/you');
  }

  async function handleExport() {
    try {
      const json = await exportProfile();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spectra-copy-${new Date().toISOString().slice(0, 10)}.json`;
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
      const raw = await file.text();
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed !== 'object' || parsed === null || Array.isArray(parsed) ||
        !Array.isArray((parsed as Record<string, unknown>).tracks) ||
        !Array.isArray((parsed as Record<string, unknown>).platforms)
      ) {
        throw new Error(text(note, 'not-a-profile'));
      }
      await importProfile(raw);
      await afterWrite();
      importStatus = 'done';
      setTimeout(() => { importStatus = 'idle'; }, 3000);
    } catch (err: any) {
      importError = err instanceof InvalidProfileError ? text(note, 'invalid-profile')
        : err?.message === text(note, 'not-a-profile') ? text(note, 'not-a-profile')
        : text(note, 'invalid-file');
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
  let pasteMapped: string[] = [];

  async function buildShare() {
    const profile = (await loadProfile()) ?? createDefaultProfile();
    shareCode = encodeSetup(profile);
    shareUrl = `${location.origin}/#${encodeFingerprint(profile)}`;
    shareQr = qrSvg(shareUrl, {
      size: 168,
      title: text(note, 'qr-title')
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
    pasteMapped = [];
    const decoded = decodeFingerprint(pasteCode);
    if (!decoded) {
      pasteError = text(note, 'not-recognised');
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
    pasteMapped = decoded.mappedTracks
      .map(m => TRACK_OPTIONS.find(o => o.value === m.to)?.label ?? m.to);
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
      const parts = named(note, 'clear-parts');
      clearError = err instanceof ClearIncompleteError
        ? fill(note, 'clear-partial', { what: err.parts.map(p => parts[p]).join(', ') })
        : err?.message ?? text(note, 'clear-failed');
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
  if (inline || !open) return;
  if (e.key === 'Escape') onClose();
  else trapTab(e);
}} />

      {#if !inline}
<button type="button" class="fixed inset-0 bg-void/70 backdrop-blur-sm z-40"
  on:click={onClose} aria-label={text(note, 'close')} tabindex="-1"></button>
{/if}

<div bind:this={panel}
     role={inline ? null : 'dialog'} aria-modal={inline ? null : 'true'} aria-label={inline ? null : text(note, 'heading')}
     data-setup={inline ? 'inline' : 'sheet'}
     class={inline ? 'flex flex-col' : `fixed top-0 right-0 h-full w-full max-w-sm bg-surface border-l border-border
            z-50 overflow-y-auto shadow-2xl flex flex-col sidebar-scroll`}>

  {#if !inline}
  <div class="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
    <h2 class="font-semibold text-white">{text(note, 'heading')}</h2>
    <button type="button" on:click={onClose}
      class="w-11 h-11 -mr-2 flex items-center justify-center text-dim hover:text-body
             transition-colors text-lg leading-none" aria-label={text(note, 'close')}>✕</button>
  </div>
  <a href={openYou.href} on:click={onClose} data-open-you
     class="mx-5 mt-4 inline-flex items-center min-h-[44px] text-sm font-semibold text-teal-light link-inline">{openYou.text}</a>
  {/if}

  <div class="flex-1 {inline ? '' : 'px-5'} divide-y divide-border [&>section]:py-5">

    <section>
      <p class="label-head mb-3">{text(note, 'worries-heading')}</p>
      {#if nothingPicked}
        <p class="text-sm text-dim mb-3 leading-relaxed">
          {text(note, 'nothing-picked')}
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
      <button type="button" on:click={changeHarms} class="btn-ghost btn-sm">
        {text(note, 'change-worries')}
      </button>
      <button type="button" on:click={() => advOpen = !advOpen} aria-expanded={advOpen}
        class="btn-ghost btn-sm mt-2">
        {text(note, 'add-someone')} <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" class="transition-transform duration-150 {advOpen ? 'rotate-180' : ''}"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
      {#if advOpen}
      <p class="text-sm text-dim mb-2 leading-relaxed">
        {text(note, 'add-someone-lead')}
      </p>
      <div class="space-y-1.5">
        {#each ADVERSARY_OPTIONS as opt}
          {@const on = manualPicked.has(opt.value)}
          <button type="button" on:click={() => toggleAdversary(opt.value)}
            class="w-full text-left rounded-xl border px-3 py-2 flex items-center gap-2.5 transition-colors
                   {on ? 'border-teal/50 bg-teal-dim/15' : 'border-border hover:border-muted'}">
            <span class="w-1.5 h-1.5 rounded-full {tierDot[opt.tier]} flex-shrink-0 opacity-80"></span>
            <span class="text-sm flex-1 {on ? 'text-white' : 'text-body'}">{opt.label}</span>
            {#if on}<span class="text-sm text-teal-light flex-shrink-0">✓</span>{/if}
          </button>
        {/each}
      </div>
      {/if}
    </section>

    <section>
      <p class="label-head mb-3">{text(note, 'situation-heading')}</p>
      {#if situationLabels.length === 0}
        <p class="text-sm text-dim mb-3 leading-relaxed">
          {text(note, 'nothing-added')}
        </p>
      {:else}
        <ul class="space-y-1.5 mb-3">
          {#each situationLabels as label}
            <li class="text-sm text-body leading-snug">{label}</li>
          {/each}
        </ul>
      {/if}
      <button type="button" on:click={changeThis} class="btn-ghost btn-sm">
        {text(note, 'change-this')}
      </button>
    </section>


    <section>
      <p class="label-head mb-3">{text(note, 'list-heading')}</p>
      <p class="text-sm text-body mb-3">
        {coverage ? fill(note, 'list-count', { count: coverage.applicable }) : PENDING_LABEL}
      </p>
      {#if !inline}
      <button type="button" on:click={seeEverything} class="btn-ghost btn-sm">
        {text(note, 'see-everything')}
      </button>
      {/if}
    </section>

    <section>
      <p class="label-head mb-3">{text(note, 'someone-else-heading')}</p>
      <p class="text-sm text-body mb-3 leading-relaxed">
        {text(note, 'someone-else-lead')}
      </p>
      <a href={familySetup.href} on:click={onClose}
         class="btn-ghost btn-sm">
        {familySetup.text}
      </a>
    </section>



    {#if result && result.reverify_items.length > 0}
    <section>
      <p class="label-head mb-3">{text(note, 'recheck-heading')}</p>
      <p class="text-sm text-body mb-2 leading-relaxed">
        {#if result.reverify_items.length === 1}
          {text(note, 'recheck-one')}
        {:else}
          {#each pieces(note, 'recheck-many', { count: result.reverify_items.length }) as piece}{piece}{/each}
        {/if}
      </p>
      <ul class="space-y-1.5">
        {#each result.reverify_items as item}
          <li class="text-sm text-dim leading-snug">{leadSentence(item)}</li>
        {/each}
      </ul>
    </section>
    {/if}

    <section>
      <button type="button" on:click={() => lifeEventsOpen = !lifeEventsOpen}
        aria-expanded={lifeEventsOpen}
        class="btn-ghost btn-sm mb-2">
        {text(note, 'life-open')} <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" class="transition-transform duration-150 {lifeEventsOpen ? 'rotate-180' : ''}"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
      {#if lifeEventsOpen}
      <div class="space-y-2">
        {#each LIFE_EVENTS as ev}
          {@const applied = profile?.life_events_applied?.includes(ev.id)}
          {@const confirming = pendingLifeEvent?.id === ev.id}
          <div class="rounded-xl border transition-colors
                      {applied ? 'border-teal/20 bg-teal-dim/10' : confirming ? 'border-teal/40 bg-teal-dim/10' : 'border-border'}">
            <button type="button" on:click={() => !applied && handleLifeEvent(ev)}
              class="w-full text-left flex items-center gap-3 p-3 {applied ? 'cursor-default' : ''}">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold {applied ? 'text-teal-light' : 'text-bright'}">{ev.label}</p>
                {#if !applied && ((ev.adversary_delta?.length ?? 0) > 0 || (ev.track_delta?.length ?? 0) > 0)}
                  <p class="text-sm text-muted mt-0.5">
                    {#each pieces(note, 'adds', { names: [...(ev.adversary_delta || []), ...(ev.track_delta || [])].slice(0,2).map(v => `“${deltaLabel(v)}”`).join(' and ') }) as piece}{piece}{/each}
                  </p>
                {/if}
              </div>
              {#if applied}<span class="text-sm text-teal-light flex-shrink-0">{text(note, 'applied')}</span>{/if}
            </button>
            {#if confirming}
              <div class="px-3 pb-3 -mt-1">
                <p class="text-sm text-body leading-relaxed mb-2">
                  {text(note, 'sensitive-confirm')}
                </p>
                <div class="flex gap-2">
                  <button type="button" on:click={() => handleLifeEvent(ev)}
                    class="flex-1 py-2 px-3 rounded border border-teal/50 bg-teal-dim/20 text-teal-light text-sm hover:bg-teal-dim/40 transition-colors">
                    {text(note, 'apply')}
                  </button>
                  <button type="button" on:click={() => pendingLifeEvent = null}
                    class="flex-1 py-2 px-3 rounded border border-border text-dim text-sm hover:text-body transition-colors">
                    {text(note, 'cancel')}
                  </button>
                </div>
              </div>
            {/if}
            {#if applied}
              <div class="px-3 pb-2.5 -mt-1">
                <button type="button" on:click={() => handleRevertLifeEvent(ev)}
                  class="text-sm text-muted hover:text-teal-light transition-colors py-1">
                  {text(note, 'undo')}
                </button>
              </div>
            {/if}
          </div>
        {/each}
      </div>
      <p class="text-sm text-muted mt-2">{text(note, 'life-footnote')}</p>
      {/if}
    </section>

    <section>
      <p class="label-head mb-3">{text(note, 'save-heading')}</p>
      <p class="text-sm text-dim mb-3 leading-relaxed">
        {text(note, 'save-lead')}
      </p>
      <button type="button" on:click={handleExport}
        class="btn-ghost btn-sm w-full text-center">
        {exportStatus === 'done' ? text(note, 'exported') : exportStatus === 'error' ? text(note, 'export-failed') : text(note, 'export')}
      </button>
      <p class="text-sm text-dim mt-3 mb-2">{text(note, 'restore')}</p>
      <button type="button" on:click={() => importInput?.click()}
        class="btn-ghost btn-sm w-full text-center">
        {importStatus === 'done' ? text(note, 'imported') : importStatus === 'error' ? fill(note, 'import-error', { message: importError }) : text(note, 'import')}
      </button>
      <input type="file" accept=".json" class="hidden" tabindex="-1" aria-hidden="true"
        bind:this={importInput} on:change={handleImport}/>
    </section>

    <section>
      <p class="label-head mb-3">{text(note, 'move-heading')}</p>

      {#if !showShare}
        <p class="text-sm text-dim mb-3 leading-relaxed">
          {text(note, 'move-lead')}
        </p>
        <button type="button" on:click={buildShare}
          class="btn-ghost btn-sm w-full text-center">
          {text(note, 'show-code')}
        </button>
      {:else}
        <div class="flex flex-col items-center gap-3 mb-4">
          {#if shareQr}
            <div class="rounded-xl overflow-hidden border border-border p-2 bg-white">
              {@html shareQr}
            </div>
          {/if}
          <p data-setup-code class="text-lg font-semibold text-bright tracking-wider select-all break-all text-center tabular-nums">
            {shareCode}
          </p>
        </div>

        <div class="flex gap-2 mb-3">
          <button type="button" on:click={() => copyShare(shareUrl)}
            class="btn-ghost btn-sm flex-1 text-center">
            {copyStatus === 'done' ? text(note, 'copied') : copyStatus === 'error' ? text(note, 'copy-failed') : text(note, 'copy-link')}
          </button>
          <button type="button" on:click={() => copyShare(shareCode)}
            class="btn-ghost btn-sm flex-1 text-center">
            {text(note, 'copy-code')}
          </button>
        </div>

        <p class="text-sm text-dim leading-relaxed mb-3">
          {#each placed(note, 'link-private', ['hash', 'through']) as part}{#if part.value === 'hash' && part.kind === 'slot'}<span class="tabular-nums">#</span>{:else if part.kind === 'slot'}<em>{text(note, 'through')}</em>{:else}{part.value}{/if}{/each}
        </p>

        <a href="/playbook#{shareCode}"
          class="btn-ghost btn-sm w-full">
          {text(note, 'print')}
        </a>
      {/if}

      <div class="mt-4 pt-4 border-t border-border/50">
        <label class="block text-sm text-dim mb-2" for="paste-code">
          {text(note, 'paste-label')}
        </label>
        <div class="flex gap-2">
          <input id="paste-code" type="text" bind:value={pasteCode}
            placeholder={text(note, 'paste-placeholder')}
            autocomplete="off" spellcheck="false"
            class="flex-1 min-w-0 bg-void border border-border rounded px-3 py-2 text-sm text-bright placeholder:text-muted focus:border-teal/50 focus:outline-none"/>
          <button type="button" on:click={applyPasted} disabled={!pasteCode.trim()}
            class="btn-ghost btn-sm flex-shrink-0 disabled:opacity-40">
            {text(note, 'use-it')}
          </button>
        </div>
        {#if pasteStatus === 'done'}
          <p class="text-sm text-teal-light mt-2">{text(note, 'loaded')}</p>
        {:else if pasteStatus === 'error'}
          <p class="text-sm text-bright mt-2">{pasteError}</p>
        {/if}
        {#if pasteMapped.length}
          <p class="text-sm text-dim mt-2 leading-relaxed">
            {`${text(note, 'reworded')} `}{pasteMapped.length === 1 ? text(note, 'reworded-one') : fill(note, 'reworded-many', { count: pasteMapped.length })}{#each pieces(note, 'reworded-names', { names: pasteMapped.join('” and “') }) as piece, i}{i === 0 ? ` ${piece}` : piece}{/each}
          </p>
        {/if}
      </div>
    </section>

    <section class="pt-5">
      <p class="label-head mb-3">{text(note, 'start-over-heading')}</p>
      {#if clearStatus === 'error'}
        <p class="text-sm text-teal-light border border-teal/30 bg-teal-dim/10 rounded px-3 py-2 mb-3">{clearError}</p>
      {:else if clearStatus === 'done'}
        <p class="text-sm text-teal-light border border-teal/30 bg-teal-dim/10 rounded px-3 py-2 mb-3">
          {text(note, 'cleared')}
        </p>
      {/if}
      {#if clearConfirm}
        <div class="border border-muted/40 rounded-xl p-3 bg-surface-2/10">
          <p class="text-sm text-bright mb-3 leading-relaxed">
            {text(note, 'clear-confirm')}
          </p>
          <div class="flex gap-2">
            <button type="button" on:click={handleClear}
              class="flex-1 py-2 px-3 rounded border border-muted/60 bg-surface-2/20
                     text-bright text-sm hover:bg-surface-2/40 transition-colors">
              {text(note, 'start-over')}
            </button>
            <button type="button" on:click={() => clearConfirm = false}
              class="flex-1 py-2 px-3 rounded border border-border text-dim text-sm hover:text-body transition-colors">
              {text(note, 'cancel')}
            </button>
          </div>
        </div>
      {:else}
        <button type="button" on:click={handleClear}
          class="text-sm text-bright border border-muted/30 rounded px-3 py-2
                 hover:bg-surface-2/20 transition-colors w-full text-center">
          {text(note, 'start-over')}
        </button>
      {/if}
    </section>

    <section class="pt-4">
      <p class="text-sm text-muted leading-relaxed">
        {text(note, 'no-accounts')}
      </p>
    </section>

  </div>
</div>
