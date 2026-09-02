<script lang="ts">
  import { onMount } from 'svelte';
  import { decodeFingerprint, type ProfileFingerprint } from '$lib/engine/fingerprint.js';
  import { loadProfile, saveProfile, createDefaultProfile } from '$lib/engine/store.js';
  import { HARMS } from '$lib/audit/constants.js';
  import type { Harm } from '$lib/types.js';

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
  <div class="w-full border-b border-amber/30 bg-amber-dim/10" role="region"
       aria-label="A shared setup was found in this link">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="min-w-0 flex-1">
        <p class="text-sm text-bright font-semibold">This link carries a setup</p>
        <p class="text-sm text-body leading-relaxed mt-0.5">
          {#if harmNames.length}
            It picks {harmNames.length} of {Object.keys(HARMS).length} things to worry about{#if doneCount}, and marks {doneCount} step{doneCount === 1 ? '' : 's'} already done{/if}.
          {:else if doneCount}
            It marks {doneCount} step{doneCount === 1 ? '' : 's'} already done.
          {:else}
            It sets which steps apply to you.
          {/if}
          {#if hasExisting}
            <span class="text-amber-light">Using it replaces what is on this device.</span>
          {:else}
            Nothing was sent anywhere. The setup travelled inside the link itself.
          {/if}
        </p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button type="button" class="btn-primary text-sm" on:click={apply} disabled={applying}>
          {applying ? 'Loading…' : 'Use this setup'}
        </button>
        <button type="button"
                class="text-sm text-dim hover:text-body underline transition-colors px-2 py-2"
                on:click={dismiss}>
          No thanks
        </button>
      </div>
    </div>
  </div>
{/if}
