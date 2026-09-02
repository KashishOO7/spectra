<script lang="ts">
  import { onMount } from 'svelte';

  let disclaimerDetails: HTMLDetailsElement;

  onMount(() => {
    if (location.hash === '#disclaimer' && disclaimerDetails) disclaimerDetails.open = true;
  });

  const sections = [
    { id: 'what', label: 'What is Spectra' },
    { id: 'disclaimer', label: 'Disclaimer' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'methodology', label: 'Methodology' },
    { id: 'fpszero', label: 'About FPS Zero' }
  ];
</script>

<svelte:head>
  <title>About | Spectra</title>
  <meta name="description" content="What Spectra is, what it deliberately does not do, how your data is handled, and who builds it." />
  <link rel="canonical" href="https://spectra.fpszero.com/about" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Spectra" />
  <meta property="og:title" content="About | Spectra" />
  <meta property="og:description" content="What Spectra is, what it deliberately does not do, how your data is handled, and who builds it." />
  <meta property="og:url" content="https://spectra.fpszero.com/about" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="About | Spectra" />
  <meta name="twitter:description" content="What Spectra is, what it deliberately does not do, how your data is handled, and who builds it." />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
  <h1 class="font-display text-3xl font-bold text-white mb-2">About Spectra</h1>
  <p class="text-dim text-sm mb-10">Open source · Educational · No commercial interests</p>

  <nav class="panel p-4 mb-10 flex flex-wrap gap-x-4 gap-y-2">
    {#each sections as s}
      <a href="#{s.id}" class="text-sm text-dim hover:text-body transition-colors">{s.label}</a>
    {/each}
  </nav>

  <div class="space-y-12 prose-custom">

    <section id="what">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">What is Spectra?</h2>
      <p class="text-body leading-relaxed mb-3">
        Spectra works out which security steps matter most for you, and puts them in order.
      </p>
      <p class="text-body leading-relaxed mb-3">
        You tap what you are worried about. You get a short list, most useful first, covering your
        accounts, your devices, where you physically are, the ways people get talked into things,
        and what changes now that anyone can copy a voice. Tick off what you do. Nothing you enter
        leaves your browser: no account, no server, nothing recorded anywhere else.
      </p>
      <p class="text-body leading-relaxed mb-3">
        Most security advice is one list handed to everyone, and it usually stops at the technical
        layer. Being talked into it is where a lot of real harm starts, so here it is a category of
        its own rather than a footnote.
      </p>
      <p class="text-body leading-relaxed">
        Nobody pays to appear in Spectra. It names no product you have to go and get, because a
        recommendation that suits us is worth nothing to you. Claims are sourced, and where a source
        would not hold up we tell you what to check yourself instead.
      </p>
    </section>

    <section id="disclaimer">
      <div class="border border-amber/30 rounded-lg p-5 bg-amber-dim/10">
        <h2 class="font-display text-xl font-semibold text-amber-light mb-3">⚠ Disclaimer</h2>
        <p class="text-body leading-relaxed mb-3">
          Spectra is educational information, not professional advice, and following it guarantees
          nothing. If something is happening to you right now, contact people who can act: the
          police, a security professional, or an organisation that works on your situation.
        </p>
        <details bind:this={disclaimerDetails}>
          <summary class="cursor-pointer text-sm text-amber-light hover:opacity-80 py-1">
            Read the full disclaimer
          </summary>
          <div class="space-y-3 text-body text-sm leading-relaxed mt-3">
          <p><strong class="text-bright">Educational purposes only.</strong> Spectra is not legal advice, professional security advice, medical advice, or any other form of professional advice. Spectra is educational content aggregated and synthesized from publicly available sources.</p>
          <p><strong class="text-bright">No guarantees.</strong> Following the steps in Spectra does not guarantee security against any specific threat. Security is probabilistic, not absolute. The authors make no representations about the effectiveness of any control for any specific individual's circumstances.</p>
          <p><strong class="text-bright">Jurisdiction varies.</strong> Security practices, encryption tools, and privacy technologies may be regulated differently in your jurisdiction. Information here may not be appropriate for your location. Consult a qualified legal professional in your jurisdiction before implementing controls with potential legal implications.</p>
          <p><strong class="text-bright">No liability.</strong> The authors and contributors of Spectra assume no liability for outcomes resulting from use of or reliance on Spectra. Use is entirely at your own risk.</p>
          <p><strong class="text-bright">Not a substitute for professional help.</strong> If you are experiencing an active security incident, targeted harassment, domestic abuse with a technology component, or believe you are under surveillance, please contact appropriate professional services: law enforcement, a qualified security professional, or an organisation specialising in your situation.</p>
          <p><strong class="text-bright">Content is curated, not created.</strong> Spectra aggregates and links to existing public resources. We are not the authors of linked content and cannot guarantee its continued accuracy. External resources should be verified independently.</p>
          </div>
        </details>
      </div>
    </section>

    <section id="privacy">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Privacy Policy</h2>
      <p class="text-body leading-relaxed mb-3">
        A privacy tool that violated your privacy would be indefensible. Here is exactly what Spectra does and does not collect:
      </p>
      <div class="space-y-4">
        {#each [
          { label: 'Your assessment data', detail: 'Stored exclusively in your browser\'s IndexedDB. Never transmitted to any server. Never accessible to us or anyone else. Cleared when you clear your browser data.' },
          { label: 'Analytics', detail: 'None. No Google Analytics, no tracking pixels, no session recording. If we add privacy-respecting analytics in future (e.g., Plausible), we will update this page and announce it publicly.' },
          { label: 'Cookies', detail: 'None set by this site. Browser storage (IndexedDB) is used only for your assessment state.' },
          { label: 'External resources', detail: 'Clicking links to external sites takes you outside Spectra. Those sites have their own privacy policies. We link to them; we don\'t control them.' },
          { label: 'GitHub', detail: 'This site is hosted on GitHub Pages. GitHub\'s privacy policy applies to server-level data (IP addresses, request logs). We do not have access to this data.' },
          { label: 'Fonts', detail: 'Fonts are loaded from Google Fonts. This sends a request to Google\'s servers. If this is a concern for your setup, use a browser extension to self-host fonts or block the request.' }
        ] as item}
          <div class="panel p-4">
            <div class="text-sm font-medium text-teal-light mb-1">{item.label}</div>
            <p class="text-sm text-body leading-relaxed">{item.detail}</p>
          </div>
        {/each}
      </div>
    </section>

    <section id="methodology">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Methodology</h2>
      <p class="text-body leading-relaxed mb-3">
        How the ordering actually works, formula included, is on
        <a href="/methodology" class="text-amber-light hover:underline">Under the hood</a>.
      </p>
      <p class="text-body leading-relaxed mb-3">
        Psychology references: Cialdini's influence principles (urgency, authority, social proof, reciprocity,
        scarcity, liking) form the backbone of the human vulnerability assessment module. Kahneman's
        System 1/System 2 model informs how we frame the emotional triggers. BJ Fogg's behavior model
        informs how items are sequenced and motivated.
      </p>
      <p class="text-body leading-relaxed mb-5">
        Security practice references: NIST SP 800-53, CIS Controls, EFF's Surveillance Self-Defense,
        and Privacy Guides provide the technical foundation. Community references include Michael
        Bazzell's work on reducing what can be found out about a person.
      </p>
      <div class="flex flex-col sm:flex-row gap-3">
        <a href="/how-it-works" class="btn-ghost">
          How Spectra works
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 1L8 5L4 9"/></svg>
        </a>
        <a href="/methodology" class="btn-ghost">
          Under the hood
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 1L8 5L4 9"/></svg>
        </a>
      </div>
    </section>

    <section id="fpszero">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">About FPS Zero</h2>
      <p class="text-body leading-relaxed mb-3">
        FPS Zero stands for First Principle Synthesis. Building knowledge tools by reasoning from
        fundamentals rather than received wisdom. Spectra is one such tool.
      </p>
      <p class="text-body leading-relaxed">
        This is a personal project. Not a company. Not venture-backed. Not affiliated with any
        security vendor. Built because it needed to exist.
      </p>
    </section>

  </div>
</div>

<style>
  .prose-custom h2 { margin-top: 0; }
</style>