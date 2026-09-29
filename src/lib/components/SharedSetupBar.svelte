<script lang="ts">
  import { onMount } from 'svelte';
  import { decodeFingerprint, type ProfileFingerprint } from '$lib/engine/fingerprint.js';
  import { loadProfile, saveProfile, createDefaultProfile } from '$lib/engine/store.js';
  import { HARMS, TRACK_OPTIONS } from '$lib/audit/constants.js';
  import type { Harm } from '$lib/types.js';
  import note from '#spectra-wiki/page/share-bar';
  import { text, pieces } from '$lib/wiki/page.js';


  let incoming: ProfileFingerprint | null = null;
  let hasExisting = false;
  let applying = false;

  const clearFragment = () =>
    history.replaceState(null, '', location.pathname + location.search);

  async function readFragment() {
    const raw = location.hash.slice(1);
    if (!raw) return;
    const decoded = decodeFingerprint(raw);
    if (!decoded) return;

    incoming = decoded;
    const existing = await loadProfile();
    hasExisting =
      !!existing &&
      ((existing.harms?.length ?? 0) > 0 ||
       (existing.adversariesManual?.length ?? 0) > 0 ||
       (existing.platforms?.length ?? 0) > 0 ||
       (existing.tracks ?? []).some(t => t !== 'general') ||
       Object.keys(existing.implemented ?? {}).length > 0 ||
       Object.keys(existing.skipped ?? {}).length > 0 ||
       Object.keys(existing.snoozed ?? {}).length > 0);
  }

  onMount(() => {
    void readFragment();
    const onHashChange = () => void readFragment();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  });

  $: harmNames = (incoming?.harms ?? []) as Harm[];
  $: doneCount = Object.keys(incoming?.implemented ?? {}).length;

  $: mappedNames = (incoming?.mappedTracks ?? [])
    .map(m => TRACK_OPTIONS.find(o => o.value === m.to)?.label ?? m.to);

  async function apply() {
    if (!incoming || applying) return;
    applying = true;
    const profile = (await loadProfile()) ?? createDefaultProfile();

    profile.harms = incoming.harms;
    profile.tracks = incoming.tracks;
    profile.platforms = incoming.platforms;
    profile.adversariesManual = incoming.adversariesManual;
    profile.implemented = incoming.implemented;
    profile.skipped = incoming.skipped;
    profile.snoozed = incoming.snoozed;

    await saveProfile(profile);
    clearFragment();
    location.assign('/audit');
  }

  function dismiss() {
    clearFragment();
    incoming = null;
  }
</script>

{#if incoming}
  <div class="w-full border-b border-teal/30 bg-teal-dim/10" role="region"
       aria-label={text(note, 'region')}>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="min-w-0 flex-1">
        <p class="text-sm text-bright font-semibold">{text(note, 'heading')}</p>
        <p class="text-sm text-body leading-relaxed mt-0.5">
          {#if harmNames.length}
            {#each pieces(note, !doneCount ? 'picks' : doneCount === 1 ? 'picks-done-one' : 'picks-done-many',
              doneCount ? { picked: harmNames.length, total: Object.keys(HARMS).length, done: doneCount }
                        : { picked: harmNames.length, total: Object.keys(HARMS).length }) as piece}{piece}{/each}
          {:else if doneCount}
            {#each pieces(note, doneCount === 1 ? 'done-one' : 'done-many', { done: doneCount }) as piece}{piece}{/each}
          {:else}
            {text(note, 'sets')}
          {/if}
          {#if hasExisting}
            <span class="text-teal-light">{text(note, 'replaces')}</span>
          {:else}
            {text(note, 'nothing-sent')}
          {/if}
        </p>
        {#if mappedNames.length}
          <p class="text-sm text-dim leading-relaxed mt-1">
            {#each mappedNames.length === 1
              ? pieces(note, 'reworded-one', { names: mappedNames.join('” and “') })
              : pieces(note, 'reworded-many', { count: mappedNames.length, names: mappedNames.join('” and “') }) as piece}{piece}{/each}
          </p>
        {/if}
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button type="button" class="btn-primary text-sm" on:click={apply} disabled={applying}>
          {applying ? text(note, 'loading') : text(note, 'use')}
        </button>
        <button type="button"
                class="text-sm text-dim hover:text-body underline transition-colors px-2 py-2"
                on:click={dismiss}>
          {text(note, 'decline')}
        </button>
      </div>
    </div>
  </div>
{/if}
