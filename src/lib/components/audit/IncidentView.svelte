<script lang="ts">
  import type { ContentGraph } from '$lib/types.js';
  import { INCIDENT_PLAYBOOKS } from '$lib/audit/playbooks.js';
  import { categoryLabel } from '$lib/audit/helpers.js';

  export let incidentScenario: string | null;   
  export let isSimpleMode: boolean;              
  export let graph: ContentGraph;
  export let implemented: Record<string, boolean>;
  export let onScrollToItem: (id: string, category?: string) => void;
  export let onToChecklist: () => void;

  $: isImplemented = (id: string) => !!implemented[id];
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-up">

  {#if !incidentScenario}
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-red-light text-xl">⚠</span>
        <h1 class="font-display text-2xl font-bold text-white">Something happened</h1>
      </div>
      <p class="text-body text-sm">
        What happened? Select the closest match — you'll get immediate steps for right now.
      </p>
    </div>

    <div class="grid gap-2.5 mb-8">
      {#each INCIDENT_PLAYBOOKS as pb}
        <button type="button"
          on:click={() => incidentScenario = pb.id}
          class="panel text-left p-5 hover:border-red/40 transition-all duration-150 group
                 {pb.severity === 'critical' ? 'border-red/20' : 'border-border'}">
          <div class="flex items-start gap-4">
            <span class="text-2xl flex-shrink-0">{pb.icon}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h2 class="font-display font-semibold text-bright group-hover:text-white transition-colors">
                  {pb.title}
                </h2>
                <span class="pill-{pb.severity === 'critical' ? 'red' : 'amber'} text-xs">
                  {pb.severity === 'critical' ? 'Critical' : 'High'}
                </span>
              </div>
              <p class="text-sm text-dim">{pb.subtitle}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                 stroke-width="1.5" class="flex-shrink-0 text-dim group-hover:text-body mt-1 transition-colors">
              <path d="M4 8h8M9 5l3 3-3 3"/>
            </svg>
          </div>
        </button>
      {/each}
    </div>

    <button type="button" on:click={onToChecklist} class="btn-ghost text-sm">
      Skip triage — go to full audit
    </button>

  {:else}
    {@const pb = INCIDENT_PLAYBOOKS.find(p => p.id === incidentScenario)}
    {#if pb}

    <button type="button"
      on:click={() => incidentScenario = null}
      class="flex items-center gap-2 text-[13px] text-dim hover:text-body transition-colors mb-8">
      ← Back to scenarios
    </button>

    <div class="flex items-start gap-4 mb-6">
      <span class="text-3xl flex-shrink-0">{pb.icon}</span>
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 class="font-display text-2xl font-bold text-white">{pb.title}</h1>
          <span class="pill-{pb.severity === 'critical' ? 'red' : 'amber'}">
            {pb.severity === 'critical' ? 'Critical' : 'High'}
          </span>
        </div>
        <p class="text-sm text-dim">{pb.subtitle}</p>
      </div>
    </div>

    <div class="border border-red/30 bg-red-dim/10 rounded-lg p-4 mb-6 flex items-start gap-3">
      <span class="text-red-light flex-shrink-0 text-sm">✕</span>
      <p class="text-sm text-red-light leading-relaxed">{pb.doNotText}</p>
    </div>

    <div class="panel p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <p class="label-mono text-amber">Do these right now</p>
        <div class="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
          <button type="button"
            on:click={() => isSimpleMode = true}
            class="px-3 py-1 text-[13px] rounded-md transition-colors duration-150
                   {isSimpleMode ? 'bg-amber/20 text-amber-light' : 'text-dim hover:text-body'}">
            Plain English
          </button>
          <button type="button"
            on:click={() => isSimpleMode = false}
            class="px-3 py-1 text-[13px] rounded-md transition-colors duration-150
                   {!isSimpleMode ? 'bg-amber/20 text-amber-light' : 'text-dim hover:text-body'}">
            Technical
          </button>
        </div>
      </div>
      <ol class="space-y-4">
        {#each (isSimpleMode ? pb.simpleSteps : pb.immediateSteps) as step, i}
          <li class="flex items-start gap-4">
            <span class="flex-shrink-0 w-6 h-6 rounded-full border border-amber/40 bg-amber-dim/20
                         flex items-center justify-center text-xs font-mono text-amber-light font-semibold">
              {i + 1}
            </span>
            <p class="text-sm text-body leading-relaxed pt-0.5">{step}</p>
          </li>
        {/each}
      </ol>
    </div>

    {#if pb.relatedItemIds.length > 0}
    <div class="panel p-5 mb-6">
      <p class="text-xs tracking-wide text-dim mb-3">Once you're stable — do these too</p>
      <div class="space-y-2">
        {#each pb.relatedItemIds as id}
          {@const item = graph.items.get(id)}
          {#if item}
            <button type="button"
              on:click={() => onScrollToItem(id, item.category)}
              class="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-border
                     hover:border-amber/30 hover:bg-amber-dim/5 transition-colors group">
              <div class="w-4 h-4 rounded border flex-shrink-0
                           {isImplemented(id)
                             ? 'bg-teal border-teal flex items-center justify-center'
                             : 'border-muted'}">
                {#if isImplemented(id)}
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L2.8 5L7 1" stroke="white" stroke-width="1.3" stroke-linecap="round"/>
                  </svg>
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-sm text-body group-hover:text-white transition-colors font-sans">
                  {item.title}
                </span>
                <span class="text-[11px] text-muted ml-2">
                  {categoryLabel(item.category)}
                </span>
              </div>
              {#if isImplemented(id)}
                <span class="text-[13px] text-teal-light flex-shrink-0">Done ✓</span>
              {:else}
                <span class="text-[13px] text-dim group-hover:text-amber-light flex-shrink-0 transition-colors">
                  Open →
                </span>
              {/if}
            </button>
          {/if}
        {/each}
      </div>
    </div>
    {/if}

    <div class="flex flex-wrap gap-3">
      <button type="button"
        on:click={() => { incidentScenario = null; onToChecklist(); }}
        class="btn-primary text-sm">
        Continue to full audit →
      </button>
      <button type="button"
        on:click={() => incidentScenario = null}
        class="btn-ghost text-sm">
        Back to scenarios
      </button>
    </div>

    {/if}
  {/if}

</div>
