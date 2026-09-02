<script lang="ts">
  import '../styles/app.css';
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import SetupPanel from '$lib/components/SetupPanel.svelte';
  import SharedSetupBar from '$lib/components/SharedSetupBar.svelte';

  let setupOpen = false;
  let setupButton: HTMLButtonElement;

  async function closeSetup() {
    setupOpen = false;
    await tick();
    setupButton?.focus();
  }

  let theme: 'light' | 'dark' = 'dark';

  onMount(() => {
    theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  });

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('spectra-theme', theme);
    } catch (e) {
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const channels = getComputedStyle(document.documentElement)
        .getPropertyValue('--c-void')
        .trim();
      if (channels) meta.setAttribute('content', `rgb(${channels})`);
    }
  }

  $: mode = browser ? $page.url.searchParams.get('mode') : null;
  $: pathname = browser ? $page.url.pathname : '/';

  $: isSubContext =
    pathname === '/resources' ||
    pathname === '/graph' ||
    pathname === '/playbook' ||
    (pathname.startsWith('/audit') && !!mode);

  $: isPlainAudit = pathname.startsWith('/audit') && !mode;

  $: isPlaybook = pathname.startsWith('/playbook');

  const modeLabels: Record<string, string> = {
    incident: 'Something happened',
    guardian: 'Family setup'
  };

  let menuOpen = false;
  $: if (pathname) menuOpen = false;

  $: links = [
    { href: '/audit',    label: 'Your list',          active: pathname.startsWith('/audit') },
    { href: '/tour',     label: 'Tour',               active: pathname.startsWith('/tour') },
    { href: '/incident', label: 'Something happened', active: pathname.startsWith('/incident') },
    { href: '/about',    label: 'About',              active: pathname === '/about' }
  ];
</script>

<nav class="no-print w-full border-b border-border bg-void/90 backdrop-blur-md sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

    <a href="/" class="flex items-center gap-3 group">
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true"
           class="text-amber-light group-hover:opacity-80 transition-opacity duration-200">
        <path d="M14 3.5a10.5 10.5 0 0 0 0 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M14 3.5a10.5 10.5 0 0 1 0 21" stroke="currentColor" stroke-width="2.4"
              stroke-linecap="round" stroke-dasharray="1 4.4" opacity="0.85"/>
      </svg>
      <span class="font-display text-bright font-semibold tracking-tight group-hover:text-white transition-colors duration-200">Spectra</span>
      <span class="label-mono opacity-70 hidden sm:inline text-[11px]">by fpszero</span>
    </a>

    <div class="flex items-center gap-1">

      <div class="hidden sm:flex items-center gap-0.5">
        {#each links as link}
          <a href={link.href}
             class="px-3 py-1.5 rounded-md text-sm font-sans transition-colors duration-200
                    {link.active
                      ? 'text-white bg-surface border border-border shadow-sm'
                      : 'text-dim hover:text-bright hover:bg-surface/50'}">
            {link.label}
          </a>
        {/each}
      </div>

      <button type="button"
        bind:this={setupButton}
        on:click={() => setupOpen ? closeSetup() : (setupOpen = true)}
        aria-expanded={setupOpen}
        class="ml-1 min-h-[44px] px-2.5 sm:px-3 flex-shrink-0 flex items-center gap-2 rounded border
               border-border text-dim hover:text-body hover:border-muted transition-colors duration-200">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
             stroke-width="1.4" stroke-linecap="round" aria-hidden="true">
          <circle cx="7" cy="4.2" r="2.2"/>
          <path d="M2.2 12.2a4.8 4.8 0 0 1 9.6 0"/>
        </svg>
        <span class="text-sm font-sans">Your setup</span>
      </button>

      <button type="button"
        class="ml-1 w-9 h-9 flex-shrink-0 flex items-center justify-center rounded border border-border
               text-dim hover:text-body hover:border-muted transition-colors duration-200"
        on:click={toggleTheme}
        aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}>
        {#if theme === 'light'}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
               stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12.2 8.6A5.6 5.6 0 0 1 5.4 1.8 5.6 5.6 0 1 0 12.2 8.6Z"/>
          </svg>
        {:else}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
               stroke-width="1.3" stroke-linecap="round">
            <circle cx="7" cy="7" r="2.7"/>
            <path d="M7 .9v1.3M7 11.8v1.3M.9 7h1.3M11.8 7h1.3M2.7 2.7l.9.9M10.4 10.4l.9.9M11.3 2.7l-.9.9M3.6 10.4l-.9.9"/>
          </svg>
        {/if}
      </button>

      <button type="button"
        class="sm:hidden w-9 h-9 flex items-center justify-center rounded border border-border
               text-dim hover:text-body hover:border-muted transition-colors duration-200"
        on:click={() => menuOpen = !menuOpen}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
        {#if menuOpen}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M2 2L12 12M12 2L2 12"/>
          </svg>
        {:else}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M1 3.5h12M1 7h12M1 10.5h12"/>
          </svg>
        {/if}
      </button>
    </div>
  </div>

  {#if menuOpen}
  <div class="sm:hidden border-t border-border/60 bg-void/98 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
      {#each links as link}
        <a href={link.href}
           on:click={() => menuOpen = false}
           class="px-3 py-2.5 rounded-md text-sm font-sans transition-colors duration-200
                  {link.active
                    ? 'text-white bg-surface border border-border'
                    : 'text-dim hover:text-bright hover:bg-surface/50'}">
          {link.label}
        </a>
      {/each}
    </div>
  </div>
  {/if}
</nav>

{#if setupOpen}
  <SetupPanel bind:open={setupOpen} onClose={closeSetup} />
{/if}

{#if isSubContext}
<div class="no-print w-full border-b border-border/40 bg-void/60 backdrop-blur-sm">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-9 flex items-center gap-3">
    <a href="/"
       class="flex items-center gap-1.5 text-sm text-dim hover:text-bright
              transition-colors duration-200 group">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round"
           class="group-hover:-translate-x-0.5 transition-transform duration-150">
        <path d="M6 1L2 5L6 9"/>
      </svg>
      Back to Home
    </a>

    <span class="text-border font-mono">·</span>

    {#if mode === 'incident'}
      <span class="text-sm text-red-light">{modeLabels['incident']}</span>
    {:else if mode === 'guardian'}
      <span class="text-sm text-teal-light">{modeLabels['guardian']}</span>
    {:else if pathname === '/resources'}
      <span class="text-sm text-dim">Guides</span>
    {:else if pathname === '/graph'}
      <span class="text-sm text-dim">Your map</span>
    {:else if pathname === '/playbook'}
      <span class="text-sm text-dim">Print</span>
    {/if}
  </div>
</div>
{/if}

{#if isPlainAudit}
<div class="no-print w-full border-b border-border/20 bg-transparent">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-8 flex items-center gap-2">
    <a href="/"
       class="flex items-center gap-1.5 text-sm text-muted hover:text-dim
              transition-colors duration-200 group">
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round"
           class="group-hover:-translate-x-0.5 transition-transform duration-150">
        <path d="M6 1L2 5L6 9"/>
      </svg>
      Home
    </a>
    <span class="text-border font-mono text-xs">·</span>
    <span class="text-sm text-muted">Your list</span>
  </div>
</div>
{/if}

{#if !isPlaybook}
  <SharedSetupBar />
{/if}

<main class="min-h-[calc(100vh-8rem)]">
  <slot />
</main>

<footer class="no-print border-t border-border mt-16">
  <div class="w-full bg-surface/60 border-b border-border/50 px-4 py-3 sm:py-2">
    <div class="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0 text-sm sm:text-sm text-muted text-center">
      <span>Educational purposes only. Not legal or professional security advice.
        <a href="/about#disclaimer" class="underline underline-offset-2 hover:text-dim transition-colors ml-1">Full disclaimer</a>
      </span>
      <span class="hidden sm:inline mx-2 text-border">·</span>
      <span>Your data never leaves your device</span>
      <span class="hidden sm:inline mx-2 text-border">·</span>
      <a href="https://github.com/KashishOO7/spectra" target="_blank" rel="noopener noreferrer"
         class="underline underline-offset-2 hover:text-dim transition-colors">Open source on GitHub</a>
    </div>
  </div>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
    <div class="flex items-center gap-3">
      <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true"
           class="text-amber-light opacity-70">
        <path d="M14 3.5a10.5 10.5 0 0 0 0 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M14 3.5a10.5 10.5 0 0 1 0 21" stroke="currentColor" stroke-width="2.6"
              stroke-linecap="round" stroke-dasharray="1 4.4" opacity="0.85"/>
      </svg>
      <span class="text-xs text-dim font-mono">Spectra v1.0.0 · AGPL-3.0 · CC BY-SA 4.0 (content)</span>
    </div>
    <div class="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted">
      <a href="/about#disclaimer" class="hover:text-body transition-colors duration-200 py-1 min-h-[24px] inline-flex items-center">Disclaimer</a>
      <a href="/about#privacy" class="hover:text-body transition-colors duration-200 py-1 min-h-[24px] inline-flex items-center">Privacy</a>
    </div>
  </div>
</footer>