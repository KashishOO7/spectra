<script lang="ts">
  import type { AssessmentResult, UserProfile } from '$lib/types.js';
  import { maturityBandLabels, maturityColors, maturityDescriptions, EMOTIONAL_REGISTER_LABELS } from '$lib/audit/constants.js';
  import { coverageOf, coverageLine, harmBreakdown, COVERED_MEANS } from '$lib/engine/coverage.js';

  export let result: AssessmentResult | null;
  $: cov = coverageOf(result);
  $: harmRows = harmBreakdown(result);
  export let profile: UserProfile | null;
  export let exportStatus: 'idle' | 'done' | 'error';
  export let onBack: () => void;
  export let onExport: () => void;
  export let onScrollToItem: (id: string, category?: string) => void;
  export let onTakeQuiz: () => void;

  $: scoreSparklinePoints = (() => {
    const timeline = profile?.timeline ?? [];
    const pts: Array<{ score: number; label: string; formula: 1 | 2 }> = [];

    const chronological = [...timeline].reverse();
    for (const ev of chronological) {
      if (ev.type === 'implemented' && ev.score_after != null) {
        pts.push({ score: ev.score_after, label: ev.item_title ?? 'Item completed', formula: ev.formula ?? 1 });
      }
    }

    if (pts.length === 0 && !result) return null;

    if (pts.length === 0 || pts[0].score > 5) {
      pts.unshift({ score: 0, label: 'Start', formula: pts[0]?.formula ?? 1 });
    }
    const currentScore = result?.overall_score ?? 0;
    if (pts.length === 0 || pts[pts.length - 1].score !== currentScore) {
      pts.push({ score: currentScore, label: 'Now', formula: 2 });
    }

    if (pts.length < 2) return null;
    return pts;
  })();

  $: sparklineSvg = (() => {
    const pts = scoreSparklinePoints;
    if (!pts || pts.length < 2) return null;
    const W = 280, H = 40, pad = 4;
    const coords = pts.map((p, i) => ({
      x: pad + (i / (pts.length - 1)) * (W - pad * 2),
      y: H - pad - (p.score / 100) * (H - pad * 2),
      score: p.score,
      label: p.label,
      formula: p.formula
    }));
    const firstNew = coords.findIndex(c => c.formula === 2);
    const boundaryX = firstNew > 0 && coords.slice(0, firstNew).some(c => c.formula === 1)
      ? (coords[firstNew - 1].x + coords[firstNew].x) / 2
      : null;
    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const last = coords[coords.length - 1];
    const first = coords[0];
    const fillPath = `${linePath} L${last.x.toFixed(1)},${H} L${first.x.toFixed(1)},${H} Z`;
    return { linePath, fillPath, coords, W, H, boundaryX };
  })();
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-up">

  <button type="button" on:click={onBack}
    class="flex items-center gap-2 text-[13px] text-dim hover:text-body transition-colors mb-8">
    ← Back to audit
  </button>

  {#if result}
  <div class="flex flex-col sm:flex-row items-center gap-8 mb-10 panel p-6 border-border/60">
    <div class="flex-shrink-0">
     
      <svg width="140" height="140" viewBox="0 0 92 92" role="img"
           aria-label={coverageLine(cov)}>
        <circle cx="46" cy="46" r="42" fill="none" class="stroke-border" stroke-width="6"/>
        <circle cx="46" cy="46" r="42" fill="none" stroke-width="6"
          class="score-ring stroke-amber"
          style="stroke-dashoffset: {264 - (264 * ((cov?.covered ?? 0) / (cov?.total || 1)))}"
        />
        <text x="46" y="44" text-anchor="middle" class="fill-white" font-size="22" font-weight="700" font-family="Syne, sans-serif">{cov?.covered ?? 0}</text>
        <text x="46" y="58" text-anchor="middle" class="fill-dim" font-size="8" font-family="JetBrains Mono, monospace">of {cov?.total ?? 8}</text>
      </svg>
    </div>
    <div class="text-center sm:text-left">
      <p class="label-mono mb-1">Security Assessment</p>
      <h1 class="font-display text-3xl font-bold {maturityColors[result.overall_maturity]} mb-2">
        {maturityBandLabels[result.overall_maturity]}
      </h1>
      <p class="text-sm text-body leading-relaxed max-w-sm">
        {maturityDescriptions[result.overall_maturity]}
      </p>
      <div class="flex items-center gap-4 mt-3 flex-wrap justify-center sm:justify-start">
        <span class="text-[13px] text-dim">{result.total_implemented} of {result.total_applicable} items complete</span>
  
      </div>
    </div>
  </div>

  <div class="panel p-5 mb-5">
    <p class="label-mono mb-4">By harm</p>
    <div class="space-y-3">
      {#each harmRows as row}
        <div class="flex items-center justify-between gap-4">
          <span class="text-[13px] text-body leading-snug">{row.harm}</span>
          <div class="flex items-center gap-3 flex-shrink-0">
            {#if row.covered}
              <span class="pill-amber text-xs">Covered</span>
            {/if}
            <span class="text-xs font-mono text-muted whitespace-nowrap">
              {row.done} of {row.total} done
            </span>
          </div>
        </div>
      {/each}
    </div>
    <p class="text-[13px] text-dim mt-4 leading-relaxed">{COVERED_MEANS}</p>
  </div>

  <div class="grid sm:grid-cols-2 gap-4 mb-6">
    {#if result.critical_gaps.length > 0}
    <div class="panel p-4 border-red/20">
      <p class="label-mono text-red-light mb-3">⚠ Fix these first</p>
      <div class="space-y-2">
        {#each result.critical_gaps.slice(0, 5) as item}
          <button type="button" on:click={() => onScrollToItem(item.id, item.category)}
            class="w-full text-left flex items-start gap-2 group">
            <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-red flex-shrink-0"></span>
            <span class="text-[13px] text-body group-hover:text-white transition-colors leading-relaxed">{item.title}</span>
          </button>
        {/each}
      </div>
    </div>
    {/if}
    {#if result.quick_wins.length > 0}
    <div class="panel p-4 border-amber/20">
      <p class="label-mono text-amber mb-3">⚡ Easy wins right now</p>
      <div class="space-y-2">
        {#each result.quick_wins.slice(0, 5) as item}
          <button type="button" on:click={() => onScrollToItem(item.id, item.category)}
            class="w-full text-left flex items-start gap-2 group">
            <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0"></span>
            <div>
              <span class="text-[13px] text-body group-hover:text-white transition-colors">{item.title}</span>
              <span class="ml-2 text-xs font-mono text-muted">⏱ {item.time_estimate?.setup}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
    {/if}
  </div>

  <div class="flex flex-wrap gap-3">
    <button type="button" on:click={onExport} class="btn-ghost text-xs py-2 px-4">
      {exportStatus === 'done' ? '✓ Downloaded' : '↓ Export results'}
    </button>
    <button type="button" on:click={onBack} class="btn-primary text-xs py-2 px-4">
      Continue audit →
    </button>
  </div>

  <div class="panel p-5 mt-5 border-amber/20">
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-base text-amber">◉</span>
          <p class="font-display font-semibold text-bright">Social Engineering Self-Assessment</p>
          {#if profile?.se_quiz}
            <span class="pill-teal text-xs">Done</span>
          {:else}
            <span class="pill-amber text-xs">5 min</span>
          {/if}
        </div>
        <p class="text-sm text-body leading-relaxed">
          {profile?.se_quiz
            ? `Top vulnerability: ${EMOTIONAL_REGISTER_LABELS[profile.se_quiz.top_register] ?? profile.se_quiz.top_register}. Human vulnerability items weighted accordingly.`
            : 'Discover which manipulation techniques you\'re most susceptible to. Adjusts your checklist weighting.'}
        </p>
      </div>
      <button type="button"
        on:click={onTakeQuiz}
        class="btn-ghost text-xs flex-shrink-0 py-1.5 px-3">
        {profile?.se_quiz ? 'Retake →' : 'Take quiz →'}
      </button>
    </div>
  </div>

  {#if (profile?.timeline?.length ?? 0) > 0 || sparklineSvg}
  <div class="panel p-5 mt-5">
    <div class="flex items-center justify-between mb-4">
      <p class="label-mono">Your security journey</p>
      <span class="text-[13px] text-dim">
        {result.total_implemented} item{result.total_implemented !== 1 ? 's' : ''} completed
      </span>
    </div>

    {#if sparklineSvg}
    <div class="mb-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[13px] text-dim">Score progression</span>
      </div>
      <svg viewBox="0 0 {sparklineSvg.W} {sparklineSvg.H}" class="w-full h-10 text-teal" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="currentColor" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d={sparklineSvg.fillPath} fill="url(#sparkGrad)"/>
        {#if sparklineSvg.boundaryX !== null}
          <line x1={sparklineSvg.boundaryX} y1="0" x2={sparklineSvg.boundaryX} y2={sparklineSvg.H}
                class="stroke-muted" stroke-width="1" stroke-dasharray="2 2"/>
        {/if}
        <path d={sparklineSvg.linePath} fill="none" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
        {#each sparklineSvg.coords as pt, i}
          {#if i === sparklineSvg.coords.length - 1}
            <circle cx={pt.x} cy={pt.y} r="3" fill="currentColor"/>
            <circle cx={pt.x} cy={pt.y} r="5" fill="currentColor" fill-opacity="0.2"/>
          {/if}
        {/each}
      </svg>
      {#if sparklineSvg.boundaryX !== null}
        <p class="text-[13px] text-muted mt-1.5">
          Dashed line: scoring changed. Values on each side were produced by a different scale.
        </p>
      {/if}
    </div>
    {/if}

    <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
      {#each (profile?.timeline ?? []).slice(0, 40) as ev}
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-2 h-2 rounded-full mt-1.5
                       {ev.type === 'implemented' ? 'bg-teal' :
                        ev.type === 'quiz_completed' ? 'bg-amber' :
                        ev.type === 'life_event' ? 'bg-teal-light' : 'bg-dim'}"></div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-[13px] text-body leading-snug">
                {#if ev.type === 'implemented'}✓ {ev.item_title ?? 'Item completed'}
                {:else if ev.type === 'quiz_completed'}◉ Completed social engineering assessment
                {:else if ev.type === 'life_event'}◆ {ev.life_event_label}
                {:else}{ev.note ?? ev.type}
                {/if}
              </p>
              {#if ev.type === 'implemented' && ev.score_before != null && ev.score_after != null && ev.score_after !== ev.score_before}
                <span class="text-xs font-mono text-teal-light flex-shrink-0">
                </span>
              {/if}
            </div>
            <p class="text-xs text-muted font-mono mt-0.5">
              {new Date(ev.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      {/each}
    </div>

    {#if (profile?.timeline?.length ?? 0) > 40}
      <p class="text-[13px] text-muted mt-2">Showing 40 of {profile?.timeline?.length} events</p>
    {/if}
  </div>
  {/if}

  {/if}

</div>
