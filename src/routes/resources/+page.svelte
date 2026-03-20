<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types.js';
  import type { Resource } from '$lib/types.js';
  import { loadProfile } from '$lib/engine/store.js';

  export let data: PageData;

  // Resources data
  $: resources = Object.values(data.graph.resources) as Resource[];

  // View toggle
  let activeTab: 'tools' | 'migration' = 'tools';

  // Profile (for "Your Setup" analysis)
  let userPlatforms: string[] = [];

  onMount(async () => {
    const profile = await loadProfile();
    userPlatforms = (profile?.platforms ?? []).filter((p: string) => p !== 'all');
  });

  // Migration paths
  interface MigrationPath {
    id: string;
    from: string;
    to: string;
    effort: string;
    gain: string;
    why: string;
    steps: string[];
  }

  const MIGRATION_PATHS: MigrationPath[] = [
    {
      id: 'google-auth',
      from: 'Google Authenticator',
      to: 'Aegis (Android) \u00b7 Raivo (iOS)',
      effort: '20 min',
      gain: 'Encrypted offline backups \u00b7 no Google account required \u00b7 open source \u00b7 audited',
      why: "Google Authenticator syncs codes to your Google account with no independently auditable encryption. Aegis stores codes in a local AES-256 encrypted file you control completely.",
      steps: [
        'Install Aegis from F-Droid (preferred) or Play Store',
        'In Google Authenticator: tap \u22ee \u2192 Transfer accounts \u2192 Export accounts',
        'In Aegis: tap + \u2192 Scan QR \u2014 or use the Aegis import feature to batch import',
        'Test each account: confirm the codes work before proceeding',
        'Once verified, delete accounts from Google Authenticator'
      ]
    },
    {
      id: 'authy',
      from: 'Authy',
      to: 'Aegis (Android)',
      effort: '30\u201360 min',
      gain: 'No Twilio cloud dependency \u00b7 no breach history \u00b7 fully local encrypted backup',
      why: "Authy stores your 2FA backup on Twilio servers. After their 2022 employee breach and 2024 phone number exposure (33M accounts), the cloud dependency is a liability worth removing.",
      steps: [
        'Authy does not offer a direct export \u2014 you will need to re-enrol each account individually',
        'Install Aegis first',
        "For each account: go to that service's security settings, disable 2FA, then re-enable it",
        'When re-enabling, scan the QR code with Aegis instead of Authy',
        'Do one account at a time \u2014 never disable 2FA on all accounts simultaneously'
      ]
    },
    {
      id: 'google-drive',
      from: 'Google Drive / Dropbox (unencrypted)',
      to: 'Proton Drive \u00b7 Filen.io (10\u00a0GB free)',
      effort: '30 min to migrate',
      gain: 'Zero-knowledge E2EE by default \u2014 provider cannot read your files even under legal compulsion',
      why: "Google Drive and Dropbox encrypt your files but hold the key. Legal demands, insider access, or breaches can expose everything. E2EE providers encrypt before upload \u2014 they store only ciphertext.",
      steps: [
        'Sign up at filen.io (10 GB free) or proton.me/drive (1 GB free, paid plans available)',
        'Download and install the desktop or mobile app',
        'Start with your most sensitive documents \u2014 drag and drop upload',
        'Update any shared links you have sent to others',
        'Optionally delete the originals from Google Drive / Dropbox once verified'
      ]
    },
    {
      id: 'sms-2fa',
      from: 'SMS two-factor authentication',
      to: 'TOTP authenticator app',
      effort: '20 min per account',
      gain: 'Immune to SIM swap \u00b7 no carrier dependency \u00b7 works offline',
      why: "SMS 2FA is vulnerable to SIM swap attacks where an attacker social-engineers your carrier into transferring your number. TOTP codes are generated locally, tied to your device \u2014 no phone number involved.",
      steps: [
        'First: install an authenticator app (Aegis on Android, Raivo on iOS)',
        'For each account: go to its security settings \u2192 two-factor authentication',
        'Switch from SMS to Authenticator app',
        'Scan the QR code with your app and enter the 6-digit code to confirm',
        'Disable SMS as a backup option where the service allows it'
      ]
    },
    {
      id: 'chrome',
      from: 'Chrome without uBlock Origin',
      to: 'Firefox + uBlock Origin',
      effort: '15 min',
      gain: 'Full uBlock Origin (Manifest V3 limits it on Chrome) \u00b7 better privacy defaults \u00b7 blocks malvertising',
      why: "Chrome's Manifest V3 limits what content blockers can intercept. Firefox supports the full uBlock Origin API, making it significantly more effective against trackers and malvertising.",
      steps: [
        'Download Firefox from mozilla.org',
        'Install uBlock Origin: addons.mozilla.org/en-US/firefox/addon/ublock-origin',
        'Import bookmarks: Firefox menu \u2192 Bookmarks \u2192 Import and Backup \u2192 Import from Chrome',
        'Sign in to Firefox Sync if you want passwords and history moved across devices',
        'Set Firefox as your default browser in system settings'
      ]
    }
  ];

  // "Your Setup" suggestions
  interface SetupSuggestion {
    platform: string;
    suggestion: string;
    migrationId?: string;
  }

  $: setupSuggestions = ((): SetupSuggestion[] => {
    if (userPlatforms.length === 0) return [];
    const s: SetupSuggestion[] = [];
    if (userPlatforms.includes('android')) {
      s.push({ platform: 'Android', suggestion: 'Switch to Aegis for 2FA \u2014 open source, encrypted, and audited.', migrationId: 'google-auth' });
    }
    if (userPlatforms.includes('ios')) {
      s.push({ platform: 'iOS', suggestion: 'Use Raivo OTP (App Store) for TOTP \u2014 open source and offline-only.' });
    }
    if (userPlatforms.includes('windows') || userPlatforms.includes('macos') || userPlatforms.includes('linux')) {
      s.push({ platform: 'Desktop', suggestion: 'Use KeePassXC for offline password management + TOTP in one tool.' });
    }
    if (userPlatforms.includes('web')) {
      s.push({ platform: 'Browser', suggestion: 'Install uBlock Origin on Firefox for full tracker and malvertising blocking.', migrationId: 'chrome' });
    }
    return s;
  })();

  // Filter state
  let filterPlatform = 'all';
  let filterCost     = 'all';
  let filterPosture  = 'all';
  let filterCategory = 'all';
  let searchQuery    = '';

  //  Derived filter options from actual data 
  $: allPlatforms = [...new Set(resources.flatMap((r: Resource) => r.platforms ?? []))].sort();
  $: allCategories = [...new Set(resources.flatMap((r: Resource) => r.categories_relevant ?? []))].sort();

  //  Filtered resources 
  $: filtered = resources.filter((r: Resource) => {
    if (r.status === 'discontinued') return false;
    if (filterPlatform !== 'all' && !(r.platforms ?? []).includes(filterPlatform as never)) return false;
    if (filterCost     !== 'all' && r.cost !== filterCost) return false;
    if (filterPosture  !== 'all' && r.privacy_posture !== filterPosture) return false;
    if (filterCategory !== 'all' && !(r.categories_relevant ?? []).includes(filterCategory as never)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const haystack = `${r.title} ${r.description} ${(r.tags ?? []).join(' ')}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  //  Helpers
  // Guard against javascript: URIs in YAML-sourced URL fields
  function safeHref(url: string): string {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
      return '#';
    } catch {
      return '#';
    }
  }

  function postureLabel(p: string) {
    return ({ privacy_first: 'Privacy First', neutral: 'Neutral', mixed: 'Mixed', avoid: 'Avoid' } as Record<string,string>)[p] ?? p;
  }
  function posturePill(p: string) {
    return ({ privacy_first: 'pill-teal', neutral: 'pill-dim', mixed: 'pill-amber', avoid: 'pill-red' } as Record<string,string>)[p] ?? 'pill-dim';
  }
  function costLabel(c: string) {
    return ({ free: 'Free', freemium: 'Freemium', paid: 'Paid', donation_supported: 'Donation' } as Record<string,string>)[c] ?? c;
  }
  function statusWarning(r: Resource): string | null {
    if (r.status === 'compromised') return '\u26a0 Security incident reported \u2014 use with caution.';
    if (r.status === 'acquired')    return `\u26a0 Ownership changed${r.acquired_by ? ' \u2192 ' + r.acquired_by : ''}. Verify trust posture.`;
    if (r.status === 'deprecated')  return '\u26a0 Deprecated \u2014 find an alternative.';
    return null;
  }

  function hasActiveFilter() {
    return filterPlatform !== 'all' || filterCost !== 'all' || filterPosture !== 'all' || filterCategory !== 'all' || searchQuery.trim().length > 0;
  }

  function resetFilters() {
    filterPlatform = 'all';
    filterCost     = 'all';
    filterPosture  = 'all';
    filterCategory = 'all';
    searchQuery    = '';
  }
</script>

<svelte:head>
  <title>Resources &mdash; Spectra</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">

  <div class="mb-8">
    <h1 class="font-display text-3xl font-bold text-white mb-2">Tools &amp; Resources</h1>
    <p class="text-body text-sm leading-relaxed max-w-2xl">
      Curated tools and guides &mdash; every entry rated for privacy posture, cost, and open-source status.
      No affiliate links. No sponsored placements.
    </p>
  </div>

  <div class="flex items-center gap-1 border border-border rounded-lg p-1 bg-surface mb-6 w-fit">
    <button type="button"
      on:click={() => activeTab = 'tools'}
      class="px-4 py-2 text-sm font-mono rounded-md transition-colors duration-150
             {activeTab === 'tools' ? 'bg-amber/20 text-amber-light' : 'text-dim hover:text-body'}">
      Tools &amp; Resources
    </button>
    <button type="button"
      on:click={() => activeTab = 'migration'}
      class="px-4 py-2 text-sm font-mono rounded-md transition-colors duration-150
             {activeTab === 'migration' ? 'bg-amber/20 text-amber-light' : 'text-dim hover:text-body'}">
      Migration Paths
    </button>
  </div>

  {#if activeTab === 'migration'}
  <div class="mb-6">

    {#if setupSuggestions.length > 0}
    <div class="panel p-4 mb-6 border-teal/20">
      <p class="label-mono text-teal-light mb-3">Based on your devices</p>
      <div class="space-y-2">
        {#each setupSuggestions as s}
          <div class="flex items-start gap-3">
            <span class="pill-teal text-xs flex-shrink-0">{s.platform}</span>
            <p class="text-sm text-body">{s.suggestion}
              {#if s.migrationId}
                <button type="button"
                  on:click={() => document.getElementById('migration-' + s.migrationId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  class="text-amber-light font-mono text-xs ml-1 hover:opacity-80">
                  See how &darr;
                </button>
              {/if}
            </p>
          </div>
        {/each}
      </div>
    </div>
    {/if}

    <div class="space-y-4">
      {#each MIGRATION_PATHS as path}
        <div id="migration-{path.id}" class="panel p-5">
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-sm font-mono text-red-light line-through">{path.from}</span>
              <span class="text-dim font-mono text-xs">&rarr;</span>
              <span class="text-sm font-mono text-teal-light">{path.to}</span>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
              <span class="pill-dim text-xs">&or; {path.effort}</span>
              <span class="text-xs font-mono text-body">{path.gain}</span>
            </div>
          </div>

          <div class="bg-void/40 border border-border/60 rounded-lg px-3 py-2 mb-4">
            <p class="text-xs text-dim font-mono leading-relaxed">{path.why}</p>
          </div>

          <p class="label-mono mb-3">How to migrate</p>
          <ol class="space-y-2.5">
            {#each path.steps as step, i}
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-5 h-5 rounded-full border border-amber/40 bg-amber-dim/20
                             flex items-center justify-center text-xs font-mono text-amber-light font-semibold">{i+1}</span>
                <p class="text-sm text-body leading-relaxed pt-0.5">{step}</p>
              </li>
            {/each}
          </ol>
        </div>
      {/each}
    </div>

  </div>

  {:else}

  <div class="flex flex-wrap gap-3 mb-6 panel p-3 items-center">
    <span class="label-mono">Privacy posture:</span>
    <span class="pill-teal">Privacy First &mdash; FOSS, no telemetry</span>
    <span class="pill-dim">Neutral &mdash; reputable, minor trade-offs</span>
    <span class="pill-amber">Mixed &mdash; useful but has caveats</span>
    <span class="pill-red">Avoid &mdash; listed to redirect, not recommend</span>
  </div>

  <div class="panel p-4 mb-6">
    <div class="flex flex-wrap gap-3 items-end">

      <div class="flex-1 min-w-[180px]">
        <label class="label-mono block mb-1" for="search-input">Search</label>
        <input id="search-input"
          bind:value={searchQuery}
          placeholder="Name, description, tag&hellip;"
          class="w-full px-3 py-2 bg-void border border-border rounded-lg text-sm text-body
                 placeholder-dim font-mono focus:outline-none focus:border-muted transition-colors"
        />
      </div>

      <div>
        <label class="label-mono block mb-1" for="filter-platform">Platform</label>
        <select id="filter-platform" bind:value={filterPlatform}
          class="px-3 py-2 bg-void border border-border rounded-lg text-sm text-body font-mono
                 focus:outline-none focus:border-muted transition-colors">
          <option value="all">All platforms</option>
          {#each allPlatforms as p}
            <option value={p}>{p}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="label-mono block mb-1" for="filter-cost">Cost</label>
        <select id="filter-cost" bind:value={filterCost}
          class="px-3 py-2 bg-void border border-border rounded-lg text-sm text-body font-mono
                 focus:outline-none focus:border-muted transition-colors">
          <option value="all">Any cost</option>
          <option value="free">Free</option>
          <option value="freemium">Freemium</option>
          <option value="paid">Paid</option>
          <option value="donation_supported">Donation</option>
        </select>
      </div>

      <div>
        <label class="label-mono block mb-1" for="filter-posture">Privacy</label>
        <select id="filter-posture" bind:value={filterPosture}
          class="px-3 py-2 bg-void border border-border rounded-lg text-sm text-body font-mono
                 focus:outline-none focus:border-muted transition-colors">
          <option value="all">Any posture</option>
          <option value="privacy_first">Privacy First</option>
          <option value="neutral">Neutral</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>

      {#if allCategories.length > 1}
      <div>
        <label class="label-mono block mb-1" for="filter-category">Category</label>
        <select id="filter-category" bind:value={filterCategory}
          class="px-3 py-2 bg-void border border-border rounded-lg text-sm text-body font-mono
                 focus:outline-none focus:border-muted transition-colors">
          <option value="all">All categories</option>
          {#each allCategories as c}
            <option value={c}>{c.replace(/_/g, ' ')}</option>
          {/each}
        </select>
      </div>
      {/if}

      {#if hasActiveFilter()}
        <button on:click={resetFilters}
          class="px-3 py-2 text-xs font-mono text-dim hover:text-body border border-border
                 rounded-lg transition-colors self-end">
          Clear filters &times;
        </button>
      {/if}

    </div>
  </div>

  <div class="flex items-center justify-between mb-4">
    <p class="label-mono">
      {filtered.length} resource{filtered.length !== 1 ? 's' : ''}
      {hasActiveFilter() ? '(filtered)' : ''}
    </p>
    <p class="text-xs text-dim font-mono">{resources.length} total in database</p>
  </div>

  {#if filtered.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
      {#each filtered as resource (resource.id)}
        {@const warning = statusWarning(resource)}
        <div class="panel flex flex-col transition-all duration-150 hover:border-muted
                    {resource.privacy_posture === 'privacy_first' ? 'border-teal/20' :
                     resource.privacy_posture === 'avoid' ? 'border-red/20' : ''}">

          <div class="p-4 flex-1">

            {#if warning}
              <div class="mb-3 text-xs text-amber-light font-mono border border-amber/20
                          rounded px-2 py-1.5 bg-amber-dim/20">
                {warning}
              </div>
            {/if}

            <div class="flex items-start justify-between gap-2 mb-2">
              <a href={safeHref(resource.url)} target="_blank" rel="noopener noreferrer"
                 class="font-display font-semibold text-bright text-sm leading-snug
                        hover:text-white transition-colors group">
                {resource.title}
                <span class="opacity-0 group-hover:opacity-60 text-xs ml-1">&nearr;</span>
              </a>
            </div>

            <div class="flex flex-wrap gap-1.5 mb-3">
              <span class="{posturePill(resource.privacy_posture)}">{postureLabel(resource.privacy_posture)}</span>
              <span class="pill-dim">{costLabel(resource.cost)}</span>
              {#if resource.open_source}
                <span class="pill-teal">Open Source</span>
              {/if}
              {#if (resource.security_audits ?? []).length > 0}
                <span class="pill-teal">Audited</span>
              {/if}
            </div>

            <p class="text-sm text-body leading-relaxed mb-3">{resource.description}</p>

            {#if resource.privacy_posture === 'mixed' || resource.privacy_posture === 'avoid'}
              {#if (resource.caveats ?? []).length > 0}
                <div class="border border-amber/20 rounded px-3 py-2 bg-amber-dim/10 mb-3">
                  <p class="label-mono text-amber mb-1">&or; Caveats</p>
                  <ul class="space-y-1">
                    {#each resource.caveats as caveat}
                      <li class="text-xs text-body leading-relaxed">&middot; {caveat}</li>
                    {/each}
                  </ul>
                </div>
              {/if}
            {/if}

            {#if (resource.platforms ?? []).length > 0}
              <div class="flex flex-wrap gap-1 mb-3">
                {#each (resource.platforms ?? []) as p}
                  <span class="pill-dim">{p}</span>
                {/each}
              </div>
            {/if}

            {#if (resource.endorsing_orgs ?? []).length > 0}
              <div class="flex flex-wrap gap-1 items-center">
                <span class="text-xs text-muted font-mono">Endorsed:</span>
                {#each (resource.endorsing_orgs ?? []) as org}
                  <span class="text-xs text-dim font-mono">{org}</span>
                {/each}
              </div>
            {/if}
          </div>

          <div class="px-4 py-3 border-t border-border flex items-center justify-between">
            <div class="flex items-center gap-3">
              {#if resource.open_source && resource.source_url}
                 <a href={safeHref(resource.source_url)} target="_blank" rel="noopener noreferrer"
                   class="text-xs text-dim font-mono hover:text-body transition-colors">
                  Source &nearr;
                 </a>
              {/if}
              {#if (resource.distribution ?? []).some(d => d.preferred)}
                {@const pref = (resource.distribution ?? []).find(d => d.preferred)}
                {#if pref}
                  <a href={safeHref(pref.url)} target="_blank" rel="noopener noreferrer"
                     class="text-xs text-dim font-mono hover:text-body transition-colors">
                    {pref.store} &nearr;
                  </a>
                {/if}
              {/if}
            </div>
            <a href={safeHref(resource.url)} target="_blank" rel="noopener noreferrer"
               class="text-xs font-mono text-teal-light hover:text-teal transition-colors">
              Visit &rarr;
            </a>
          </div>

        </div>
      {/each}
    </div>

  {:else if resources.length === 0}
    <div class="panel p-12 text-center mb-12">
      <p class="text-2xl mb-3">&#128230;</p>
      <p class="font-display text-bright font-semibold mb-2">Resources loading soon</p>
      <p class="text-sm text-body max-w-md mx-auto">
        The resource library is being curated. Each entry is manually verified for privacy posture
        and accuracy before it is added. Check back soon.
      </p>
    </div>

  {:else}
    <div class="panel p-10 text-center mb-12">
      <p class="text-dim font-mono text-sm mb-3">No resources match your filters.</p>
      <button on:click={resetFilters} class="btn-ghost text-xs">
        Clear all filters
      </button>
    </div>
  {/if}

  {/if}<div class="border border-border rounded-lg p-6 bg-surface/50 flex flex-col sm:flex-row
              items-start sm:items-center justify-between gap-4 mt-4">
    <div>
      <p class="font-display text-bright font-semibold mb-1">Know a resource that belongs here?</p>
      <p class="text-sm text-body">
        Every resource must pass a privacy posture review. If it has trade-offs, we list them.
        If it should be avoided, we list it anyway with a warning.
      </p>
    </div>
    <a href="https://github.com/KashishOO7/spectra/blob/main/CONTRIBUTING.md"
       target="_blank" rel="noopener noreferrer"
       class="btn-ghost flex-shrink-0 text-sm">
      Contribute &nearr;
    </a>
  </div>

  <p class="text-xs text-muted font-mono mt-6 text-center">
    Resource listings are for educational purposes only. Endorsement does not imply a commercial relationship.
    Privacy posture ratings reflect the framework assessment at the time of last verification.
  </p>

</div>