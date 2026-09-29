<script lang="ts">
  import type { GameMessage } from '$lib/audit/game.js';

  export let m: GameMessage;
  export let sponsored: string;

  const ADDRESS = /([a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,})/i;
  $: parts = m.body.split(ADDRESS).map((t, i) => ({ t, address: i % 2 === 1 }));
  $: initial = m.sender.trim().charAt(0).toUpperCase();
  const TIME = '9:41';
</script>

<div class="bezel" data-message={m.id}>
  <div class="screen" data-screen data-app={m.channel}>
    <div class="flex items-center justify-between px-5 pt-3 pb-2 text-xs font-semibold text-bright" data-status-bar aria-hidden="true">
      <span class="tabular-nums">{TIME}</span>
      <span class="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.5" width="3" height="8.5" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M1 4a9.5 9.5 0 0 1 13 0M3.4 6.4a6 6 0 0 1 8.2 0M5.8 8.8a2.6 2.6 0 0 1 3.4 0"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.45"/><rect x="2" y="2" width="15" height="8" rx="1.5" fill="currentColor"/><path d="M23 4v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.45"/></svg>
      </span>
    </div>

    {#if m.channel === 'text' || m.channel === 'group'}
      <div class="flex items-center gap-3 px-4 py-2.5 border-b border-border">
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-teal-light flex-none" aria-hidden="true"><path d="M8 2 2 8l6 6"/></svg>
        <span class="avatar" aria-hidden="true">
          {#if m.channel === 'group'}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><circle cx="6.5" cy="6" r="2.6"/><circle cx="12.5" cy="7" r="2.2"/><path d="M1.5 15a5 5 0 0 1 10 0zM10 15a4.5 4.5 0 0 1 7 0z"/></svg>
          {:else}{initial}{/if}
        </span>
        <p class="text-base font-semibold text-bright" data-sender>{m.sender}</p>
      </div>
      <div class="px-4 pt-5 pb-4 min-h-[13rem]">
        <p class="bubble text-base text-bright">{#each parts as p}{#if p.address}<span class="addr">{p.t}</span>{:else}{p.t}{/if}{/each}</p>
        <p class="mt-1 pl-1 text-xs text-dim tabular-nums" aria-hidden="true">{TIME}</p>
      </div>
      <div class="mx-3 mb-3 h-10 rounded-full border border-border" aria-hidden="true"></div>

    {:else if m.channel === 'email'}
      <div class="flex items-center justify-between px-4 py-2.5 text-teal-light" aria-hidden="true">
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2 2 8l6 6"/></svg>
        <span class="flex gap-4">
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="1" y="1.5" width="15" height="4" rx="1"/><path d="M2.5 5.5v8.5h12V5.5M6.5 8.5h4"/></svg>
          <svg width="15" height="16" viewBox="0 0 15 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 3.5h13M5.5 3.5V1.5h4v2M2.5 3.5l1 11h8l1-11"/></svg>
        </span>
      </div>
      <div class="flex items-center gap-3 px-4 pt-2 pb-3">
        <span class="avatar" aria-hidden="true">{initial}</span>
        <p class="flex-1 text-base font-semibold text-bright" data-sender>{m.sender}</p>
        <span class="text-xs text-dim tabular-nums" aria-hidden="true">{TIME}</span>
      </div>
      <p class="px-4 pb-6 min-h-[12rem] text-base text-bright">{#each parts as p}{#if p.address}<span class="addr">{p.t}</span>{:else}{p.t}{/if}{/each}</p>

    {:else if m.channel === 'post'}
      <div class="flex items-center gap-3 px-4 pt-3 pb-2">
        <span class="avatar rounded-lg" aria-hidden="true">{initial}</span>
        <div>
          <p class="text-base font-semibold text-bright leading-tight" data-sender>{m.sender}</p>
          <p class="text-xs text-dim">{sponsored}</p>
        </div>
      </div>
      <p class="px-4 text-base text-bright">{#each parts as p}{#if p.address}<span class="addr">{p.t}</span>{:else}{p.t}{/if}{/each}</p>
      <div class="mx-4 mt-3 h-32 rounded-xl bg-teal-dim grid place-items-center text-viz" aria-hidden="true">
        <svg width="56" height="44" viewBox="0 0 56 44" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M8 14h40l-4 26H12z"/><path d="M19 14a9 9 0 0 1 18 0"/></svg>
      </div>
      <div class="flex gap-5 px-4 py-3 text-dim" aria-hidden="true">
        <svg width="20" height="18" viewBox="0 0 20 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M10 16.5S1.5 11.5 1.5 6A4.2 4.2 0 0 1 10 4a4.2 4.2 0 0 1 8.5 2c0 5.5-8.5 10.5-8.5 10.5z"/></svg>
        <svg width="19" height="18" viewBox="0 0 19 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M17.5 8.5a7.5 7 0 0 1-11 6.2L1.5 16.5l1.6-4.4A7.5 7 0 1 1 17.5 8.5z"/></svg>
        <svg width="19" height="18" viewBox="0 0 19 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M17.5 1.5 1.5 8l6 2.5 2.5 6z"/></svg>
      </div>

    {:else}
      <p class="pt-6 pb-8 text-center text-3xl font-semibold text-bright tabular-nums" aria-hidden="true">{TIME}</p>
      <div class="mx-3 mb-24 rounded-2xl bg-surface-2 border border-border p-3.5">
        <div class="flex items-center gap-2.5 mb-1.5">
          <span class="w-7 h-7 rounded-lg bg-teal text-accent-ink grid place-items-center text-xs font-bold" aria-hidden="true">{initial}</span>
          <p class="flex-1 text-sm font-semibold text-bright" data-sender>{m.sender}</p>
          <span class="text-xs text-dim tabular-nums" aria-hidden="true">{TIME}</span>
        </div>
        <p class="text-base text-bright">{#each parts as p}{#if p.address}<span class="addr">{p.t}</span>{:else}{p.t}{/if}{/each}</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .bezel {
    background: rgb(var(--c-surface-2)); border: 1px solid rgb(var(--c-border)); border-radius: 44px;
    padding: 10px; box-shadow: var(--shadow); max-width: 400px; width: 100%; margin-inline: auto;
  }
  .screen { background: rgb(var(--c-surface)); border-radius: 34px; overflow: hidden; border: 1px solid rgb(var(--c-border)); }
  .avatar {
    width: 36px; height: 36px; border-radius: 999px; flex: none; display: grid; place-items: center;
    background: rgb(var(--c-teal-dim)); color: rgb(var(--c-teal-light)); font-weight: 700; font-size: var(--fs-sm);
  }
  .bubble {
    max-width: 88%; width: fit-content; padding: 10px 14px; border-radius: 20px 20px 20px 6px;
    background: rgb(var(--c-surface-2)); border: 1px solid rgb(var(--c-border)); overflow-wrap: anywhere;
  }
  .addr { color: rgb(var(--c-teal-light)); text-decoration: underline; text-underline-offset: 2px; overflow-wrap: anywhere; }
</style>
