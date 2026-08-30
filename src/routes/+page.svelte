<script lang="ts">
  import { onMount } from 'svelte';
  import type { Harm } from '$lib/types.js';
  import { HARMS } from '$lib/audit/constants.js';
  import { goto } from '$app/navigation';
  import { loadProfile, saveProfile, createDefaultProfile } from '$lib/engine/store.js';

  const harms = Object.keys(HARMS) as Harm[];

  let selected: Harm[] = [];
  let starting = false;

  function toggle(harm: Harm) {
    selected = selected.includes(harm)
      ? selected.filter(h => h !== harm)
      : [...selected, harm];
  }

  onMount(async () => {
    try {
      const profile = await loadProfile();
      if (profile?.harms?.length) selected = [...profile.harms];
    } catch {
    }
  });

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

<svelte:head>
  <title>Spectra | Personal Security Self-Audit</title>
  <meta name="description" content="A free personal security audit that weights every step to your own situation. No account, no server, and nothing leaves your browser." />
  <link rel="canonical" href="https://spectra.fpszero.com/" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Spectra" />
  <meta property="og:title" content="Spectra | Personal Security Self-Audit" />
  <meta property="og:description" content="A free personal security audit that weights every step to your own situation. No account, no server, and nothing leaves your browser." />
  <meta property="og:url" content="https://spectra.fpszero.com/" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Spectra | Personal Security Self-Audit" />
  <meta name="twitter:description" content="A free personal security audit that weights every step to your own situation. No account, no server, and nothing leaves your browser." />
</svelte:head>

<section class="bg-spectra-grid overflow-hidden">
  <div class="max-w-2xl mx-auto px-4 sm:px-6 pt-12 pb-14 relative">

    <div class="absolute inset-0 flex items-start justify-center pointer-events-none" aria-hidden="true">
      <div class="w-[600px] h-[300px] rounded-full bg-amber/[0.03] blur-3xl translate-y-12"></div>
    </div>

    <div class="text-center relative pt-2">
      <h1 class="font-display text-[2rem] sm:text-[2.75rem] font-bold text-white mb-4 leading-[1.12] tracking-tight">
        What are you worried might happen?
      </h1>

      <p class="text-body text-base sm:text-lg max-w-xl mx-auto mb-9 leading-relaxed font-light">
        Tap anything below. You get a short list of what to do. Plain steps, no signup, and
        nothing leaves this browser.
      </p>
    </div>
    <ul class="relative mb-9 space-y-2">
      {#each harms as harm}
        {@const isOn = selected.includes(harm)}
        <li>
          <button type="button"
            aria-pressed={isOn}
            on:click={() => toggle(harm)}
            class="w-full min-h-[56px] text-left px-4 py-3.5 rounded-xl border flex items-center gap-3.5
                   transition-all duration-150 group
                   {isOn
                     ? 'border-amber/60 bg-amber-dim/15 shadow-sm shadow-amber/5'
                     : 'border-border bg-surface hover:border-muted hover:bg-surface/80'}">
            <span class="flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center" aria-hidden="true">
              {#if isOn}
                <svg width="18" height="18" viewBox="0 0 14 14" fill="none" class="text-amber">
                  <circle cx="7" cy="7" r="6" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M4 7L6 9L10 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              {:else}
                <span class="w-[15px] h-[15px] rounded-full border border-muted block group-hover:border-dim transition-colors"></span>
              {/if}
            </span>
            <span class="font-sans text-[15px] sm:text-base leading-snug
                         {isOn ? 'text-white font-medium' : 'text-bright'}">{harm}</span>
          </button>
        </li>
      {/each}
    </ul>

    <div class="relative text-center">
      <a href="/audit" on:click={start} class="btn-primary inline-block mb-3">
        Show me what to do
      </a>

      <p class="text-[13px] text-dim mb-4">
        No account. Nothing you tapped left this browser.
      </p>

      <p class="text-[13px] mb-3">
        <a href="/audit" class="text-dim hover:text-body transition-colors">
          Not sure? Skip this and see the basics &rarr;
        </a>
      </p>

      <p class="text-[13px] flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <a href="/how-it-works"
           class="text-dim hover:text-body transition-colors py-1 min-h-[24px] inline-flex items-center">
          How Spectra works
        </a>
        <a href="/methodology"
           class="text-muted hover:text-body transition-colors py-1 min-h-[24px] inline-flex items-center">
          Under the hood
        </a>
      </p>
    </div>
  </div>
</section>

<section class="border-t border-border">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
      <a href="/incident"
         class="panel p-5 border transition-all duration-200 group cursor-pointer
                border-red/25 hover:border-red/55 hover:shadow-lg hover:shadow-red/5">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full bg-red opacity-70 mt-0.5 flex-shrink-0"></span>
            <span class="text-[13px] text-red-light opacity-70">Immediate triage, no setup needed</span>
          </div>
        </div>
        <h2 class="font-display text-bright font-semibold text-base mb-2 group-hover:text-white transition-colors">
          Something already happened
        </h2>
        <p class="text-sm text-dim leading-relaxed group-hover:text-body transition-colors">
          Hacked, stolen, or something feels wrong? Start here.
        </p>
      </a>

      <a href="/resources"
         class="panel p-5 border transition-all duration-200 group cursor-pointer
                border-teal/25 hover:border-teal/55 hover:shadow-lg hover:shadow-teal/5">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full bg-teal opacity-70 mt-0.5 flex-shrink-0"></span>
            <span class="text-[13px] text-teal-light opacity-70">No apps named, no affiliate links</span>
          </div>
        </div>
        <h2 class="font-display text-bright font-semibold text-base mb-2 group-hover:text-white transition-colors">
          Where our steps send you
        </h2>
        <p class="text-sm text-dim leading-relaxed group-hover:text-body transition-colors">
          The maintained guides our steps reference, kept current by people who track this full time.
        </p>
      </a>

      <a href="/audit?mode=guardian"
         class="panel p-5 border transition-all duration-200 group cursor-pointer
                border-border hover:border-muted hover:shadow-lg hover:shadow-black/20">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full bg-muted opacity-70 mt-0.5 flex-shrink-0"></span>
            <span class="text-[13px] text-body opacity-70">Kids, teens, family members</span>
          </div>
        </div>
        <h2 class="font-display text-bright font-semibold text-base mb-2 group-hover:text-white transition-colors">
          Setting this up for someone else
        </h2>
        <p class="text-sm text-dim leading-relaxed group-hover:text-body transition-colors">
          A kid's first phone, a parent, a friend.
        </p>
      </a>
    </div>
  </div>
</section>
