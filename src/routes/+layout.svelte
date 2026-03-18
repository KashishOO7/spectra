<script lang="ts">
  import '../styles/app.css';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  export const params: Record<string, string> | undefined = undefined;

  $: mode = browser ? $page.url.searchParams.get('mode') : null;
  $: pathname = browser ? $page.url.pathname : '/';

  // Show contextual bar on sub-routes and mode views
  $: isSubContext =
    pathname === '/resources' ||
    pathname === '/graph' ||
    pathname === '/threats' ||
    (pathname.startsWith('/audit') && !!mode);

  // Show a subtle home breadcrumb on plain /audit
  $: isPlainAudit = pathname.startsWith('/audit') && !mode;

  const modeLabels: Record<string, string> = {
    incident: 'Incident Triage',
    guardian: 'Guardian Mode'
  };

  let menuOpen = false;
  // Auto-close mobile menu on route change
  $: if (pathname) menuOpen = false;

  $: links = [
    { href: '/audit',     label: 'Audit',      active: pathname.startsWith('/audit') },
    { href: '/resources', label: 'Resources',  active: pathname.startsWith('/resources') },
    { href: '/graph',     label: 'Threat Map', active: pathname.startsWith('/graph') },
    { href: '/threats',   label: 'Threats',    active: pathname.startsWith('/threats') },
    { href: '/timeline',  label: 'Timeline',   active: pathname.startsWith('/timeline') },
    { href: '/about',     label: 'About',      active: pathname === '/about' }
  ];
</script>

<!-- Main nav -->
<nav class="w-full border-b border-border bg-void/90 backdrop-blur-md sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

    <!-- Logo → always goes home -->
    <a href="/" class="flex items-center gap-3 group">
      <div class="w-7 h-7 rounded border border-amber/40 flex items-center justify-center
                  group-hover:border-amber/80 group-hover:shadow-[0_0_8px_rgba(212,134,42,0.2)]
                  transition-all duration-200">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="text-amber">
          <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="currentColor" stroke-width="1.2" fill="none"/>
          <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="0.8"/>
        </svg>
      </div>
      <span class="font-display text-bright font-semibold tracking-tight group-hover:text-white transition-colors duration-200">Spectra</span>
      <span class="label-mono opacity-40 hidden sm:inline text-[10px]">by fpszero</span>
    </a>

    <!-- Nav links desktop + hamburger trigger -->
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

        <a href="https://github.com/KashishOO7/spectra" target="_blank" rel="noopener noreferrer"
           class="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-sans
                  border border-border text-dim hover:text-bright hover:border-muted
                  transition-colors duration-200">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" class="opacity-70">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>

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

  <!-- Mobile menu panel — inside nav so it stays sticky with the bar -->
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
      <a href="https://github.com/KashishOO7/spectra" target="_blank" rel="noopener noreferrer"
         on:click={() => menuOpen = false}
         class="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-sans
                border border-border text-dim hover:text-bright hover:border-muted
                transition-colors duration-200">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" class="opacity-70">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        GitHub
      </a>
    </div>
  </div>
  {/if}
</nav>

<!-- Contextual bar: mode routes and sub-routes -->
<!-- Exit links point to / not /audit: /audit?mode=X → /audit is the same SvelteKit route,
     so onMount does not re-run and mode state persists. / forces a full route transition. -->
{#if isSubContext}
<div class="w-full border-b border-border/40 bg-void/60 backdrop-blur-sm">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-9 flex items-center gap-3">
    <a href="/"
       class="flex items-center gap-1.5 text-xs font-mono text-dim hover:text-bright
              transition-colors duration-200 group">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round"
           class="group-hover:-translate-x-0.5 transition-transform duration-150">
        <path d="M6 1L2 5L6 9"/>
      </svg>
      {#if mode === 'incident'}
        Exit Incident Triage
      {:else if mode === 'guardian'}
        Exit Guardian Mode
      {:else}
        Back to Home
      {/if}
    </a>

    <span class="text-border font-mono">·</span>

    {#if mode === 'incident'}
      <span class="text-xs font-mono text-red-light">{modeLabels['incident']}</span>
    {:else if mode === 'guardian'}
      <span class="text-xs font-mono text-teal-light">{modeLabels['guardian']}</span>
    {:else if pathname === '/resources'}
      <span class="text-xs font-mono text-dim">Tools &amp; Resources</span>
    {:else if pathname === '/graph'}
      <span class="text-xs font-mono text-dim">Threat Map</span>
    {:else if pathname === '/threats'}
      <span class="text-xs font-mono text-red-light">Threat Landscape</span>
    {/if}
  </div>
</div>
{/if}

<!-- Plain /audit breadcrumb -->
{#if isPlainAudit}
<div class="w-full border-b border-border/20 bg-transparent">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-8 flex items-center gap-2">
    <a href="/"
       class="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-dim
              transition-colors duration-200 group">
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round"
           class="group-hover:-translate-x-0.5 transition-transform duration-150">
        <path d="M6 1L2 5L6 9"/>
      </svg>
      Home
    </a>
    <span class="text-border font-mono text-xs">·</span>
    <span class="text-xs font-mono text-muted">Security Audit</span>
  </div>
</div>
{/if}

<main class="min-h-[calc(100vh-8rem)]">
  <slot />
</main>

<!-- Footer -->
<footer class="border-t border-border mt-16">
  <div class="w-full bg-surface/60 border-b border-border/50 px-4 py-3 sm:py-2">
    <div class="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0 text-xs sm:text-xs text-muted font-mono text-center">
      <span>Educational purposes only — not legal or professional security advice.
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
      <div class="w-5 h-5 rounded border border-amber/30 flex items-center justify-center">
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" class="text-amber opacity-70">
          <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="currentColor" stroke-width="1.2" fill="none"/>
        </svg>
      </div>
      <span class="text-xs text-dim font-mono">Spectra v0.1.0 · MIT (code) · CC BY-SA 4.0 (content)</span>
    </div>
    <div class="flex items-center gap-5 text-xs text-muted font-mono">
      <a href="/about#disclaimer" class="hover:text-body transition-colors duration-200">Disclaimer</a>
      <a href="/about#privacy" class="hover:text-body transition-colors duration-200">Privacy</a>
      <a href="https://github.com/KashishOO7/spectra" target="_blank" rel="noopener noreferrer"
         class="hover:text-body transition-colors duration-200">Contribute</a>
    </div>
  </div>
</footer>