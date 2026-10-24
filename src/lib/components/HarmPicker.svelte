<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Harm } from '$lib/types.js';
  import { HARMS } from '$lib/audit/constants.js';
  import { loadProfile, saveProfile, createDefaultProfile } from '$lib/engine/store.js';
  import { bumpProfile } from '$lib/engine/session.js';

  export let openLabel: string;

  const harms = Object.keys(HARMS) as Harm[];
  let selected: Harm[] = [];
  let starting = false;

  onMount(async () => {
    try {
      const profile = await loadProfile();
      if (profile?.harms?.length) selected = [...profile.harms];
    } catch {
    }
  });

  async function toggle(harm: Harm) {
    selected = selected.includes(harm)
      ? selected.filter(h => h !== harm)
      : [...selected, harm];
    try {
      const stored = await loadProfile();
      if (selected.length === 0) {
        if (stored?.harms) {
          delete stored.harms;
          await saveProfile(stored);
          bumpProfile();
        }
        return;
      }
      const profile = stored ?? createDefaultProfile();
      profile.harms = [...selected];
      await saveProfile(profile);
      bumpProfile();
    } catch {
    }
  }

  async function start(e: MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (starting) return;
    starting = true;
    try {
      const stored = await loadProfile();

      if (selected.length === 0 && !stored?.harms?.length) {
        await goto('/audit');
        return;
      }

      if (selected.length === 0) {
        delete stored!.harms;
        await saveProfile(stored!);
        await goto('/audit');
        return;
      }

      const profile = stored ?? createDefaultProfile();
      profile.harms = [...selected];
      await saveProfile(profile);
      await goto('/audit?from=harms');
    } catch {
      await goto('/audit');
    } finally {
      starting = false;
    }
  }
</script>

<ul class="mt-4 space-y-2" data-harm-picker>
  {#each harms as harm}
    {@const isOn = selected.includes(harm)}
    <li>
      <button type="button"
        aria-pressed={isOn}
        on:click={() => toggle(harm)}
        class="w-full min-h-[56px] text-left px-4 py-3.5 rounded-xl border flex items-center gap-3.5
               transition-colors duration-150 group
               {isOn ? 'border-teal bg-teal-dim' : 'border-border bg-surface hover:border-muted'}">
        <span class="flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center" aria-hidden="true">
          {#if isOn}
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none" class="text-teal">
              <circle cx="7" cy="7" r="6" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M4 7L6 9L10 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {:else}
            <span class="w-[15px] h-[15px] rounded-full border border-muted block group-hover:border-dim transition-colors"></span>
          {/if}
        </span>
        <span class="text-base {isOn ? 'text-white font-medium' : 'text-bright'}">{harm}</span>
      </button>
    </li>
  {/each}
</ul>

<a href="/audit" on:click={start} class="btn-primary btn-sm mt-5">{openLabel}</a>
