<script lang="ts">
  import { onMount } from 'svelte';
  import { loadProfile, deleteTimelineEvent } from '$lib/engine/store.js';
  import { assessFromAnywhere, invalidateAssessment } from '$lib/engine/lazyAssessment.js';
  import type { UserProfile, TimelineEvent } from '$lib/types.js';
  import note from '#spectra-wiki/page/timeline';
  import { text, lines, link, pieces, named } from '$lib/wiki/page.js';
  import BackLink from '$lib/components/BackLink.svelte';
  import chrome from '#spectra-wiki/page/header-and-footer';

  const title = text(note, 'title');
  const description = text(note, 'description');
  const playbook = { href: '/audit', name: named(chrome, 'back-names').list };
  const continueList = link(note, 'continue');
  const emptyStart = link(note, 'empty-start');
  const [storedLocally] = lines(note, 'stored-locally');


  let profile: UserProfile | null = null;
  let stepsDone = 0;
  let loading = true;

  $: events = (profile?.timeline ?? []) as TimelineEvent[];
  $: chronological = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  $: reversed = [...chronological].reverse();


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
      import: '↑',
    };
    return icons[type] ?? '·';
  }

  function eventColor(type: TimelineEvent['type']): string {
    const colors: Record<string, string> = {
      implemented: 'text-teal-light border-teal/30 bg-teal-dim/10',
      skipped: 'text-dim border-border',
      unskipped: 'text-dim border-border',
      unimplemented: 'text-bright border-muted/20 bg-surface-2/5',
      life_event: 'text-teal-light border-teal/30 bg-teal-dim/10',
      se_quiz: 'text-teal-light border-teal/30 bg-teal-dim/10',
      quiz_completed: 'text-teal-light border-teal/30 bg-teal-dim/10',
      score_milestone: 'text-white border-border',
      profile_updated: 'text-dim border-border',
      import: 'text-teal-light border-teal/30',
      clear: 'text-bright border-muted/20',
    };
    return colors[type] ?? 'text-body border-border';
  }

  const STEP_EVENTS = ['implemented', 'unimplemented', 'skipped', 'unskipped'];
  const DID: Record<string, string> = Object.fromEntries(STEP_EVENTS.map(t => [t, text(note, `event-${t}`)]));

  function eventLabel(ev: TimelineEvent): string {
    switch (ev.type) {
      case 'implemented':
      case 'unimplemented':
      case 'skipped':
      case 'unskipped':        return ev.item_title ?? ev.item_id ?? text(note, 'a-step');
      case 'life_event':       return ev.life_event_label ?? ev.note ?? text(note, 'event-life');
      case 'se_quiz':          return ev.item_title ?? text(note, 'event-quiz');
      case 'quiz_completed':   return text(note, 'event-quiz');
      case 'score_milestone':  return ev.note ?? text(note, 'event-milestone');
      case 'profile_updated':  return ev.note ?? text(note, 'event-profile');
      case 'import':           return text(note, 'event-import');
      case 'clear':            return text(note, 'event-clear');
      default:                 return ev.note ?? ev.type;
    }
  }

  function hrefOf(ev: TimelineEvent): string | null {
    if (ev.href) return ev.href;
    if (ev.item_id && STEP_EVENTS.includes(ev.type)) return `/checklist/${ev.item_id}`;
    if (ev.type === 'quiz_completed') return '/quiz';
    return null;
  }
  const FROM: Record<string, string> = { '/real-or-scam': text(note, 'from-game'), '/quiz': text(note, 'from-quiz') };

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
    invalidateAssessment();
    stepsDone = (await assessFromAnywhere())?.total_implemented ?? 0;
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
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://spectra.fpszero.com/timeline" />
</svelte:head>

<div class="min-h-screen bg-void bg-spectra-grid">
  <div class="max-w-2xl mx-auto px-4 py-10">

    <div class="flex items-center justify-between mb-8">
      <div>
        <BackLink parent={playbook} class="text-sm text-dim hover:text-body transition-colors mb-2
                           inline-flex items-center py-1 min-h-[24px]" />
        <h1 class="text-3xl font-bold text-white">{text(note, 'heading')}</h1>
        <p class="text-sm text-dim mt-1">{text(note, 'lead')}</p>
      </div>
      <a href={continueList.href} class="btn-ghost btn-sm">{continueList.text}</a>
    </div>

    {#if loading}
      <div class="panel p-8 text-center">
        <p class="label-mono animate-pulse-slow">{text(note, 'loading')}</p>
      </div>

    {:else if events.length === 0}
      <div class="panel p-10 text-center">
        <p class="text-lg text-white mb-2">{text(note, 'empty-heading')}</p>
        <p class="text-sm text-dim mb-6">{text(note, 'empty')}</p>
        <a href={emptyStart.href} class="btn-primary text-sm py-2 px-5">{emptyStart.text}</a>
      </div>

    {:else}

      <div class="grid grid-cols-2 gap-3 mb-8">
        <div class="panel p-4 text-center">
          <p class="text-2xl font-bold text-white" data-steps-done>{stepsDone}</p>
          <p class="text-xs text-dim mt-1">{text(note, 'items-done')}</p>
        </div>
        <div class="panel p-4 text-center">
          <p class="text-2xl font-bold text-white">{daysActive}</p>
          <p class="text-xs text-dim mt-1">{daysActive === 1 ? text(note, 'day-active') : text(note, 'days-active')}</p>
        </div>
      </div>


      <div class="panel p-5">
        <p class="label-mono mb-5">{text(note, 'event-log')} <span class="text-muted normal-case font-sans text-xs ml-1">{#each pieces(note, 'event-count', { count: events.length }) as piece}{piece}{/each}</span></p>

        <div class="space-y-6">
          {#each groupedByDate as group}
            <div>
              <p class="text-xs text-muted mb-3 sticky top-0 bg-surface/90 py-1 -mx-1 px-1 backdrop-blur-sm">
                {group.date}
              </p>
              <div class="space-y-2">
                {#each group.events as ev}
                  <div class="flex items-start gap-3 rounded-xl border px-3 py-2.5 {eventColor(ev.type)}">
                    <span class="text-xs w-4 flex-shrink-0 mt-0.5">{eventIcon(ev.type)}</span>
                    <div class="flex-1 min-w-0">
                      {#if hrefOf(ev)}
                        <a href={hrefOf(ev)} data-journey-link class="text-sm font-sans leading-snug link-inline">{eventLabel(ev)}</a>
                      {:else}
                        <p class="text-sm font-sans leading-snug">{eventLabel(ev)}</p>
                      {/if}
                      {#if ev.href && FROM[ev.href]}<p class="text-xs text-dim mt-0.5">{FROM[ev.href]}</p>{/if}
                      {#if DID[ev.type]}<p class="text-xs text-dim mt-0.5" data-did>{DID[ev.type]}</p>{/if}
                      {#if ev.note && ev.type !== 'life_event'}
                        <p class="text-sm text-muted mt-0.5 truncate">{ev.note}</p>
                      {/if}
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span class="text-xs text-muted">{formatTime(ev.timestamp)}</span>
                      {#if confirmingDelete === ev.id}
                        <button type="button" on:click={() => removeEvent(ev.id)}
                          class="text-sm text-bright hover:opacity-80 transition-opacity">{text(note, 'delete')}</button>
                        <button type="button" on:click={() => confirmingDelete = null}
                          class="text-sm text-muted hover:text-body transition-colors">{text(note, 'keep')}</button>
                      {:else}
                        <button type="button" on:click={() => confirmingDelete = ev.id}
                          class="text-xs text-muted hover:text-bright transition-colors"
                          aria-label={text(note, 'remove-entry')}>✕</button>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <p class="text-sm text-muted text-center mt-6 leading-relaxed">{#each storedLocally as p}{#if p.kind === 'link'}<a href={p.href} class="text-teal-light link-inline ml-1">{p.value}</a>{:else}{p.value}{/if}{/each}</p>

    {/if}
  </div>
</div>