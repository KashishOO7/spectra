<script lang="ts">
  const sections = [
    { id: 'split',      label: 'Three jobs' },
    { id: 'priority',   label: 'Priority' },
    { id: 'coverage',   label: 'Coverage' },
    { id: 'freshness',  label: 'Freshness' },
    { id: 'contract',   label: 'The contract' },
    { id: 'changed',    label: 'What changed' },
    { id: 'maturity',   label: 'Maturity levels' },
    { id: 'integrity',  label: 'Content integrity' },
    { id: 'references', label: 'References' },
    { id: 'limits',     label: 'Honest limitations' }
  ];

  const jobs = [
    { job: 'A', name: 'Priority', question: 'What should this person do next?', seen: 'Nobody, ever, as a number' },
    { job: 'B', name: 'Coverage', question: 'How much ground is covered?',      seen: 'The reader, and it is the only number they see' },
    { job: 'C', name: 'Freshness', question: 'What is worth re-checking?',      seen: 'The reader, as a count and a list' }
  ];

  const impactScale = [
    { n: 1, label: 'Minor or cosmetic' },
    { n: 2, label: 'Limited data exposure' },
    { n: 3, label: 'Account or device compromise' },
    { n: 4, label: 'Financial loss, identity theft' },
    { n: 5, label: 'Physical-safety or catastrophic, irreversible harm' }
  ];
  const prevalenceScale = [
    { n: 1, label: 'Rare or theoretical' },
    { n: 2, label: 'Occasional, targeted' },
    { n: 3, label: 'Common' },
    { n: 4, label: 'Very common' },
    { n: 5, label: 'Near-universal, automated at scale' }
  ];

  const workedExamples = [
    {
      id: 'auth-2fa-001',
      math: 'weight 9.5',
      note: 'High impact (account takeover cascades) by very high prevalence (credential attacks are the dominant breach vector). Near the top of the scale.'
    },
    {
      id: 'net-vpn-001',
      math: 'weight 7.5',
      note: 'Moderate impact (network exposure), common but largely mitigated by HTTPS. Upper-mid and situational.'
    },
    {
      id: 'womens-stalkerware-001',
      math: 'weight 9.0',
      note: 'Maximum impact (physical safety) sets a high base, then the intimate-partner multiplier below elevates it further.'
    }
  ];

  const relevanceScale = [
    { range: '0.1 to 0.3', meaning: 'Largely irrelevant to this adversary' },
    { range: '0.8 to 1.0', meaning: 'Baseline relevance' },
    { range: '1.2 to 1.5', meaning: 'Elevated. This adversary actively uses the attack this control blocks' },
    { range: '1.6 to 2.0', meaning: 'This adversary is the reason the control exists' }
  ];

  const multipliers = [
    {
      name: 'threat_multiplier',
      range: '0.1 to 2.0',
      detail: 'Per-adversary relevance, taken as the maximum across the adversaries you selected. Maximum, not product: two elevated adversaries do not compound into a number neither of them justifies.'
    },
    {
      name: 'compensating_factor',
      range: '0 to 1',
      detail: 'If you have already implemented a stronger control, the urgency of a weaker alternative drops by that item’s documented urgency_reduction. Asymmetric, and modelled per item rather than inferred.'
    }
  ];

  const invariants = [
    { id: 'I1', rule: 'Coverage is monotonic across every reachable state transition',
      note: 'Doing something never lowers it. Doing nothing never raises it. This kills skip inflation and silent decay in one line.' },
    { id: 'I2', rule: 'Coverage is 100 only when every applicable item is implemented',
      note: 'Honest bounds. Reachable, but only one way.' },
    { id: 'I3', rule: 'Every item resolves to at least one harm',
      note: 'A blocking gate in scripts/validate.ts. An item with no harm cannot be found by anyone using the front page, so it may as well not exist.' },
    { id: 'I4', rule: 'No two counters on one screen can disagree',
      note: 'Why the old exposure strip was removed: two progress models on one screen told the reader two different things about the same profile.' },
    { id: 'I5', rule: 'No engine internal renders outside this page',
      note: 'A lint gate, scripts/check-internals.ts, wired into both validate and build. It is what keeps multipliers, verification dates, points and raw scores off every other screen permanently.' }
  ];

  const maturityMap = [
    { spectra: 'L1 Essential, L2 Baseline', ig: 'IG1', meaning: 'Basic cyber hygiene everyone needs' },
    { spectra: 'L3 Hardened',               ig: 'IG2', meaning: 'Elevated-risk individuals' },
    { spectra: 'L4 Advanced, L5 Expert',    ig: 'IG3', meaning: 'High-threat or specialist' }
  ];

  const limitations = [
    'The rubric makes every number justifiable and consistent, but impact and prevalence are still expert judgement anchored to public data, not a calibrated probabilistic model. The output is a sound relative priority, not an absolute risk percentage.',
    'Coverage weights every item by its own weight, so a category holding more items carries more of the figure. That is deliberate, since it reflects how much of the covered ground is done, but it means breadth across categories is not rewarded for its own sake.',
    'The threat multiplier uses the maximum across your selected adversaries, which is conservative, rather than an additive or probabilistic combination.',
    'The eight harms are a projection over the assets and attack vectors each item already carries, so their sizes reflect how the corpus is tagged. Four items under "Someone pretends to be you" is a real content gap, and it is shown rather than hidden.',
    'The stored weights are principled hand-tuning to 0.5 granularity, not the arithmetic output of the rubric below. The rubric is the consistency guide reviewers use, not the generator. No item carries a written rationale yet.'
  ];

  type Ref = { name: string; what: string; use: string; href: string; tag?: string };
  type Group = { id: string; label: string; blurb: string; refs: Ref[] };

  const groups: Group[] = [
    {
      id: 'risk',
      label: 'Risk and scoring models',
      blurb: 'The shape of the priority formula comes from these.',
      refs: [
        { name: 'NIST SP 800-30', tag: 'risk model',
          what: 'Guide for conducting risk assessments. Models risk as a function of threat, likelihood, and impact.',
          use: 'The multiplicative priority model is in the spirit of this one.',
          href: 'https://csrc.nist.gov/pubs/sp/800/30/r1/final' },
        { name: 'CVSS (environmental scoring)', tag: 'tailoring',
          what: 'The Common Vulnerability Scoring System’s environmental metrics adjust a base score for a specific deployment.',
          use: 'Inspiration for re-weighting a baseline score by your own situation rather than reporting one universal number.',
          href: 'https://www.first.org/cvss/' }
      ]
    },
    {
      id: 'controls',
      label: 'Controls catalogs and structure',
      blurb: 'Where the control definitions and category structure are anchored.',
      refs: [
        { name: 'NIST Cybersecurity Framework (CSF)', tag: 'structure',
          what: 'A high-level framework organising security into functions and categories: Identify, Protect, Detect, Respond, Recover.',
          use: 'Provides the recognised structure that Spectra’s categories and per-item references map to.',
          href: 'https://www.nist.gov/cyberframework' },
        { name: 'NIST SP 800-53', tag: 'controls',
          what: 'The catalog of security and privacy controls for information systems.',
          use: 'A control catalog of record for grounding what each checklist item actually does.',
          href: 'https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final' },
        { name: 'NIST SP 800-63B', tag: 'authentication',
          what: 'Digital identity guidelines covering authentication and authenticator strength: passwords, MFA, phishing resistance.',
          use: 'The basis for how authentication controls are ranked, including why phishing-resistant MFA outranks SMS codes.',
          href: 'https://pages.nist.gov/800-63-3/sp800-63b.html' }
      ]
    },
    {
      id: 'cis',
      label: 'CIS Controls v8',
      blurb: 'The maturity levels map directly to CIS Implementation Groups.',
      refs: [
        { name: 'CIS Controls v8', tag: 'safeguards',
          what: 'A prioritised set of safeguards to mitigate the most common attacks, maintained by the Center for Internet Security.',
          use: 'A source of record for the concrete safeguards behind Spectra’s items.',
          href: 'https://www.cisecurity.org/controls/v8' },
        { name: 'CIS Implementation Groups', tag: 'maturity',
          what: 'Three tiers, IG1 to IG3, that scale safeguards by an organisation’s resources and risk.',
          use: 'Spectra’s maturity levels map to these: L1 and L2 to IG1, L3 to IG2, L4 and L5 to IG3.',
          href: 'https://www.cisecurity.org/controls/implementation-groups' }
      ]
    },
    {
      id: 'adversary',
      label: 'Adversary techniques',
      blurb: 'How attacks are named and categorised.',
      refs: [
        { name: 'MITRE ATT&CK', tag: 'techniques',
          what: 'A globally accessible knowledge base of adversary tactics and techniques based on real-world observations.',
          use: 'The reference vocabulary for the attack vectors Spectra’s controls mitigate, for example T1566, phishing.',
          href: 'https://attack.mitre.org/' }
      ]
    },
    {
      id: 'human',
      label: 'Human factors',
      blurb: 'The human layer most security checklists ignore.',
      refs: [
        { name: 'Cialdini, Principles of Influence', tag: 'social engineering',
          what: 'Six principles of persuasion: reciprocity, scarcity, authority, consistency, liking, social proof.',
          use: 'The backbone of the social-engineering susceptibility quiz and its per-register weighting.',
          href: 'https://www.influenceatwork.com/principles-of-persuasion/' },
        { name: 'Kahneman, System 1 and System 2', tag: 'cognition',
          what: 'A dual-process model of fast, intuitive thinking versus slow, deliberate reasoning.',
          use: 'Informs how the emotional triggers attackers exploit are framed.',
          href: 'https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow' },
        { name: 'BJ Fogg, Behavior Model', tag: 'behaviour',
          what: 'Behaviour happens when motivation, ability, and a prompt converge.',
          use: 'Informs how items are sequenced and motivated so the audit stays achievable rather than overwhelming.',
          href: 'https://behaviormodel.org/' }
      ]
    },
    {
      id: 'implementation',
      label: 'Implementation guidance',
      blurb: 'Plain-language, trustworthy how-to sources the items link out to.',
      refs: [
        { name: 'EFF Surveillance Self-Defense', tag: 'how-to',
          what: 'The Electronic Frontier Foundation’s guides to protecting against surveillance.',
          use: 'A primary source for the implementation steps and much of the plain-language framing.',
          href: 'https://ssd.eff.org/' },
        { name: 'Privacy Guides', tag: 'tools',
          what: 'A community-driven, non-commercial resource recommending privacy-respecting tools and practices.',
          use: 'A reference for the curated tools on the Resources page, chosen for posture rather than partnership.',
          href: 'https://www.privacyguides.org/' }
      ]
    },
    {
      id: 'data',
      label: 'Threat-prevalence data',
      blurb: 'The public data that anchors the prevalence half of every weight.',
      refs: [
        { name: 'Verizon DBIR', tag: 'breaches',
          what: 'The annual Data Breach Investigations Report, covering breach patterns across thousands of real incidents.',
          use: 'Anchors prevalence scores, for example credential attacks being the dominant breach vector.',
          href: 'https://www.verizon.com/business/resources/reports/dbir/' },
        { name: 'FBI IC3 Annual Report', tag: 'fraud',
          what: 'The Internet Crime Complaint Center’s yearly summary of reported cybercrime and losses.',
          use: 'Anchors prevalence and impact for fraud, business email compromise, and identity-theft controls.',
          href: 'https://www.ic3.gov/AnnualReport/Reports' },
        { name: 'Have I Been Pwned', tag: 'credentials',
          what: 'A searchable index of credentials exposed in public data breaches.',
          use: 'Grounds the near-universal prevalence of credential reuse and password-related risk.',
          href: 'https://haveibeenpwned.com/' }
      ]
    }
  ];
</script>

<svelte:head>
  <title>Under the hood | Spectra</title>
  <meta name="description" content="Everything technical in one place: how the priority order is worked out, what coverage measures, the invariants that hold it together, the standards behind it, and what it is not good at." />
  <link rel="canonical" href="https://spectra.fpszero.com/methodology" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Spectra" />
  <meta property="og:title" content="Under the hood | Spectra" />
  <meta property="og:description" content="Everything technical in one place: how the priority order is worked out, what coverage measures, the invariants that hold it together, the standards behind it, and what it is not good at." />
  <meta property="og:url" content="https://spectra.fpszero.com/methodology" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Under the hood | Spectra" />
  <meta name="twitter:description" content="Everything technical in one place: how the priority order is worked out, what coverage measures, the invariants that hold it together, the standards behind it, and what it is not good at." />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
  <p class="label-mono mb-3">Under the hood</p>
  <h1 class="font-display text-3xl font-bold text-white mb-3">How the numbers are made</h1>
  <p class="text-body leading-relaxed mb-2">
    Everything technical, in one place, for the person who wants to check the work. Spectra is a
    <strong class="text-bright">prioritisation engine</strong>, not a calibrated risk calculator.
    Its job is to answer "what should <em>I</em> do next?" for <em>your</em> situation.
  </p>
  <p class="text-dim text-sm mb-10">
    Spirit of NIST SP 800-30 · CVSS-style environmental scoring · bespoke, but never hand-waved
  </p>

  <nav class="panel p-4 mb-10 flex flex-wrap gap-x-4 gap-y-2">
    {#each sections as s}
      <a href="#{s.id}" class="text-sm text-dim hover:text-body transition-colors py-1 min-h-[24px] inline-flex items-center">{s.label}</a>
    {/each}
  </nav>

  <div class="space-y-12">

    <section id="split">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">One number was doing two jobs</h2>
      <p class="text-body leading-relaxed mb-4">
        A single score answered "what should this person do next" and "how well is this person
        doing" at the same time. Those are different questions with different rules, and every
        scoring defect in this project came from the collision: skip inflation, silent decay, and
        the audit and the timeline disagreeing about the same profile. It is split into three, and
        they never mix again.
      </p>
      <div class="space-y-2">
        {#each jobs as j}
          <div class="panel p-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
            <span class="font-mono text-sm text-amber-light shrink-0 sm:w-24">{j.job} · {j.name}</span>
            <span class="text-sm text-body sm:flex-1">{j.question}</span>
            <span class="text-[13px] text-dim sm:w-64 sm:text-right">{j.seen}</span>
          </div>
        {/each}
      </div>
    </section>

    <section id="priority">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Job A: priority</h2>
      <p class="text-body leading-relaxed mb-4">
        Internal. Never rendered as a number, a badge, a percentage or a rank anywhere in the
        product. It orders the queue and chooses the action card, and that is all it does, which is
        why it can afford to stay sophisticated.
      </p>
      <div class="panel p-5 mb-4 font-mono text-sm leading-relaxed overflow-x-auto">
        <div class="text-amber-light">priority = base_weight</div>
        <div class="text-body pl-[7.5rem] -indent-[1rem]">× threat_multiplier <span class="text-muted">(max across your adversaries, never compounded)</span></div>
        <div class="text-body pl-[7.5rem] -indent-[1rem]">× (1 − compensating_factor) <span class="text-muted">(a stronger control you already have)</span></div>
      </div>
      <p class="text-sm text-dim leading-relaxed mb-8">
        Two things that used to be in this formula are not. Real-world events no longer multiply
        anything, and content ageing left priority entirely. Both are explained below.
      </p>

      <h3 class="font-display font-semibold text-bright mb-3">base_weight, and the rubric</h3>
      <p class="text-body leading-relaxed mb-6">
        Each item’s <code class="text-amber-light font-mono text-sm">score_weight</code> (0 to 10)
        is set by expert judgement along two axes, <strong class="text-bright">impact</strong> and
        <strong class="text-bright">prevalence</strong>. The rubric below is the guide reviewers use
        to keep those weights consistent and defensible. It is principled estimation anchored to
        public data, not a number produced by a mechanical formula.
      </p>

      <p class="text-xs tracking-wide text-dim mb-2">Impact (1 to 5), severity if the threat this control mitigates succeeds</p>
      <div class="space-y-1.5 mb-6">
        {#each impactScale as row}
          <div class="flex gap-3 items-baseline">
            <span class="font-mono text-sm text-amber w-5 shrink-0 text-right">{row.n}</span>
            <span class="text-sm text-body">{row.label}</span>
          </div>
        {/each}
      </div>

      <p class="text-xs tracking-wide text-dim mb-2">Prevalence (1 to 5), how common the attack is</p>
      <p class="text-[13px] text-dim mb-2">anchored to Verizon DBIR · FBI IC3 · Have I Been Pwned</p>
      <div class="space-y-1.5 mb-6">
        {#each prevalenceScale as row}
          <div class="flex gap-3 items-baseline">
            <span class="font-mono text-sm text-teal-light w-5 shrink-0 text-right">{row.n}</span>
            <span class="text-sm text-body">{row.label}</span>
          </div>
        {/each}
      </div>

      <p class="label-mono mb-3">How the rubric reads a few items</p>
      <div class="space-y-3 mb-8">
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

      <h3 class="font-display font-semibold text-bright mb-3">The multipliers</h3>
      <div class="space-y-3 mb-6">
        {#each multipliers as m}
          <div class="panel p-4">
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
              <code class="font-mono text-sm text-teal-light">{m.name}</code>
              <span class="font-mono text-xs text-dim">{m.range}</span>
            </div>
            <p class="text-sm text-body leading-relaxed">{m.detail}</p>
          </div>
        {/each}
      </div>

      <div class="space-y-1.5 mb-6">
        {#each relevanceScale as row}
          <div class="flex gap-3 items-baseline">
            <span class="font-mono text-sm text-amber-light w-24 shrink-0">{row.range}</span>
            <span class="text-sm text-body">{row.meaning}</span>
          </div>
        {/each}
      </div>
      <p class="text-body leading-relaxed mb-4">
        <code class="font-mono text-sm text-bright">womens-stalkerware-001</code> carries
        <code class="font-mono text-sm text-amber-light">intimate_partner: 2.0</code> and
        <code class="font-mono text-sm text-amber-light">opportunistic: 0.1</code>. That is why a
        survivor and a casual reader get very different orderings, and it is the core
        differentiator.
      </p>

      <div class="border-l-2 border-border pl-4 mb-6">
        <p class="label-mono mb-2">Social-engineering weight</p>
        <p class="text-sm text-body leading-relaxed">
          For human-vulnerability items only, the social-engineering quiz maps your answers to a
          susceptibility score per Cialdini register;
          <code class="font-mono text-xs text-amber-light">seWeight = 0.8 + score/100 × 0.6</code>,
          range 0.8 to 1.4.
        </p>
      </div>

      <p class="text-sm text-dim leading-relaxed">
        <code class="font-mono text-xs text-dim">score_weight</code> and the threat multipliers are
        protected fields, so changes require maintainer review through CODEOWNERS and the priority
        order cannot be quietly skewed.
      </p>
    </section>

    <section id="coverage">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Job B: coverage</h2>
      <p class="text-body leading-relaxed mb-4">The only number a reader sees.</p>
      <div class="panel p-5 mb-4 font-mono text-sm overflow-x-auto">
        <span class="text-amber-light">coverage</span> = earned weight ÷ total applicable weight
      </div>
      <ul class="space-y-1.5 text-sm text-body leading-relaxed list-disc pl-5 mb-4">
        <li><strong class="text-bright">Skipped items stay in the denominator.</strong> They were offered and declined, and a number that rises when you dismiss the list is measuring the wrong thing.</li>
        <li><strong class="text-bright">Ageing does not touch it.</strong> Not the numerator, not the denominator.</li>
        <li><strong class="text-bright">100 means finished</strong>, and there is exactly one way to reach it.</li>
      </ul>
      <p class="text-body leading-relaxed">
        Coverage is <em>not</em> the headline. The headline is harms, because a count of eight
        things a person recognises is legible in a way a percentage is not:
        <strong class="text-bright">2 of 8 covered</strong>. The percentage lives here, and on the
        threat map, where it earns its keep.
      </p>
    </section>

    <section id="freshness">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Job C: freshness</h2>
      <p class="text-body leading-relaxed mb-4">
        Content ages, and that must never silently erode somebody’s progress. Freshness is a
        count and a list, never a deduction: <em>3 things are worth re-checking</em>, then the
        three names. An action, not a punishment.
      </p>
      <p class="text-body leading-relaxed">
        Ageing is <strong class="text-bright">not</strong> measured in elapsed time. With one
        maintainer, every item eventually crosses every age threshold, and the product would end up
        claiming its content had rotted because a file had not been touched. An item is worth
        re-reading when the guidance actually changed: the profile records the item’s version
        at the moment it was marked done, and the item is flagged when that version moves.
        <code class="font-mono text-xs text-dim">last_verified</code> stays in the source as
        contributor metadata and renders on this page, nowhere else.
      </p>
    </section>

    <section id="contract">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">The contract</h2>
      <p class="text-body leading-relaxed mb-4">
        Five invariants. They were written as tests before they were written as code, and they are
        the reason the split holds instead of drifting back together.
      </p>
      <div class="space-y-2">
        {#each invariants as inv}
          <div class="panel p-4">
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
              <span class="font-mono text-sm text-teal-light shrink-0">{inv.id}</span>
              <span class="text-sm text-bright">{inv.rule}</span>
            </div>
            <p class="text-sm text-dim leading-relaxed">{inv.note}</p>
          </div>
        {/each}
      </div>
    </section>

    <section id="changed">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">What changed, and what it cost</h2>
      <div class="space-y-4">
        <div>
          <p class="font-sans font-medium text-bright mb-1">Content ageing left the score</p>
          <p class="text-sm text-body leading-relaxed">
            A staleness multiplier used to discount the numerator and not the denominator, so
            somebody who had done everything watched their number fall on a date, with nothing
            about their situation having changed. It is gone, and freshness became Job C.
          </p>
        </div>
        <div>
          <p class="font-sans font-medium text-bright mb-1">Real-world events stopped multiplying</p>
          <p class="text-sm text-body leading-relaxed">
            They compounded. <code class="font-mono text-xs text-amber-light">auth-2fa-001</code>
            sat in both active entries at 9.5 × 1.25 × 1.3 = 15.44, a 62% boost decided by two
            entries whose own sources the validator flags as six and eight years older than the
            event they support. Measured, both facts were already priced into the base weight: that
            item’s own narrative names SIM-swapping, which is the SMS entry’s claim, and
            its 9.5 rests on credential attacks being the dominant breach vector, which is the
            phishing entry’s claim. Folding them in would have counted the same fact twice, so
            no base weight was changed and removing the multipliers corrected an inflation.
          </p>
        </div>
        <div>
          <p class="font-sans font-medium text-bright mb-1">It reordered the queue, which was the point</p>
          <p class="text-sm text-body leading-relaxed">
            Measured across three profiles, eight to ten of the top ten positions move. For
            somebody whose adversary is an intimate partner, row 01 changes from
            <code class="font-mono text-xs text-amber-light">auth-2fa-001</code> to
            <code class="font-mono text-xs text-amber-light">device-encrypt-001</code>: a generic
            phishing multiplier had been deciding the first row for a reader it did not describe.
          </p>
        </div>
      </div>
    </section>

    <section id="maturity">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Maturity levels and CIS Implementation Groups</h2>
      <p class="text-body leading-relaxed mb-4">
        The five maturity levels map to the CIS Implementation Groups, which gives them a
        recognised meaning rather than a private scale.
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

    <section id="integrity">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Content integrity</h2>
      <p class="text-body leading-relaxed mb-4">
        Content lives as YAML files and is checked by a blocking validator,
        <code class="font-mono text-xs text-dim">npm run validate</code>, which runs in CI and
        ahead of every build. It checks the schema of every item, threat node and resource, plus
        cross-references between them, and it fails the build rather than warning.
      </p>
      <ul class="space-y-1.5 text-sm text-body leading-relaxed list-disc pl-5">
        <li>Every item must resolve to at least one harm, or it cannot be found by anyone using the front page. That is invariant I3 and it is a hard failure.</li>
        <li>No rendered string may carry a maintainer placeholder, so unfinished copy cannot reach a reader.</li>
        <li>No rendered string may carry a phone number, because a helpline for one country is wrong for every other.</li>
        <li>No engine internal may render outside this page. That is invariant I5, enforced as a lint pass over every component rather than as a convention.</li>
        <li>Spectra does not copy framework text into its database. Items carry light references only, and the standards themselves are listed below.</li>
      </ul>
    </section>

    <section id="references">
      <h2 class="font-display text-xl font-semibold text-bright mb-2">References and standards</h2>
      <p class="text-body leading-relaxed mb-8">
        What each one is, and exactly how Spectra uses it. Every claim traces back to a primary
        source, and none of these are commercial relationships.
      </p>
      <div class="space-y-10">
        {#each groups as g}
          <div id={g.id}>
            <h3 class="font-display font-semibold text-bright mb-1">{g.label}</h3>
            <p class="text-sm text-dim mb-4">{g.blurb}</p>
            <div class="space-y-3">
              {#each g.refs as r}
                <a href={r.href} target="_blank" rel="noopener noreferrer"
                   class="panel block p-4 transition-colors hover:border-muted group">
                  <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                    <span class="font-display font-semibold text-bright group-hover:text-white transition-colors">{r.name}</span>
                    {#if r.tag}<span class="pill-dim">{r.tag}</span>{/if}
                    <svg class="ml-auto text-muted group-hover:text-teal-light transition-colors shrink-0" width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 2H2v10h10V9M9 2h3v3M12 2L6.5 7.5"/>
                    </svg>
                  </div>
                  <p class="text-sm text-body leading-relaxed mb-2">{r.what}</p>
                  <p class="text-sm text-dim leading-relaxed">
                    <span class="text-teal-light text-[13px]">how Spectra uses it</span>: {r.use}
                  </p>
                </a>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section id="limits">
      <h2 class="font-display text-xl font-semibold text-bright mb-4">Honest limitations</h2>
      <div class="border border-amber/30 rounded-lg p-5 bg-amber-dim/10 space-y-3">
        {#each limitations as l}
          <p class="text-sm text-body leading-relaxed">{l}</p>
        {/each}
        <p class="text-sm text-body leading-relaxed pt-1">
          Spectra is an educational prioritisation tool. It is honest about being
          <strong class="text-amber-light">principled estimation</strong> rather than validated
          quantitative risk scoring, which is the appropriate standard for a personal, local-first
          framework.
        </p>
      </div>
    </section>

  </div>

  <div class="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-3">
    <a href="/how-it-works" class="btn-ghost">
      <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 1L2 5L6 9"/></svg>
      How Spectra works
    </a>
    <a href="https://github.com/KashishOO7/spectra/blob/main/SCORING.md" target="_blank" rel="noopener noreferrer" class="btn-ghost">
      The same thing as a document (SCORING.md)
    </a>
  </div>
</div>
