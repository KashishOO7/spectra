<script lang="ts">
  type Ref = { name: string; what: string; use: string; href: string; tag?: string };
  type Group = { id: string; label: string; blurb: string; refs: Ref[] };

  const groups: Group[] = [
    {
      id: 'risk',
      label: 'Risk & scoring models',
      blurb: 'The shape of Spectra’s priority formula comes from these.',
      refs: [
        {
          name: 'NIST SP 800-30',
          tag: 'risk model',
          what: 'Guide for conducting risk assessments. Models risk as a function of threat, likelihood, and impact.',
          use: 'Spectra’s multiplicative scoring (impact × prevalence × threat relevance) is in the spirit of this model.',
          href: 'https://csrc.nist.gov/pubs/sp/800/30/r1/final'
        },
        {
          name: 'CVSS (environmental scoring)',
          tag: 'tailoring',
          what: 'The Common Vulnerability Scoring System’s environmental metrics adjust a base score for a specific deployment.',
          use: 'Inspiration for re-weighting a baseline score by your personal threat model rather than reporting one universal number.',
          href: 'https://www.first.org/cvss/'
        }
      ]
    },
    {
      id: 'controls',
      label: 'Controls catalogs & structure',
      blurb: 'Where the control definitions and category structure are anchored.',
      refs: [
        {
          name: 'NIST Cybersecurity Framework (CSF)',
          tag: 'structure',
          what: 'A high-level framework organising security into functions and categories (Identify, Protect, Detect, Respond, Recover).',
          use: 'Provides the recognised structure that Spectra’s categories and per-item references map to.',
          href: 'https://www.nist.gov/cyberframework'
        },
        {
          name: 'NIST SP 800-53',
          tag: 'controls',
          what: 'The catalog of security and privacy controls for information systems.',
          use: 'A control catalog of record for grounding what each checklist item actually does.',
          href: 'https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final'
        },
        {
          name: 'NIST SP 800-63B',
          tag: 'authentication',
          what: 'Digital identity guidelines covering authentication and authenticator strength (passwords, MFA, phishing resistance).',
          use: 'The basis for how Spectra ranks authentication controls (e.g. why phishing-resistant MFA outranks SMS codes).',
          href: 'https://pages.nist.gov/800-63-3/sp800-63b.html'
        }
      ]
    },
    {
      id: 'cis',
      label: 'CIS Controls v8',
      blurb: 'The maturity levels map directly to CIS Implementation Groups.',
      refs: [
        {
          name: 'CIS Controls v8',
          tag: 'safeguards',
          what: 'A prioritised set of safeguards to mitigate the most common attacks, maintained by the Center for Internet Security.',
          use: 'A source of record for the concrete safeguards behind Spectra’s items.',
          href: 'https://www.cisecurity.org/controls/v8'
        },
        {
          name: 'CIS Implementation Groups',
          tag: 'maturity',
          what: 'Three tiers (IG1–IG3) that scale safeguards by an organisation’s resources and risk.',
          use: 'Spectra’s maturity levels map to these: L1/L2 → IG1, L3 → IG2, L4/L5 → IG3.',
          href: 'https://www.cisecurity.org/controls/implementation-groups'
        }
      ]
    },
    {
      id: 'adversary',
      label: 'Adversary techniques',
      blurb: 'How attacks are named and categorised.',
      refs: [
        {
          name: 'MITRE ATT&CK',
          tag: 'techniques',
          what: 'A globally accessible knowledge base of adversary tactics and techniques based on real-world observations.',
          use: 'The reference vocabulary for the attack vectors Spectra’s controls mitigate (e.g. T1566, phishing).',
          href: 'https://attack.mitre.org/'
        }
      ]
    },
    {
      id: 'human',
      label: 'Human factors',
      blurb: 'The human layer most security checklists ignore.',
      refs: [
        {
          name: 'Cialdini — Principles of Influence',
          tag: 'social engineering',
          what: 'Six principles of persuasion (reciprocity, scarcity, authority, consistency, liking, social proof).',
          use: 'The backbone of Spectra’s social-engineering susceptibility quiz and its per-register weighting.',
          href: 'https://www.influenceatwork.com/principles-of-persuasion/'
        },
        {
          name: 'Kahneman — System 1 / System 2',
          tag: 'cognition',
          what: 'A dual-process model of fast, intuitive thinking versus slow, deliberate reasoning.',
          use: 'Informs how Spectra frames the emotional triggers attackers exploit.',
          href: 'https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow'
        },
        {
          name: 'BJ Fogg — Behavior Model',
          tag: 'behaviour',
          what: 'Behaviour happens when motivation, ability, and a prompt converge.',
          use: 'Informs how items are sequenced and motivated so the audit stays achievable, not overwhelming.',
          href: 'https://behaviormodel.org/'
        }
      ]
    },
    {
      id: 'implementation',
      label: 'Implementation guidance',
      blurb: 'Plain-language, trustworthy how-to sources the items link out to.',
      refs: [
        {
          name: 'EFF Surveillance Self-Defense',
          tag: 'how-to',
          what: 'The Electronic Frontier Foundation’s guides to protecting against surveillance.',
          use: 'A primary source for the implementation steps and threat-modelling language in Spectra.',
          href: 'https://ssd.eff.org/'
        },
        {
          name: 'Privacy Guides',
          tag: 'tools',
          what: 'A community-driven, non-commercial resource recommending privacy-respecting tools and practices.',
          use: 'A reference for the curated tools on the Resources page — chosen for posture, not partnership.',
          href: 'https://www.privacyguides.org/'
        }
      ]
    },
    {
      id: 'data',
      label: 'Threat-prevalence data',
      blurb: 'The public data that anchors the prevalence half of every weight.',
      refs: [
        {
          name: 'Verizon DBIR',
          tag: 'breaches',
          what: 'The annual Data Breach Investigations Report — breach patterns across thousands of real incidents.',
          use: 'Anchors prevalence scores: e.g. credential attacks being the dominant breach vector.',
          href: 'https://www.verizon.com/business/resources/reports/dbir/'
        },
        {
          name: 'FBI IC3 Annual Report',
          tag: 'fraud',
          what: 'The Internet Crime Complaint Center’s yearly summary of reported cybercrime and losses.',
          use: 'Anchors prevalence and impact for fraud, BEC, and identity-theft controls.',
          href: 'https://www.ic3.gov/AnnualReport/Reports'
        },
        {
          name: 'Have I Been Pwned',
          tag: 'credentials',
          what: 'A searchable index of credentials exposed in public data breaches.',
          use: 'Grounds the near-universal prevalence of credential reuse and password-related risk.',
          href: 'https://haveibeenpwned.com/'
        }
      ]
    }
  ];
</script>

<svelte:head>
  <title>References &amp; Standards | Spectra</title>
  <meta name="description" content="The standards, frameworks, and public data Spectra is built on — and exactly how each one is used." />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
  <p class="label-mono mb-3">References &amp; Standards</p>
  <h1 class="font-display text-3xl font-bold text-white mb-3">What Spectra is built on</h1>
  <p class="text-body leading-relaxed mb-2">
    Spectra does <strong class="text-bright">not</strong> copy framework text into its database. Each
    item carries light references only; the standards themselves are listed here, with what each one
    is and exactly how Spectra uses it. Every claim traces back to a primary source — and none of
    these are commercial relationships.
  </p>
  <p class="text-dim font-mono text-sm mb-10">
    See the <a href="/methodology" class="text-teal-light hover:text-teal underline underline-offset-2">methodology</a>
    for how these feed the scoring.
  </p>

  <!-- TOC -->
  <nav class="panel p-4 mb-10 flex flex-wrap gap-x-4 gap-y-2">
    {#each groups as g}
      <a href="#{g.id}" class="text-sm text-dim hover:text-body font-mono transition-colors">{g.label}</a>
    {/each}
  </nav>

  <div class="space-y-12">
    {#each groups as g}
      <section id={g.id}>
        <h2 class="font-display text-xl font-semibold text-bright mb-1">{g.label}</h2>
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
                <span class="text-teal-light font-mono text-xs">how Spectra uses it</span> &mdash; {r.use}
              </p>
            </a>
          {/each}
        </div>
      </section>
    {/each}
  </div>

  <!-- Cross-links -->
  <div class="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-3">
    <a href="/methodology" class="btn-ghost">
      <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 1L2 5L6 9"/></svg>
      Scoring methodology
    </a>
    <a href="/resources" class="btn-ghost">Curated tools &amp; resources</a>
  </div>
</div>
