<script lang="ts">
  import '../styles/app.css';
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { arrived, leaving, start as startTrail } from '$lib/nav/trail.js';
  import BackLink from '$lib/components/BackLink.svelte';
  import SetupPanel from '$lib/components/SetupPanel.svelte';
  import SharedSetupBar from '$lib/components/SharedSetupBar.svelte';
  import chrome from '#spectra-wiki/page/header-and-footer';
  import { text, lines, links as noteLinks, link, items, labels } from '$lib/wiki/page.js';

  const nav = noteLinks(chrome, 'nav');
  const sideDoor = link(chrome, 'side-door');
  const [footerDisclaimer] = lines(chrome, 'footer-disclaimer');
  const footerSource = link(chrome, 'footer-source');
  const footerGroups = items(chrome, 'footer-groups').map(g => ({
    title: g.title,
    links: g.lines.map(line => {
      const [p] = line;
      if (line.length !== 1 || p.kind !== 'link') throw new Error(`wiki: footer-groups / "${g.title}" is read as a list of links`);
      return { text: p.value, href: p.href };
    })
  }));
  const footerFacts = labels(chrome, 'footer-facts', 4);

  let setupOpen = false;
  let opener: HTMLElement | null = null;

  function openSetup(e: MouseEvent) {
    if (setupOpen) { void closeSetup(); return; }
    opener = e.currentTarget as HTMLElement;
    setupOpen = true;
  }

  async function closeSetup() {
    setupOpen = false;
    await tick();
    opener?.focus();
  }

  let theme: 'light' | 'dark' = 'light';

  onMount(() => {
    theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  });

  if (browser) startTrail();
  beforeNavigate(() => leaving(window.scrollY));
  afterNavigate(nav => {
    if (!nav.to) return;
    arrived(nav.to.url.pathname + nav.to.url.search, nav.type, (nav as { delta?: number }).delta);
  });

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('spectra-theme', theme);
    } catch (e) {
    }
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme === 'dark' ? 'dark' : 'only light');
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
    incident: text(chrome, 'mode-incident'),
    guardian: text(chrome, 'mode-guardian')
  };

  $: links = [...nav, sideDoor].map(l => ({
    href: l.href,
    label: l.text,
    active: l.href === '/audit' ? pathname.startsWith('/audit') : pathname.startsWith(l.href)
  }));

  $: home = { href: '/', label: text(chrome, 'crumb-home'), active: pathname === '/' };
  $: onYou = pathname === '/you';
</script>

<header class="no-print w-full border-b border-border bg-void sticky top-0 z-50">
  <nav aria-label={text(chrome, 'nav-label')} class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

    <a href="/" class="flex items-center gap-2.5 min-h-[44px] rounded-xl group">
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true" class="text-teal">
        <path d="M14 3.5a10.5 10.5 0 0 0 0 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M14 3.5a10.5 10.5 0 0 1 0 21" stroke="currentColor" stroke-width="2.4"
              stroke-linecap="round" stroke-dasharray="1 4.4" opacity="0.85"/>
      </svg>
      <span class="text-lg font-bold text-bright">{text(chrome, 'brand')}</span>
      <span class="label-logotype hidden sm:inline">{text(chrome, 'brand-by')}</span>
    </a>

    <div class="flex items-center gap-1">
      <div class="hidden sm:flex items-center gap-1">
        {#each links as l}
          <a href={l.href}
             aria-current={l.active ? 'page' : undefined}
             class="px-4 min-h-[44px] inline-flex items-center rounded-full text-sm font-semibold transition-colors duration-150
                    {l.active ? 'text-bright bg-surface border border-border' : 'text-body hover:bg-surface border border-transparent'}">
            {l.label}
          </a>
        {/each}

        <button type="button"
          on:click={openSetup}
          aria-expanded={setupOpen}
          aria-current={onYou ? 'page' : undefined}
          class="ml-1 px-4 min-h-[44px] inline-flex items-center gap-2 rounded-full border bg-surface
                 text-sm font-semibold text-bright hover:border-teal transition-colors duration-150
                 {onYou ? 'border-teal' : 'border-muted'}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
               stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
            <circle cx="8" cy="5" r="2.6"/>
            <path d="M2.6 14a5.4 5.4 0 0 1 10.8 0"/>
          </svg>
          {text(chrome, 'your-setup')}
        </button>
      </div>

      <button type="button"
        class="ml-1 w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full border border-border
               text-body hover:border-teal transition-colors duration-150"
        on:click={toggleTheme}
        aria-label={theme === 'light' ? text(chrome, 'theme-to-dark') : text(chrome, 'theme-to-light')}
        title={theme === 'light' ? text(chrome, 'theme-to-dark') : text(chrome, 'theme-to-light')}>
        {#if theme === 'light'}
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor"
               stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12.2 8.6A5.6 5.6 0 0 1 5.4 1.8 5.6 5.6 0 1 0 12.2 8.6Z"/>
          </svg>
        {:else}
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor"
               stroke-width="1.3" stroke-linecap="round" aria-hidden="true">
            <circle cx="7" cy="7" r="2.7"/>
            <path d="M7 .9v1.3M7 11.8v1.3M.9 7h1.3M11.8 7h1.3M2.7 2.7l.9.9M10.4 10.4l.9.9M11.3 2.7l-.9.9M3.6 10.4l-.9.9"/>
          </svg>
        {/if}
      </button>
    </div>
  </nav>
</header>

<nav aria-label={text(chrome, 'nav-label')}
     class="no-print sm:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border"
     style="padding-bottom: env(safe-area-inset-bottom)">
  <ul class="grid grid-cols-4">
    {#each [home, ...links] as l, i}
      <li>
        <a href={l.href}
           aria-current={l.active ? 'page' : undefined}
           class="h-16 px-1 flex flex-col items-center justify-center gap-1 text-xs text-center leading-tight
                  {l.active ? 'text-teal-light font-semibold' : 'text-body'}">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            {#if i === 0}
              <path d="M3.5 10.5 12 4l8.5 6.5V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z"/>
            {:else if i === 1}
              <path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17"/>
            {:else}
              <circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16.2v.3"/>
            {/if}
          </svg>
          {l.label}
        </a>
      </li>
    {/each}
    <li>
      <button type="button"
        on:click={openSetup}
        aria-expanded={setupOpen}
        aria-current={onYou ? 'page' : undefined}
        class="w-full h-16 px-1 flex flex-col items-center justify-center gap-1 text-xs text-center leading-tight
               {setupOpen || onYou ? 'text-teal-light font-semibold' : 'text-body'}">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
             stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>
        </svg>
        {text(chrome, 'your-setup')}
      </button>
    </li>
  </ul>
</nav>

{#if setupOpen}
  <SetupPanel bind:open={setupOpen} onClose={closeSetup} />
{/if}

{#if isSubContext}
<div class="no-print w-full border-b border-border">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 min-h-[44px] flex items-center gap-3 text-sm">
    <BackLink parent={{ href: '/', name: text(chrome, 'crumb-home') }}
      class="block min-h-[44px] leading-[44px] max-w-[60vw] truncate text-body hover:text-bright transition-colors duration-150" />
    <span class="text-dim" aria-hidden="true">·</span>
    {#if mode === 'incident'}
      <span class="text-bright">{modeLabels['incident']}</span>
    {:else if mode === 'guardian'}
      <span class="text-teal-light">{modeLabels['guardian']}</span>
    {:else if pathname === '/resources'}
      <span class="text-dim">{text(chrome, 'context-guides')}</span>
    {:else if pathname === '/graph'}
      <span class="text-dim">{text(chrome, 'context-map')}</span>
    {:else if pathname === '/playbook'}
      <span class="text-dim">{text(chrome, 'context-print')}</span>
    {/if}
  </div>
</div>
{/if}

{#if isPlainAudit}
<div class="no-print w-full">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 min-h-[44px] flex items-center gap-2 text-sm">
    <BackLink parent={{ href: '/', name: text(chrome, 'crumb-home') }}
      class="block min-h-[44px] leading-[44px] max-w-[60vw] truncate text-body hover:text-bright transition-colors duration-150" />
    <span class="text-dim" aria-hidden="true">·</span>
    <span class="text-dim">{text(chrome, 'crumb-list')}</span>
  </div>
</div>
{/if}

{#if !isPlaybook}
  <SharedSetupBar />
{/if}

<main class="min-h-[calc(100vh-8rem)]">
  <slot />
</main>

<footer class="no-print pb-bar border-t border-border mt-16">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
    <div class="grid gap-x-10 gap-y-8 lg:grid-cols-12">
      <div class="lg:col-span-5" data-footer-col="brand">
        <a href="/" class="inline-flex items-center gap-2.5 min-h-[44px] -my-2.5">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true" class="text-teal">
            <path d="M14 3.5a10.5 10.5 0 0 0 0 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M14 3.5a10.5 10.5 0 0 1 0 21" stroke="currentColor" stroke-width="2.6"
                  stroke-linecap="round" stroke-dasharray="1 4.4" opacity="0.85"/>
          </svg>
          <span class="text-base font-bold text-bright">{text(chrome, 'brand')}</span>
        </a>
        <ul class="grid gap-y-3 gap-x-8 mt-5 sm:grid-cols-2 sm:max-w-[520px]" data-footer-facts>
          {#each footerFacts as title, i}
            <li class="flex items-center gap-2 text-sm font-medium text-bright">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
                   stroke-linecap="round" stroke-linejoin="round" class="text-teal shrink-0" aria-hidden="true">
                {#if i === 0}<path d="M5 4.5h11.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h11.5"/>
                {:else if i === 1}<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>
                {:else if i === 2}<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/>
                {:else}<path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5"/>{/if}
              </svg>
              {title}
            </li>
          {/each}
        </ul>
      </div>
      <div class="grid grid-cols-2 gap-x-6 gap-y-5 text-sm sm:grid-cols-3 lg:col-span-7 lg:gap-x-8" data-footer-col="pages">
        {#each footerGroups as g, gi}
          <div class={gi === 1 ? 'row-span-2 sm:row-span-1' : gi === 2 ? 'col-start-1 sm:col-start-auto' : ''}>
            <h2 class="text-sm font-semibold text-bright leading-6">{g.title}</h2>
            <ul class="mt-1 lg:mt-2">
              {#each g.links as l}
                <li><a href={l.href} class="min-h-[44px] lg:min-h-[32px] inline-flex items-center text-body hover:text-bright transition-colors duration-150">{l.text}</a></li>
              {/each}
              {#if gi === footerGroups.length - 1}
                <li><a href={footerSource.href} target="_blank" rel="noopener noreferrer"
                       class="link-inline hover:text-bright min-h-[44px] lg:min-h-[32px] inline-flex items-center whitespace-nowrap">{footerSource.text}</a></li>
              {/if}
            </ul>
          </div>
        {/each}
      </div>
    </div>
    <div class="mt-8 py-4 border-t border-border flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-6 text-sm text-dim" data-footer-fine>
      <p>{#each footerDisclaimer as p}{#if p.kind === 'link'}<a href={p.href} class="link-inline hover:text-bright ml-1">{p.value}</a>{:else}{p.value}{/if}{/each}</p>
      <p>{#each text(chrome, 'footer-licence').split(' · ') as part, i}{#if i}{' · '}{/if}<span class="whitespace-nowrap">{part}</span>{/each}</p>
    </div>
  </div>
</footer>
