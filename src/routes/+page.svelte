<script lang="ts">
  import type { PageData } from './$types.js';
  export let data: PageData;
  const paths = [
    {
      id: 'assess',
      icon: '◈',
      label: 'Run Your Security Audit',
      sub: 'Free · Private · Takes about 20 minutes',
      desc: 'Answer three questions about your situation. Get a personalised, weighted checklist built around the threats that actually apply to you — not a generic 100-item wall.',
      href: '/audit',
      cta: 'Start Audit',
      accent: 'amber'
    },
    {
      id: 'incident',
      icon: '◎',
      label: 'Something Already Happened',
      sub: 'Immediate triage — no setup needed',
      desc: 'Account hacked, device stolen, suspicious link clicked, stalkerware suspected. Skip the questionnaire and get a step-by-step response playbook right now.',
      href: '/audit?mode=incident',
      cta: 'Start Triage',
      accent: 'red'
    },
    {
      id: 'resources',
      icon: '◉',
      label: 'Find the Right Tools',
      sub: 'Curated, privacy-rated, no dark patterns',
      desc: 'Every tool and guide rated for privacy posture, cost, and platform. If something has trade-offs, they\'re listed. If it\'s been audited, that\'s here too.',
      href: '/resources',
      cta: 'Browse',
      accent: 'teal'
    },
    {
      id: 'guardian',
      icon: '○',
      label: 'Protecting Someone Else',
      sub: 'Kids, teens, family members',
      desc: 'Guides for keeping children safer online, supporting women\'s digital safety, and helping non-technical people in your life without overwhelming them.',
      href: '/audit?mode=guardian',
      cta: 'Guardian Mode',
      accent: 'body'
    }
  ];

  const accentBorder: Record<string, string> = {
    amber: 'border-amber/25 hover:border-amber/55 hover:shadow-lg hover:shadow-amber/5',
    teal:  'border-teal/25 hover:border-teal/55 hover:shadow-lg hover:shadow-teal/5',
    red:   'border-red/25 hover:border-red/55 hover:shadow-lg hover:shadow-red/5',
    body:  'border-border hover:border-muted hover:shadow-lg hover:shadow-black/20'
  };

  const accentText: Record<string, string> = {
    amber: 'text-amber-light',
    teal:  'text-teal-light',
    red:   'text-red-light',
    body:  'text-body'
  };

  const accentDot: Record<string, string> = {
    amber: 'bg-amber',
    teal:  'bg-teal',
    red:   'bg-red',
    body:  'bg-muted'
  };

  const differentiators = [
    {
      icon: '⬡',
      title: 'Built around your actual threat model',
      body: 'Your security posture is scored against the adversaries that apply to you. A journalist and a parent have completely different risk profiles. This framework knows the difference.'
    },
    {
      icon: '◈',
      title: 'Human vulnerability is part of the audit',
      body: 'Most attacks succeed because of psychology, not technology. We\'re one of the few frameworks that audits your exposure to social engineering alongside your technical controls.'
    },
    {
      icon: '◉',
      title: 'First principles, not vendor relationships',
      body: 'Every recommendation is reasoned from scratch. Tools are privacy-rated. Trade-offs are mandatory reading. Nothing here is sponsored, affiliated, or promoted.'
    }
  ];
</script>

<svelte:head>
  <title>Spectra | Personal Security Self-Audit</title>
  <meta name="description" content="Know exactly how exposed you are. Open-source personal security audit framework. Threat-model driven, private by design, no account required."/>
</svelte:head>

<!-- Hero -->
<section class="bg-spectra-grid overflow-hidden">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-14 text-center relative">

    <!-- Ambient glow -->
    <div class="absolute inset-0 flex items-start justify-center pointer-events-none" aria-hidden="true">
      <div class="w-[600px] h-[300px] rounded-full bg-amber/[0.03] blur-3xl translate-y-12"></div>
    </div>

    <!-- Build badge -->
    <div class="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full
                border border-border bg-surface/80 text-xs font-mono text-dim backdrop-blur-sm">
      <span class="w-1.5 h-1.5 rounded-full bg-teal-light animate-pulse-slow"></span>
      v0.1 Beta · Built in public · Content updated {data.contentUpdated} · All data stays on your device
    </div>

    <h1 class="font-display text-4xl sm:text-[3.5rem] font-bold text-white mb-5 leading-[1.08] tracking-tight relative">
      Most people find out they<br class="hidden sm:block"/>
      were exposed <span class="text-gradient-amber">too late.</span>
    </h1>

    <p class="text-body text-lg sm:text-xl max-w-2xl mx-auto mb-3 leading-relaxed font-light">
      Spectra is a free, open-source personal security audit. Answer three questions about
      your situation — get a weighted checklist built around the risks that actually apply to you.
    </p>

    <p class="text-dim text-sm font-mono mb-12">
      No account. No server. No tracking. Everything lives in your browser.
    </p>

    <!-- Entry cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-3xl mx-auto relative">
      {#each paths as path}
        <a href={path.href}
           class="panel p-5 border transition-all duration-200 group cursor-pointer {accentBorder[path.accent]}">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <span class="w-2 h-2 rounded-full {accentDot[path.accent]} opacity-70 mt-0.5 flex-shrink-0"></span>
              <span class="text-xs font-mono {accentText[path.accent]} opacity-70">{path.sub}</span>
            </div>
            <span class="text-xs font-mono text-muted group-hover:text-dim transition-colors opacity-0 group-hover:opacity-100">
              {path.cta} →
            </span>
          </div>
          <h2 class="font-display text-bright font-semibold text-base mb-2 group-hover:text-white transition-colors">
            {path.label}
          </h2>
          <p class="text-sm text-dim leading-relaxed group-hover:text-body transition-colors">{path.desc}</p>
        </a>
      {/each}
    </div>
  </div>
</section>

<!-- Stats strip -->
<section class="border-y border-border bg-surface/30">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 py-7">
    <div class="flex flex-wrap gap-8 items-center justify-center sm:justify-between text-center">
      {#each [
        { value: String(data.itemCount),   label: 'Checklist items',   note: 'growing with each release' },
        { value: '10',    label: 'Adversary profiles', note: 'from bots to nation-states' },
        { value: '6',     label: 'Platforms covered',  note: 'Windows, macOS, Linux, Android, iOS, Web' },
        { value: '0',     label: 'Data collected',     note: 'by this site, ever' },
        { value: String(data.resourceCount), label: 'Curated resources',  note: 'tools, guides, and references' }
      ] as stat}
        <div class="min-w-[80px]">
          <div class="font-display text-2xl font-bold text-white">{stat.value}</div>
          <div class="text-xs text-dim font-mono mt-0.5">{stat.label}</div>
          <div class="text-xs text-muted mt-0.5 hidden sm:block">{stat.note}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- What makes this different -->
<section class="max-w-4xl mx-auto px-4 sm:px-6 py-16">
  <p class="label-mono text-center mb-2">Why Spectra exists</p>
  <p class="text-center text-dim text-sm font-mono mb-10 max-w-xl mx-auto">
    Most security checklists are generic, vendor-driven, or written for IT teams.
    This one is built for people.
  </p>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
    {#each differentiators as card}
      <div class="panel p-5 hover:border-muted transition-colors">
        <span class="text-amber text-lg mb-3 block opacity-70">{card.icon}</span>
        <h3 class="font-display text-bright font-semibold mb-2 text-[0.9rem] leading-snug">{card.title}</h3>
        <p class="text-sm text-dim leading-relaxed">{card.body}</p>
      </div>
    {/each}
  </div>
</section>

<!-- Community / open source strip -->
<section class="border-t border-border bg-surface/20">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
    <p class="label-mono mb-3">Open source · Community driven</p>
    <p class="text-body text-base max-w-xl mx-auto mb-6 leading-relaxed">
      Spectra is built in public. Content is reviewed by the community,
      sources are required, and trade-offs are always disclosed.
      If something's wrong or missing — contribute.
    </p>
    <div class="flex flex-wrap gap-3 justify-center">
      <a href="https://github.com/KashishOO7/spectra" target="_blank" rel="noopener noreferrer"
         class="btn-ghost text-sm gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="opacity-70">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        View on GitHub
      </a>
      <a href="https://github.com/KashishOO7/spectra/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer"
         class="btn-ghost text-sm">
        How to contribute →
      </a>
    </div>
  </div>
</section>