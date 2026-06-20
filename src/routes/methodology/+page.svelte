<script lang="ts">
  const sections = [
    { id: 'formula', label: 'The formula' },
    { id: 'base-weight', label: 'Base weight' },
    { id: 'threat', label: 'Threat multiplier' },
    { id: 'other', label: 'Other multipliers' },
    { id: 'maturity', label: 'Maturity levels' },
    { id: 'limits', label: 'Honest limitations' }
  ];

  // base_weight rubric scales
  const impactScale = [
    { n: 1, label: 'Minor / cosmetic' },
    { n: 2, label: 'Limited data exposure' },
    { n: 3, label: 'Account or device compromise' },
    { n: 4, label: 'Financial loss / identity theft' },
    { n: 5, label: 'Physical-safety or catastrophic, irreversible harm' }
  ];
  const prevalenceScale = [
    { n: 1, label: 'Rare / theoretical' },
    { n: 2, label: 'Occasional, targeted' },
    { n: 3, label: 'Common' },
    { n: 4, label: 'Very common' },
    { n: 5, label: 'Near-universal / automated at scale' }
  ];

  const workedExamples = [
    {
      id: 'auth-2fa-001',
      math: 'weight 9.5',
      note: 'High impact (account takeover cascades) × very high prevalence (credential attacks are the dominant breach vector) — near the top of the scale.'
    },
    {
      id: 'net-vpn-001',
      math: 'weight 7.5',
      note: 'Moderate impact (network exposure), common but largely mitigated by HTTPS — upper-mid and situational.'
    },
    {
      id: 'womens-stalkerware-001',
      math: 'weight 9.0',
      note: 'Maximum impact (physical safety) sets a high base, then the intimate-partner threat multiplier (below) elevates it further.'
    }
  ];

  const relevanceScale = [
    { range: '0.1 – 0.3', meaning: 'Control is largely irrelevant to this adversary' },
    { range: '0.8 – 1.0', meaning: 'Baseline relevance' },
    { range: '1.2 – 1.5', meaning: 'Elevated — this adversary actively uses the attack this control blocks' },
    { range: '1.6 – 2.0', meaning: 'This adversary is the reason the control exists' }
  ];

  const otherMultipliers = [
    {
      name: 'landscape_multiplier',
      range: '1.1 – 1.5',
      detail: 'A curated, expiring real-world event (e.g. "SMS 2FA bypass automated") temporarily elevates affected items. Hand-curated, source-backed, capped at 4 active events to prevent alert fatigue. Not a live feed — durability over timeliness.'
    },
    {
      name: 'compensating_factor',
      range: '0 – 1',
      detail: 'If you have already implemented a stronger control, the urgency of a weaker alternative drops by its documented urgency_reduction. Asymmetric, modelled per item.'
    },
    {
      name: 'staleness_multiplier',
      range: '1.0 / 0.9 / 0.75 / 0.5',
      detail: 'Banded at <6 / 6–12 / 12–18 / >18 months since the guidance was last verified. A trust/freshness signal, not a risk metric: stale guidance counts for less until re-verified.'
    }
  ];

  const maturityMap = [
    { spectra: 'L1 Essential / L2 Baseline', ig: 'IG1', meaning: 'Basic cyber hygiene everyone needs' },
    { spectra: 'L3 Hardened', ig: 'IG2', meaning: 'Elevated-risk individuals' },
    { spectra: 'L4 Advanced / L5 Expert', ig: 'IG3', meaning: 'High-threat / specialist' }
  ];

  const limitations = [
    'The rubric makes every number justifiable and consistent, but impact and prevalence are still expert judgement anchored to public data — not a calibrated probabilistic model. The output is a sound relative priority, not an absolute risk percentage.',
    'The overall score weights categories equally (a 1-item category counts like a 6-item one). This is intentional — it rewards breadth across security domains — but it is a design choice.',
    'The threat multiplier uses the maximum across your selected adversaries (conservative, worst-case-relevant), not an additive or probabilistic combination.'
  ];
</script>

<svelte:head>
  <title>Methodology | Spectra</title>
  <meta name="description" content="How Spectra turns a checklist into a personalised, defensible priority order — the formula, the scoring rubric, and the standards it maps to." />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
  <p class="label-mono mb-3">Methodology</p>
  <h1 class="font-display text-3xl font-bold text-white mb-3">How Spectra scores</h1>
  <p class="text-body leading-relaxed mb-2">
    Spectra is a <strong class="text-bright">prioritisation engine</strong>, not a calibrated risk
    calculator. Its job is to answer "what should <em>I</em> do next?" for <em>your</em> threat model.
    Every number is driven by a documented rubric and mapped to recognised standards, so the scoring
    is auditable rather than arbitrary.
  </p>
  <p class="text-dim font-mono text-sm mb-10">
    Spirit of NIST SP 800-30 · CVSS-style environmental scoring · bespoke, but never hand-waved
  </p>

  <!-- TOC -->
  <nav class="panel p-4 mb-10 flex flex-wrap gap-x-4 gap-y-2">
    {#each sections as s}
      <a href="#{s.id}" class="text-sm text-dim hover:text-body font-mono transition-colors">{s.label}</a>
    {/each}
  </nav>

  <div class="space-y-12">

    <!-- The formula -->
    <section id="formula">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">The formula</h2>
      <p class="text-body leading-relaxed mb-4">
        For each checklist item, Spectra computes an <strong class="text-bright">effective score</strong>
        — its priority <em>for you</em>, right now:
      </p>
      <div class="panel p-5 mb-4 font-mono text-sm leading-relaxed overflow-x-auto">
        <div class="text-amber-light">effective_score = base_weight</div>
        <div class="text-body pl-[7.5rem] -indent-[1rem]">× threat_multiplier <span class="text-muted">(your adversaries)</span></div>
        <div class="text-body pl-[7.5rem] -indent-[1rem]">× landscape_multiplier <span class="text-muted">(active real-world events)</span></div>
        <div class="text-body pl-[7.5rem] -indent-[1rem]">× (1 − compensating_factor) <span class="text-muted">(a stronger control you have)</span></div>
        <div class="text-body pl-[7.5rem] -indent-[1rem]">× staleness_multiplier <span class="text-muted">(how recently it was verified)</span></div>
      </div>
      <ul class="space-y-1.5 text-sm text-body leading-relaxed list-disc pl-5">
        <li><strong class="text-bright">Per-category score</strong> = earned ÷ available effective_score (saturation %, 0–100).</li>
        <li><strong class="text-bright">Overall score</strong> = mean of category percentages.</li>
        <li><strong class="text-bright">Maturity</strong> = banded (≤20 L1 · ≤40 L2 · ≤65 L3 · ≤85 L4 · ≤100 L5).</li>
      </ul>
    </section>

    <!-- base_weight -->
    <section id="base-weight">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Base weight — the rubric</h2>
      <p class="text-body leading-relaxed mb-6">
        Each item's <code class="text-amber-light font-mono text-sm">score_weight</code> (0–10) is set by
        expert judgement along two axes — <strong class="text-bright">impact</strong> and
        <strong class="text-bright">prevalence</strong>. The rubric below is the guide reviewers use to
        keep those weights consistent and defensible. It is principled estimation anchored to public
        data, not a number produced by a mechanical formula.
      </p>

      <p class="label-mono mb-2">Impact (1–5) — severity if the threat succeeds</p>
      <div class="space-y-1.5 mb-6">
        {#each impactScale as row}
          <div class="flex gap-3 items-baseline">
            <span class="font-mono text-sm text-amber w-5 shrink-0 text-right">{row.n}</span>
            <span class="text-sm text-body">{row.label}</span>
          </div>
        {/each}
      </div>

      <p class="label-mono mb-2">Prevalence (1–5) — how common the attack is</p>
      <p class="text-xs text-dim mb-2 font-mono">anchored to Verizon DBIR · FBI IC3 · Have I Been Pwned</p>
      <div class="space-y-1.5 mb-6">
        {#each prevalenceScale as row}
          <div class="flex gap-3 items-baseline">
            <span class="font-mono text-sm text-teal-light w-5 shrink-0 text-right">{row.n}</span>
            <span class="text-sm text-body">{row.label}</span>
          </div>
        {/each}
      </div>

      <p class="label-mono mb-3">How the rubric reads a few items</p>
      <div class="space-y-3">
        {#each workedExamples as ex}
          <div class="panel p-4">
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
              <code class="font-mono text-sm text-bright">{ex.id}</code>
              <span class="font-mono text-xs text-amber-light">{ex.math}</span>
            </div>
            <p class="text-sm text-body leading-relaxed">{ex.note}</p>
          </div>
        {/each}
      </div>
      <p class="text-sm text-dim leading-relaxed mt-4">
        <code class="font-mono text-xs text-dim">score_weight</code> and the threat multipliers are
        protected fields — changes require maintainer review (CODEOWNERS), so the priority order can't be
        quietly skewed. Tightening every weight to the rubric above and recording a per-item rationale is
        ongoing calibration work.
      </p>
    </section>

    <!-- threat_multiplier -->
    <section id="threat">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Threat multiplier — per-adversary relevance</h2>
      <p class="text-body leading-relaxed mb-4">
        Each item carries multipliers keyed by adversary. The engine takes the
        <strong class="text-bright">maximum</strong> across the adversaries you selected
        (worst-case-relevant). This is why a survivor and a casual user get very different orderings —
        the core differentiator of Spectra.
      </p>
      <div class="space-y-1.5 mb-6">
        {#each relevanceScale as row}
          <div class="flex gap-3 items-baseline">
            <span class="font-mono text-sm text-amber-light w-20 shrink-0">{row.range}</span>
            <span class="text-sm text-body">{row.meaning}</span>
          </div>
        {/each}
      </div>
      <div class="border-l-2 border-border pl-4">
        <p class="label-mono mb-2">Social-engineering weight</p>
        <p class="text-sm text-body leading-relaxed">
          For human-vulnerability items, the SE quiz maps your answers to a susceptibility score per
          Cialdini register; <code class="font-mono text-xs text-amber-light">seWeight = 0.8 + score/100 × 0.6</code>
          (range 0.8–1.4). Grounded in Cialdini's principles of influence.
        </p>
      </div>
    </section>

    <!-- other multipliers -->
    <section id="other">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">The other multipliers</h2>
      <div class="space-y-3">
        {#each otherMultipliers as m}
          <div class="panel p-4">
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
              <code class="font-mono text-sm text-teal-light">{m.name}</code>
              <span class="font-mono text-xs text-dim">{m.range}</span>
            </div>
            <p class="text-sm text-body leading-relaxed">{m.detail}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- maturity -->
    <section id="maturity">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Maturity levels ↔ CIS Implementation Groups</h2>
      <p class="text-body leading-relaxed mb-4">
        Spectra's five maturity levels map to the CIS Implementation Groups, giving the levels a
        recognised meaning rather than a private scale:
      </p>
      <div class="space-y-2">
        {#each maturityMap as row}
          <div class="panel p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span class="font-mono text-sm text-bright sm:w-56 shrink-0">{row.spectra}</span>
            <span class="pill-amber shrink-0 self-start sm:self-center">{row.ig}</span>
            <span class="text-sm text-body">{row.meaning}</span>
          </div>
        {/each}
      </div>
    </section>

    <!-- limitations -->
    <section id="limits">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Honest limitations</h2>
      <div class="border border-amber/30 rounded-lg p-5 bg-amber-dim/10 space-y-3">
        {#each limitations as l}
          <p class="text-sm text-body leading-relaxed">{l}</p>
        {/each}
        <p class="text-sm text-body leading-relaxed pt-1">
          Spectra is an educational prioritisation tool. It is honest about being
          <strong class="text-amber-light">principled estimation</strong> rather than validated
          quantitative risk scoring — the appropriate standard for a personal, local-first framework.
        </p>
      </div>
    </section>

  </div>

  <!-- Cross-links -->
  <div class="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-3">
    <a href="/references" class="btn-ghost">
      Frameworks &amp; references
      <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 1L8 5L4 9"/></svg>
    </a>
    <a href="https://github.com/KashishOO7/spectra/blob/main/SCORING.md" target="_blank" rel="noopener noreferrer" class="btn-ghost">
      Full methodology doc (SCORING.md)
    </a>
  </div>
</div>
