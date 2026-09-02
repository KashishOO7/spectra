<script lang="ts">
  import { onMount } from 'svelte';
  import { loadProfile, deleteTimelineEvent } from '$lib/engine/store.js';
  import type { UserProfile, TimelineEvent } from '$lib/types.js';

  interface Milestone {
    label: string;
    score: number;
    icon: string;
    color: string;
  }

  const MILESTONES: Milestone[] = [
    { label: 'First step', score: 1,  icon: '○', color: 'text-teal-light' },
    { label: 'Getting started', score: 10, icon: '◎', color: 'text-teal-light' },
    { label: 'Solid baseline', score: 25, icon: '◈', color: 'text-amber-light' },
    { label: 'Well protected', score: 50, icon: '◉', color: 'text-amber-light' },
    { label: 'Hardened', score: 70, icon: '◆', color: 'text-white' },
    { label: 'Advanced', score: 85, icon: '●', color: 'text-white' },
  ];

  let profile: UserProfile | null = null;
  let loading = true;

  $: events = (profile?.timeline ?? []) as TimelineEvent[];
  $: chronological = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  $: reversed = [...chronological].reverse();


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

  $: itemsDone = events.filter(e => e.type === 'implemented').length;

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

  let confirmingDelete: string | null = null;
  async function removeEvent(id: string) {
    await deleteTimelineEvent(id);
    profile = await loadProfile();
    confirmingDelete = null;
  }
</script>

<svelte:head>
  <title>Timeline | Spectra</title>
  <meta name="description" content="Your own record of what you have completed and when, kept in your browser. Nothing is uploaded anywhere." />
  <link rel="canonical" href="https://spectra.fpszero.com/timeline" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Spectra" />
  <meta property="og:title" content="Timeline | Spectra" />
  <meta property="og:description" content="Your own record of what you have completed and when, kept in your browser. Nothing is uploaded anywhere." />
  <meta property="og:url" content="https://spectra.fpszero.com/timeline" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Timeline | Spectra" />
  <meta name="twitter:description" content="Your own record of what you have completed and when, kept in your browser. Nothing is uploaded anywhere." />
</svelte:head>

<div class="min-h-screen bg-void bg-spectra-grid">
  <div class="max-w-2xl mx-auto px-4 py-10">

    <div class="flex items-center justify-between mb-8">
      <div>
        <a href="/" class="label-mono text-dim hover:text-body transition-colors mb-2
                           inline-flex items-center py-1 min-h-[24px]">
          ← Back to home
        </a>
        <h1 class="font-display text-2xl font-bold text-white">Timeline</h1>
        <p class="text-sm text-dim mt-1">Your security journey, recorded locally.</p>
      </div>
      <a href="/audit" class="btn-ghost text-xs py-2 px-4">Continue your list →</a>
    </div>

    {#if loading}
      <div class="panel p-8 text-center">
        <p class="label-mono animate-pulse-slow">Loading timeline…</p>
      </div>

    {:else if events.length === 0}
      <div class="panel p-10 text-center">
        <p class="text-4xl mb-4 text-muted">○</p>
        <p class="font-display text-lg text-white mb-2">No history yet</p>
        <p class="text-sm text-dim mb-6">Complete items in your list to start building your timeline.</p>
        <a href="/audit" class="btn-primary text-sm py-2 px-5">Start your list →</a>
      </div>

    {:else}

      <div class="grid grid-cols-2 gap-3 mb-8">
        <div class="panel p-4 text-center">
          <p class="font-display text-2xl font-bold text-white">{itemsDone}</p>
          <p class="text-xs text-dim mt-1">items done</p>
        </div>
        <div class="panel p-4 text-center">
          <p class="font-display text-2xl font-bold text-white">{daysActive}</p>
          <p class="text-xs text-dim mt-1">{daysActive === 1 ? 'day' : 'days'} active</p>
        </div>
      </div>


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
                  <div class="flex items-start gap-3 rounded-lg border px-3 py-2.5 {eventColor(ev.type)}">
                    <span class="font-mono text-xs w-4 flex-shrink-0 mt-0.5">{eventIcon(ev.type)}</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-sans leading-snug">{eventLabel(ev)}</p>
                      {#if ev.note && ev.type !== 'life_event'}
                        <p class="text-sm text-muted mt-0.5 truncate">{ev.note}</p>
                      {/if}
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span class="text-xs font-mono text-muted">{formatTime(ev.timestamp)}</span>
                      {#if confirmingDelete === ev.id}
                        <button type="button" on:click={() => removeEvent(ev.id)}
                          class="text-sm text-red-light hover:opacity-80 transition-opacity">Delete</button>
                        <button type="button" on:click={() => confirmingDelete = null}
                          class="text-sm text-muted hover:text-body transition-colors">Keep</button>
                      {:else}
                        <button type="button" on:click={() => confirmingDelete = ev.id}
                          class="text-xs text-muted hover:text-red-light transition-colors"
                          aria-label="Remove this entry from your timeline">✕</button>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <p class="text-sm text-muted text-center mt-6 leading-relaxed">
        All timeline data is stored locally in your browser. Nothing is sent anywhere.
        <a href="/audit" class="text-amber-light hover:underline ml-1">Export a backup →</a>
      </p>

    {/if}
  </div>
</div>