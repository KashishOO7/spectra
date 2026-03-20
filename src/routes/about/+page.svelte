<script lang="ts">
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
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
  <h1 class="font-display text-3xl font-bold text-white mb-2">About Spectra</h1>
  <p class="text-dim font-mono text-sm mb-10">Open source · Educational · No commercial interests</p>

  <!-- TOC -->
  <nav class="panel p-4 mb-10 flex flex-wrap gap-x-4 gap-y-2">
    {#each sections as s}
      <a href="#{s.id}" class="text-sm text-dim hover:text-body font-mono transition-colors">{s.label}</a>
    {/each}
  </nav>

  <div class="space-y-12 prose-custom">

    <!-- What is Spectra -->
    <section id="what">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">What is Spectra?</h2>
      <p class="text-body leading-relaxed mb-3">
        Spectra is an open-source personal security self-audit framework built from first principles.
        It covers device security, account hygiene, physical safety, human vulnerability to social engineering,
        and AI-specific threats — in one place, personalized to your actual threat model.
      </p>
      <p class="text-body leading-relaxed mb-3">
        Most security checklists fail in two ways: they're generic (same advice for everyone) and they ignore
        the human layer (social engineering is responsible for most successful attacks, yet almost no personal
        security framework addresses it). Spectra addresses both.
      </p>
      <p class="text-body leading-relaxed">
        This is a community project. All content is curated from existing public resources, synthesized,
        and structured into a coherent framework. Sources are cited. Trade-offs are disclosed. Nothing
        is recommended because of a commercial relationship.
      </p>
    </section>

    <!-- Disclaimer -->
    <section id="disclaimer">
      <div class="border border-amber/30 rounded-lg p-5 bg-amber-dim/10">
        <h2 class="font-display text-xl font-semibold text-amber-light mb-4">⚠ Disclaimer</h2>
        <div class="space-y-3 text-body text-sm leading-relaxed">
          <p><strong class="text-bright">Educational purposes only.</strong> Spectra is not legal advice, professional security advice, medical advice, or any other form of professional advice. The framework is educational content aggregated and synthesized from publicly available sources.</p>
          <p><strong class="text-bright">No guarantees.</strong> Following the recommendations in this framework does not guarantee security against any specific threat. Security is probabilistic, not absolute. The authors make no representations about the effectiveness of any control for any specific individual's circumstances.</p>
          <p><strong class="text-bright">Jurisdiction varies.</strong> Security practices, encryption tools, and privacy technologies may be regulated differently in your jurisdiction. Information in this framework may not be appropriate for your location. Consult a qualified legal professional in your jurisdiction before implementing controls with potential legal implications.</p>
          <p><strong class="text-bright">No liability.</strong> The authors and contributors of Spectra assume no liability for outcomes resulting from use of or reliance on this framework. Use is entirely at your own risk.</p>
          <p><strong class="text-bright">Not a substitute for professional help.</strong> If you are experiencing an active security incident, targeted harassment, domestic abuse with a technology component, or believe you are under surveillance, please contact appropriate professional services — law enforcement, a qualified security professional, or an organization specializing in your situation.</p>
          <p><strong class="text-bright">Content is curated, not created.</strong> Spectra aggregates and links to existing public resources. We are not the authors of linked content and cannot guarantee its continued accuracy. External resources should be verified independently.</p>
        </div>
      </div>
    </section>

    <!-- Privacy Policy -->
    <section id="privacy">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Privacy Policy</h2>
      <p class="text-body leading-relaxed mb-3">
        A privacy framework that violated your privacy would be indefensible. Here is exactly what Spectra does and does not collect:
      </p>
      <div class="space-y-4">
        {#each [
          { label: 'Your assessment data', detail: 'Stored exclusively in your browser\'s IndexedDB. Never transmitted to any server. Never accessible to us or anyone else. Cleared when you clear your browser data.' },
          { label: 'Analytics', detail: 'None. No Google Analytics, no tracking pixels, no session recording. If we add privacy-respecting analytics in future (e.g., Plausible), we will update this page and announce it publicly.' },
          { label: 'Cookies', detail: 'None set by this site. Browser storage (IndexedDB) is used only for your assessment state.' },
          { label: 'External resources', detail: 'Clicking links to external sites takes you outside Spectra. Those sites have their own privacy policies. We link to them; we don\'t control them.' },
          { label: 'GitHub', detail: 'This site is hosted on GitHub Pages. GitHub\'s privacy policy applies to server-level data (IP addresses, request logs). We do not have access to this data.' },
          { label: 'Fonts', detail: 'Fonts are loaded from Google Fonts. This sends a request to Google\'s servers. If this is a concern for your threat model, use a browser extension to self-host fonts or block the request.' }
        ] as item}
          <div class="panel p-4">
            <div class="text-sm font-mono text-teal-light mb-1">{item.label}</div>
            <p class="text-sm text-body leading-relaxed">{item.detail}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Methodology -->
    <section id="methodology">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Methodology</h2>
      <p class="text-body leading-relaxed mb-3">
        Spectra's framework is built on a knowledge graph, not a flat checklist. Every item carries:
        the adversaries it's relevant against, the attack vectors it mitigates, the assets it protects,
        difficulty dimensions, and scoring weights calibrated by adversary type.
      </p>
      <p class="text-body leading-relaxed mb-3">
        The scoring engine applies threat model multipliers so that your checklist reflects your actual
        adversary profile. A journalist's high-priority items differ from a casual user's. The same
        framework, personalized by what you tell it about your situation.
      </p>
      <p class="text-body leading-relaxed mb-3">
        Psychology references: Cialdini's influence principles (urgency, authority, social proof, reciprocity,
        scarcity, liking) form the backbone of the human vulnerability assessment module. Kahneman's
        System 1/System 2 model informs how we frame the emotional triggers. BJ Fogg's behavior model
        informs how items are sequenced and motivated.
      </p>
      <p class="text-body leading-relaxed">
        OPSEC doctrine references: NIST SP 800-53, CIS Controls, EFF's Surveillance Self-Defense, and
        Privacy Guides provide the technical foundation. Community references include Michael Bazzell's
        OSINT work for footprint reduction methodology.
      </p>
    </section>

    <!-- FPS Zero -->
    <section id="fpszero">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">About FPS Zero</h2>
      <p class="text-body leading-relaxed mb-3">
        FPS Zero stands for First Principle Synthesis — building knowledge tools by reasoning from
        fundamentals rather than received wisdom. Spectra is one such tool.
      </p>
      <p class="text-body leading-relaxed">
        This is a personal project. Not a company. Not venture-backed. Not affiliated with any
        security vendor. Built because this framework needed to exist.
      </p>
    </section>

  </div>
</div>

<style>
  .prose-custom h2 { margin-top: 0; }
</style>