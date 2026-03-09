<script lang="ts">
  import { onMount } from 'svelte';
  import { loadProfile } from '$lib/engine/store.js';
  import type { UserProfile, TimelineEvent } from '$lib/types.js';

  interface Milestone {
    label: string;
    score: number;
    icon: string;
    color: string;
  }

  const MILESTONES: Milestone[] = [
    { label: 'First step', score: 1,  icon: '🌱', color: 'text-teal-light' },
    { label: 'Getting started', score: 10, icon: '🔑', color: 'text-teal-light' },
    { label: 'Solid baseline', score: 25, icon: '🛡', color: 'text-amber-light' },
    { label: 'Well protected', score: 50, icon: '⚡', color: 'text-amber-light' },
    { label: 'Hardened', score: 70, icon: '🔒', color: 'text-white' },
    { label: 'Advanced', score: 85, icon: '🏆', color: 'text-white' },
  ];

  let profile: UserProfile | null = null;
  let loading = true;

  // Derived state
  $: events = (profile?.timeline ?? []) as TimelineEvent[];
  $: chronological = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  $: reversed = [...chronological].reverse();

  // Sparkline: score progression over time
  $: sparklinePoints = (() => {
    const scored = chronological.filter(e => Number.isFinite(e.score_after));
    if (scored.length < 2) return [];
    return scored.map(e => e.score_after as number);
  })();

  $: sparklineSvg = (() => {
    if (sparklinePoints.length < 2) return '';
    const w = 300, h = 60, pad = 4;
    const max = Math.max(...sparklinePoints, 1);
    const xs = sparklinePoints.map((_, i) => pad + (i / (sparklinePoints.length - 1)) * (w - 2 * pad));
    const ys = sparklinePoints.map(v => h - pad - ((v / max) * (h - 2 * pad)));
    const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
    const fill = `${path} L${xs[xs.length-1].toFixed(1)},${h} L${xs[0].toFixed(1)},${h} Z`;
    return { path, fill, w, h };
  })();

  // Current score (latest score_after in timeline)
  $: currentScore = (() => {
    const scored = chronological.filter(e => Number.isFinite(e.score_after));
    return scored.length > 0 ? (scored[scored.length - 1].score_after as number) : 0;
  })();

  // Milestones crossed
  $: crossedMilestones = (() => {
    const result: Array<{ milestone: Milestone; event: TimelineEvent }> = [];
    let prevScore = 0;
    for (const ev of chronological) {
      if (!Number.isFinite(ev.score_after)) continue;
      const score = ev.score_after as number;
      for (const m of MILESTONES) {
        if (prevScore < m.score && score >= m.score) {
          result.push({ milestone: m, event: ev });
        }
      }
      prevScore = score;
    }
    return result;
  })();

  // Total score delta from all implemented items
  $: totalGained = (() => {
    return chronological
      .filter(e => e.type === 'implemented' && Number.isFinite(e.score_before) && Number.isFinite(e.score_after))
      .reduce((sum, e) => sum + ((e.score_after ?? 0) - (e.score_before ?? 0)), 0);
  })();

  // Items completed count
  $: itemsDone = events.filter(e => e.type === 'implemented').length;

  // Days active
  $: daysActive = (() => {
    if (chronological.length === 0) return 0;
    const first = new Date(chronological[0].timestamp);
    const last = new Date(chronological[chronological.length - 1].timestamp);
    return Math.max(1, Math.round((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  })();

  function formatDate(ts: string | undefined): string {
    if (!ts) return '—';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatTime(ts: string): string {
    if (!ts) return '—';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  function scoreDeltaLabel(ev: TimelineEvent): string {
    if (!Number.isFinite(ev.score_before) || !Number.isFinite(ev.score_after)) return '';
    const before = ev.score_before as number;
    const after  = ev.score_after  as number;
    const delta  = after - before;
    if (delta > 0) return `+${delta.toFixed(1)}pts`;
    if (delta < 0) return `${delta.toFixed(1)}pts`;
    return '';
  }

  function eventIcon(type: TimelineEvent['type']): string {
    const icons: Record<string, string> = {
      implemented: '✓',
      skipped: '→',
      unskipped: '←',
      unimplemented: '✗',
      life_event: '◈',
      se_quiz: '◉',
      quiz_completed: '◉',
      score_milestone: '⬡',
      profile_updated: '◦',
      import: '↑',
      clear: '⊘',
    };
    return icons[type] ?? '·';
  }

  function eventColor(type: TimelineEvent['type']): string {
    const colors: Record<string, string> = {
      implemented: 'text-teal-light border-teal/30 bg-teal-dim/10',
      skipped: 'text-dim border-border',
      unskipped: 'text-dim border-border',
      unimplemented: 'text-red-light border-red/20 bg-red-dim/5',
      life_event: 'text-amber-light border-amber/30 bg-amber-dim/10',
      se_quiz: 'text-amber-light border-amber/30 bg-amber-dim/10',
      quiz_completed: 'text-amber-light border-amber/30 bg-amber-dim/10',
      score_milestone: 'text-white border-border',
      profile_updated: 'text-dim border-border',
      import: 'text-teal-light border-teal/30',
      clear: 'text-red-light border-red/20',
    };
    return colors[type] ?? 'text-body border-border';
  }

  function eventLabel(ev: TimelineEvent): string {
    switch (ev.type) {
      case 'implemented':      return ev.item_title ?? ev.item_id ?? 'Item completed';
      case 'unimplemented':    return ev.item_title ?? ev.item_id ?? 'Item un-checked';
      case 'skipped':          return ev.item_title ?? ev.item_id ?? 'Item skipped';
      case 'unskipped':        return ev.item_title ?? ev.item_id ?? 'Item unskipped';
      case 'life_event':       return ev.life_event_label ?? ev.note ?? 'Life event applied';
      case 'se_quiz':
      case 'quiz_completed':   return 'Social engineering quiz completed';
      case 'score_milestone':  return ev.note ?? 'Score milestone reached';
      case 'profile_updated':  return ev.note ?? 'Profile updated';
      case 'import':           return 'Profile imported';
      case 'clear':            return 'All data cleared';
      default:                 return ev.note ?? ev.type;
    }
  }

  // Group reversed events by date for display
  $: groupedByDate = (() => {
    const groups: Array<{ date: string; events: TimelineEvent[] }> = [];
    let currentDate = '';
    for (const ev of reversed) {
      const d = formatDate(ev.timestamp);
      if (d !== currentDate) {
        groups.push({ date: d, events: [] });
        currentDate = d;
      }
      groups[groups.length - 1].events.push(ev);
    }
    return groups;
  })();

  onMount(async () => {
    profile = await loadProfile();
    loading = false;
  });
</script>

<svelte:head>
  <title>Security Timeline — Spectra</title>
</svelte:head>

<div class="min-h-screen bg-void bg-spectra-grid">
  <div class="max-w-2xl mx-auto px-4 py-10">

    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <a href="/" class="label-mono text-dim hover:text-body transition-colors mb-2 inline-block">
          ← Back to home
        </a>
        <h1 class="font-display text-2xl font-bold text-white">Security Timeline</h1>
        <p class="text-sm text-dim font-mono mt-1">Your security journey, recorded locally.</p>
      </div>
      <a href="/audit" class="btn-ghost text-xs py-2 px-4">Continue audit →</a>
    </div>

    {#if loading}
      <div class="panel p-8 text-center">
        <p class="label-mono animate-pulse-slow">Loading timeline…</p>
      </div>

    {:else if events.length === 0}
      <div class="panel p-10 text-center">
        <p class="text-4xl mb-4">📋</p>
        <p class="font-display text-lg text-white mb-2">No history yet</p>
        <p class="text-sm text-dim font-mono mb-6">Complete items in your audit to start building your timeline.</p>
        <a href="/audit" class="btn-primary text-sm py-2 px-5">Start your audit →</a>
      </div>

    {:else}

      <!-- Stats strip -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <div class="panel p-4 text-center">
          <p class="font-display text-2xl font-bold
            {currentScore > 65 ? 'text-teal-light' : currentScore > 35 ? 'text-amber-light' : 'text-red-light'}">
            {currentScore}
          </p>
          <p class="label-mono mt-1">current score</p>
        </div>
        <div class="panel p-4 text-center">
          <p class="font-display text-2xl font-bold text-white">{itemsDone}</p>
          <p class="label-mono mt-1">items done</p>
        </div>
        <div class="panel p-4 text-center">
          <p class="font-display text-2xl font-bold text-white">{daysActive}</p>
          <p class="label-mono mt-1">{daysActive === 1 ? 'day' : 'days'} active</p>
        </div>
      </div>

      <!-- Sparkline -->
      {#if sparklinePoints.length >= 2 && typeof sparklineSvg === 'object'}
        <div class="panel p-5 mb-8">
          <p class="label-mono mb-4">Score progression</p>
          <svg viewBox="0 0 {sparklineSvg.w} {sparklineSvg.h}" class="w-full h-16" preserveAspectRatio="none">
            <defs>
              <linearGradient id="tlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#3dbfbf" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#3dbfbf" stop-opacity="0.02"/>
              </linearGradient>
            </defs>
            <path d={sparklineSvg.fill} fill="url(#tlGrad)"/>
            <path d={sparklineSvg.path} fill="none" stroke="#3dbfbf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="flex justify-between mt-2">
            <span class="text-xs font-mono text-muted">
              {formatDate(chronological.find(e => Number.isFinite(e.score_after))?.timestamp)}
            </span>
            <span class="text-xs font-mono text-teal-light">+{totalGained.toFixed(1)} pts total</span>
          </div>
        </div>
      {/if}

      <!-- Milestones -->
      {#if crossedMilestones.length > 0}
        <div class="panel p-5 mb-8">
          <p class="label-mono mb-4">Milestones</p>
          <div class="flex flex-wrap gap-3">
            {#each crossedMilestones as { milestone, event }}
              <div class="flex items-center gap-2 bg-void border border-border rounded-lg px-3 py-2">
                <span class="text-lg">{milestone.icon}</span>
                <div>
                  <p class="text-xs font-sans {milestone.color} font-medium">{milestone.label}</p>
                  <p class="text-xs font-mono text-muted">{formatDate(event.timestamp)}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Event log grouped by date -->
      <div class="panel p-5">
        <p class="label-mono mb-5">Event log <span class="text-muted normal-case font-sans text-xs ml-1">({events.length} events)</span></p>

        <div class="space-y-6">
          {#each groupedByDate as group}
            <div>
              <p class="text-xs font-mono text-muted mb-3 sticky top-0 bg-surface/90 py-1 -mx-1 px-1 backdrop-blur-sm">
                {group.date}
              </p>
              <div class="space-y-2">
                {#each group.events as ev}
                  {@const delta = scoreDeltaLabel(ev)}
                  <div class="flex items-start gap-3 rounded-lg border px-3 py-2.5 {eventColor(ev.type)}">
                    <span class="font-mono text-xs w-4 flex-shrink-0 mt-0.5">{eventIcon(ev.type)}</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-sans leading-snug">{eventLabel(ev)}</p>
                      {#if ev.note && ev.type !== 'life_event'}
                        <p class="text-xs font-mono text-muted mt-0.5 truncate">{ev.note}</p>
                      {/if}
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      {#if delta}
                        <span class="text-xs font-mono
                          {delta.startsWith('+') ? 'text-teal-light' : 'text-red-light'}">
                          {delta}
                        </span>
                      {/if}
                      <span class="text-xs font-mono text-muted">{formatTime(ev.timestamp)}</span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Footer note -->
      <p class="text-xs font-mono text-muted text-center mt-6 leading-relaxed">
        All timeline data is stored locally in your browser. Nothing is sent anywhere.
        <a href="/audit" class="text-amber-light hover:underline ml-1">Export a backup →</a>
      </p>

    {/if}
  </div>
</div>