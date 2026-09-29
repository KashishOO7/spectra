<script lang="ts">

  import note from '#spectra-wiki/page/methodology';
  import home from '#spectra-wiki/page/home';
  import { text, lines, labels, items, link, rows, spans } from '$lib/wiki/page.js';

  const title = text(note, 'title');
  const description = text(note, 'description');

  const SECTION_IDS = ['split', 'priority', 'coverage', 'freshness', 'contract', 'maturity', 'integrity', 'home-numbers', 'references', 'limits'];

  const homeFacts = items(home, 'cards').map(c => ({
    id: c.title,
    figure: (c.lines[0][0] as { value: string }).value,
    says: (c.lines[1][0] as { value: string }).value,
    sources: c.lines.slice(4).map(l => l[0] as { value: string; href: string })
  }));
  const sectionWords = rows(note, 'sections', SECTION_IDS, 1);
  const sections = SECTION_IDS.map(id => ({ id, label: sectionWords[id][0] }));

  const JOB_IDS = ['A', 'B', 'C'];
  const jobWords = rows(note, 'jobs', JOB_IDS, 3);
  const jobs = JOB_IDS.map(job => ({ job, name: jobWords[job][0], question: jobWords[job][1], seen: jobWords[job][2] }));

  const LEVELS = ['1', '2', '3', '4', '5'];
  const scale = (key: string) => { const w = rows(note, key, LEVELS, 1); return LEVELS.map(n => ({ n: Number(n), label: w[n][0] })); };
  const impactScale = scale('impact');
  const prevalenceScale = scale('prevalence');

  const table = (key: string, count: number) => items(note, key).map(it => {
    if (it.lines.length !== count || it.lines.some(l => l.length !== 1 || l[0].kind !== 'text')) {
      throw new Error(`wiki: methodology "${key}" / "${it.title}" needs exactly ${count} plain line(s)`);
    }
    return { title: it.title, words: it.lines.map(l => (l[0] as { value: string }).value) };
  });

  const workedExamples = table('examples', 2).map(r => ({ id: r.title, math: r.words[0], note: r.words[1] }));
  const multipliers = table('multipliers', 2).map(r => ({ name: r.title, range: r.words[0], detail: r.words[1] }));
  const relevanceScale = table('relevance', 1).map(r => ({ range: r.title, meaning: r.words[0] }));
  const invariants = table('invariants', 2).map(r => ({ id: r.title, rule: r.words[0], note: r.words[1] }));
  const maturityMap = table('maturity-map', 1).map(r => ({ spectra: r.title, meaning: r.words[0] }));

  const limitations = labels(note, 'limitations', 5);
  const integrityRules = labels(note, 'integrity-rules', 5);
  const coverageRules = lines(note, 'coverage-rules');

  const GROUP_IDS = ['controls', 'human', 'implementation'];
  const groupWords = rows(note, 'groups', GROUP_IDS, 2);
  const groups = GROUP_IDS.map(id => ({
    id, label: groupWords[id][0], blurb: groupWords[id][1],
    refs: table(`refs-${id}`, 4).map(r => ({ name: r.title, tag: r.words[0], what: r.words[1], use: r.words[2], href: r.words[3] }))
  }));

  const lead = spans(note, 'lead', ['me', 'your']);
  const formulaThreat = spans(note, 'formula-threat', ['why']);
  const formulaCompensating = spans(note, 'formula-compensating', ['why']);
  const rubricBody = spans(note, 'rubric-body', ['field']);
  const stalkerwareExample = spans(note, 'stalkerware-example', ['id', 'partner', 'opportunistic']);
  const seBody = spans(note, 'se-body', ['formula']);
  const protectedLine = spans(note, 'protected', ['field']);
  const coverageFormula = spans(note, 'coverage-formula', ['coverage']);
  const coverageHeadline = spans(note, 'coverage-headline', ['not']);
  const freshnessBody = spans(note, 'freshness-body', ['example']);
  const freshnessAgeing = spans(note, 'freshness-ageing', ['field']);
  const limitsClose = lines(note, 'limits-close');
  const backLink = link(note, 'back-link');
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://spectra.fpszero.com/methodology" />
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
  <p class="label-mono mb-3">{text(note, 'eyebrow')}</p>
  <h1 class="text-3xl font-bold text-white mb-3">{text(note, 'heading')}</h1>
  <p class="text-body leading-relaxed mb-2">{#each lead as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-bright">{p.value}</strong>{:else if p.kind === 'slot'}<em>{p.words}</em>{/if}{/each}</p>
  <p class="text-dim text-sm mb-10">
    {text(note, 'standards')}
  </p>

  <nav class="panel p-4 mb-10 flex flex-wrap gap-x-4 gap-y-2">
    {#each sections as s}
      <a href="#{s.id}" class="text-sm text-dim hover:text-body transition-colors py-1 min-h-[24px] inline-flex items-center">{s.label}</a>
    {/each}
  </nav>

  <div class="space-y-12">

    <section id="split">
      <h2 class="text-lg font-semibold text-bright mb-4">{text(note, 'split-heading')}</h2>
      <p class="text-body leading-relaxed mb-4">
        {text(note, 'split-body')}
      </p>
      <div class="space-y-2">
        {#each jobs as j}
          <div class="panel p-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
            <span class="tabular-nums text-sm text-teal-light shrink-0 sm:w-24">{j.job} · {j.name}</span>
            <span class="text-sm text-body sm:flex-1">{j.question}</span>
            <span class="text-sm text-dim sm:w-64 sm:text-right">{j.seen}</span>
          </div>
        {/each}
      </div>
    </section>

    <section id="priority">
      <h2 class="text-lg font-semibold text-bright mb-4">{text(note, 'priority-heading')}</h2>
      <p class="text-body leading-relaxed mb-4">
        {text(note, 'priority-body')}
      </p>
      <div class="panel p-5 mb-4 text-sm leading-relaxed overflow-x-auto">
        <code class="block font-mono text-teal-light">{text(note, 'formula-base')}</code>
        <code class="block font-mono text-body pl-4 sm:pl-[7.5rem] sm:-indent-[1rem]">{#each formulaThreat as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'slot'}<span class="text-muted">{p.words}</span>{/if}{/each}</code>
        <code class="block font-mono text-body pl-4 sm:pl-[7.5rem] sm:-indent-[1rem]">{#each formulaCompensating as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'slot'}<span class="text-muted">{p.words}</span>{/if}{/each}</code>
      </div>
      <p class="text-sm text-dim leading-relaxed mb-8">
        {text(note, 'formula-note')}
      </p>

      <h3 class="font-semibold text-bright mb-3">{text(note, 'rubric-heading')}</h3>
      <p class="text-body leading-relaxed mb-6">{#each rubricBody as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-bright">{p.value}</strong>{:else if p.kind === 'slot'}<code class="text-teal-light font-mono text-sm">{p.words}</code>{/if}{/each}</p>

      <p class="text-xs tracking-wide text-dim mb-2">{text(note, 'impact-label')}</p>
      <div class="space-y-1.5 mb-6">
        {#each impactScale as row}
          <div class="flex gap-3 items-baseline">
            <span class="tabular-nums text-sm text-teal w-5 shrink-0 text-right">{row.n}</span>
            <span class="text-sm text-body">{row.label}</span>
          </div>
        {/each}
      </div>

      <p class="text-xs tracking-wide text-dim mb-2">{text(note, 'prevalence-label')}</p>
      <p class="text-sm text-dim mb-2">{text(note, 'prevalence-anchors')}</p>
      <div class="space-y-1.5 mb-6">
        {#each prevalenceScale as row}
          <div class="flex gap-3 items-baseline">
            <span class="tabular-nums text-sm text-teal-light w-5 shrink-0 text-right">{row.n}</span>
            <span class="text-sm text-body">{row.label}</span>
          </div>
        {/each}
      </div>

      <p class="label-mono mb-3">{text(note, 'examples-label')}</p>
      <div class="space-y-3 mb-8">
        {#each workedExamples as ex}
          <div class="panel p-4">
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
              <code class="font-mono text-sm text-bright">{ex.id}</code>
              <code class="font-mono text-xs text-teal-light">{ex.math}</code>
            </div>
            <p class="text-sm text-body leading-relaxed">{ex.note}</p>
          </div>
        {/each}
      </div>

      <h3 class="font-semibold text-bright mb-3">{text(note, 'multipliers-heading')}</h3>
      <div class="space-y-3 mb-6">
        {#each multipliers as m}
          <div class="panel p-4">
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
              <code class="font-mono text-sm text-teal-light">{m.name}</code>
              <span class="tabular-nums text-xs text-dim">{m.range}</span>
            </div>
            <p class="text-sm text-body leading-relaxed">{m.detail}</p>
          </div>
        {/each}
      </div>

      <div class="space-y-1.5 mb-6">
        {#each relevanceScale as row}
          <div class="flex gap-3 items-baseline">
            <span class="tabular-nums text-sm text-teal-light w-24 shrink-0">{row.range}</span>
            <span class="text-sm text-body">{row.meaning}</span>
          </div>
        {/each}
      </div>
      <p class="text-body leading-relaxed mb-4">{#each stalkerwareExample as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'slot' && p.value === 'id'}<code class="font-mono text-sm text-bright">{p.words}</code>{:else if p.kind === 'slot'}<code class="font-mono text-sm text-teal-light">{p.words}</code>{/if}{/each}</p>

      <div class="border-l-2 border-border pl-4 mb-6">
        <p class="label-mono mb-2">{text(note, 'se-label')}</p>
        <p class="text-sm text-body leading-relaxed">{#each seBody as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'slot'}<code class="font-mono text-xs text-teal-light">{p.words}</code>{/if}{/each}</p>
      </div>

      <p class="text-sm text-dim leading-relaxed">{#each protectedLine as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'slot'}<code class="font-mono text-xs text-dim">{p.words}</code>{/if}{/each}</p>
    </section>

    <section id="coverage">
      <h2 class="text-lg font-semibold text-bright mb-4">{text(note, 'coverage-heading')}</h2>
      <p class="text-body leading-relaxed mb-4">{text(note, 'coverage-lead')}</p>
      <div class="panel p-5 mb-4 text-sm overflow-x-auto"><code class="font-mono">{#each coverageFormula as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'slot'}<span class="text-teal-light">{p.words}</span>{/if}{/each}</code></div>
      <ul class="space-y-1.5 text-sm text-body leading-relaxed list-disc pl-5 mb-4">
        {#each coverageRules as line}
          <li>{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-bright">{p.value}</strong>{/if}{/each}</li>
        {/each}
      </ul>
      <p class="text-body leading-relaxed">{#each coverageHeadline as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-bright">{p.value}</strong>{:else if p.kind === 'slot'}<em>{p.words}</em>{/if}{/each}</p>
    </section>

    <section id="freshness">
      <h2 class="text-lg font-semibold text-bright mb-4">{text(note, 'freshness-heading')}</h2>
      <p class="text-body leading-relaxed mb-4">{#each freshnessBody as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'slot'}<em>{p.words}</em>{/if}{/each}</p>
      <p class="text-body leading-relaxed">{#each freshnessAgeing as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-bright">{p.value}</strong>{:else if p.kind === 'slot'}<code class="font-mono text-xs text-dim">{p.words}</code>{/if}{/each}</p>
    </section>

    <section id="contract">
      <h2 class="text-lg font-semibold text-bright mb-4">{text(note, 'contract-heading')}</h2>
      <p class="text-body leading-relaxed mb-4">
        {text(note, 'contract-body')}
      </p>
      <div class="space-y-2">
        {#each invariants as inv}
          <div class="panel p-4">
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
              <span class="tabular-nums text-sm text-teal-light shrink-0">{inv.id}</span>
              <span class="text-sm text-bright">{inv.rule}</span>
            </div>
            <p class="text-sm text-dim leading-relaxed">{inv.note}</p>
          </div>
        {/each}
      </div>
    </section>


    <section id="maturity">
      <h2 class="text-lg font-semibold text-bright mb-4">{text(note, 'maturity-heading')}</h2>
      <p class="text-body leading-relaxed mb-4">
        {text(note, 'maturity-body')}
      </p>
      <div class="space-y-2">
        {#each maturityMap as row}
          <div class="panel p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span class="tabular-nums text-sm text-bright sm:w-56 shrink-0">{row.spectra}</span>
            <span class="text-sm text-body">{row.meaning}</span>
          </div>
        {/each}
      </div>
    </section>

    <section id="integrity">
      <h2 class="text-lg font-semibold text-bright mb-4">{text(note, 'integrity-heading')}</h2>
      <p class="text-body leading-relaxed mb-4">{text(note, 'integrity-body')}</p>
      <ul class="space-y-1.5 text-sm text-body leading-relaxed list-disc pl-5">
        {#each integrityRules as rule}
          <li>{rule}</li>
        {/each}
      </ul>
    </section>

    <section id="home-numbers">
      <h2 class="text-lg font-semibold text-bright mb-2">{text(note, 'home-numbers-heading')}</h2>
      <p class="text-body leading-relaxed mb-6">{text(note, 'home-numbers-body')}</p>
      <ul class="space-y-3">
        {#each homeFacts as f}
          <li class="panel p-4" data-home-fact={f.id}>
            <p class="text-base text-body"><span class="font-semibold text-bright">{f.figure}</span> {f.says}</p>
            <ul class="mt-2 space-y-1">
              {#each f.sources as s}
                <li><a href={s.href} {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                       class="text-sm text-teal-light link-inline">{s.value}</a></li>
              {/each}
            </ul>
          </li>
        {/each}
      </ul>
    </section>

    <section id="references">
      <h2 class="text-lg font-semibold text-bright mb-2">{text(note, 'references-heading')}</h2>
      <p class="text-body leading-relaxed mb-8">
        {text(note, 'references-body')}
      </p>
      <div class="space-y-10">
        {#each groups as g}
          <div id={g.id}>
            <h3 class="font-semibold text-bright mb-1">{g.label}</h3>
            <p class="text-sm text-dim mb-4">{g.blurb}</p>
            <div class="space-y-3">
              {#each g.refs as r}
                <a href={r.href} target="_blank" rel="noopener noreferrer"
                   class="panel block p-4 transition-colors hover:border-muted group">
                  <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                    <span class="font-semibold text-bright group-hover:text-white transition-colors">{r.name}</span>
                    {#if r.tag}<span class="pill-dim">{r.tag}</span>{/if}
                    <svg class="ml-auto text-muted group-hover:text-teal-light transition-colors shrink-0" width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 2H2v10h10V9M9 2h3v3M12 2L6.5 7.5"/>
                    </svg>
                  </div>
                  <p class="text-sm text-body leading-relaxed mb-2">{r.what}</p>
                  <p class="text-sm text-dim leading-relaxed">
                    <span class="text-teal-light text-sm">{text(note, 'how-used')}</span>: {r.use}
                  </p>
                </a>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section id="limits">
      <h2 class="text-lg font-semibold text-bright mb-4">{text(note, 'limits-heading')}</h2>
      <div class="border border-teal/30 rounded-xl p-5 bg-teal-dim/10 space-y-3">
        {#each limitations as l}
          <p class="text-sm text-body leading-relaxed">{l}</p>
        {/each}
        {#each limitsClose as line}
          <p class="text-sm text-body leading-relaxed pt-1">{#each line as p}{#if p.kind === 'text'}{p.value}{:else if p.kind === 'strong'}<strong class="text-teal-light">{p.value}</strong>{/if}{/each}</p>
        {/each}
      </div>
    </section>

  </div>

  <div class="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-3">
    <a href={backLink.href} class="btn-ghost">
      <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 1L2 5L6 9"/></svg>
      {backLink.text}
    </a>
  </div>
</div>
