<script lang="ts">
  import type { ContentGraph } from '$lib/types.js';
  import { INCIDENT_PLAYBOOKS } from '$lib/audit/playbooks.js';
  import { categoryLabel } from '$lib/audit/helpers.js';
  import note from '#spectra-wiki/page/incident';
  import { text } from '$lib/wiki/page.js';
  import Glossed from '$lib/components/Glossed.svelte';
  import GlossScope from '$lib/components/GlossScope.svelte';


  export let incidentScenario: string | null;
  export let isSimpleMode: boolean;
  export let graph: ContentGraph;
  export let implemented: Record<string, boolean>;
  export let onScrollToItem: (id: string, category?: string) => void;
  export let onToChecklist: () => void;

  $: isImplemented = (id: string) => !!implemented[id];
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">

  {#if !incidentScenario}
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-3">{text(note, 'heading')}</h1>
      <p class="text-body">
        {text(note, 'lead')}
      </p>
    </div>

    <div class="grid gap-3 mb-8">
      {#each INCIDENT_PLAYBOOKS as pb}
        <button type="button"
          on:click={() => incidentScenario = pb.id}
          class="panel text-left p-5 hover:border-teal transition-colors duration-150 group">
          <div class="flex items-center gap-4">
            <div class="flex-1 min-w-0">
              <h2 class="text-lg font-semibold text-bright mb-1">{pb.title}</h2>
              <p class="text-sm text-dim">{pb.subtitle}</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"
                 stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 text-teal">
              <path d="M6 3.5 10.5 8 6 12.5"/>
            </svg>
          </div>
        </button>
      {/each}
    </div>

    <button type="button" on:click={onToChecklist} class="btn-ghost">
      {text(note, 'skip')}
    </button>

  {:else}
    {@const pb = INCIDENT_PLAYBOOKS.find(p => p.id === incidentScenario)}
    {#if pb}

    <button type="button"
      on:click={() => incidentScenario = null}
      class="inline-flex items-center min-h-[44px] text-sm text-body hover:text-bright transition-colors mb-4">
      {text(note, 'back-to-scenarios')}
    </button>

    <div class="mb-6">
      <h1 class="text-3xl font-bold text-white mb-2">{pb.title}</h1>
      <p class="text-body">{pb.subtitle}</p>
    </div>

    <GlossScope>
    <div class="border border-muted bg-surface-2 rounded-2xl p-5 mb-6 flex items-start gap-3">
      <span class="flex-shrink-0 flex items-center h-[1.6em] text-base" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" class="text-bright">
          <circle cx="8" cy="8" r="6.5"/><path d="m5.8 5.8 4.4 4.4m0-4.4-4.4 4.4"/>
        </svg>
      </span>
      <p class="text-base text-bright"><Glossed text={pb.doNotText} /></p>
    </div>

    <div class="panel p-5 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 class="text-lg font-semibold text-bright">{text(note, 'right-now')}</h2>
        <div class="flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1">
          <button type="button"
            on:click={() => isSimpleMode = true}
            aria-pressed={isSimpleMode}
            class="px-4 min-h-[36px] text-sm font-semibold rounded-full transition-colors duration-150
                   {isSimpleMode ? 'bg-surface text-bright shadow-sm' : 'text-body hover:text-bright'}">
            {text(note, 'plain')}
          </button>
          <button type="button"
            on:click={() => isSimpleMode = false}
            aria-pressed={!isSimpleMode}
            class="px-4 min-h-[36px] text-sm font-semibold rounded-full transition-colors duration-150
                   {!isSimpleMode ? 'bg-surface text-bright shadow-sm' : 'text-body hover:text-bright'}">
            {text(note, 'technical')}
          </button>
        </div>
      </div>
      <ol class="space-y-4">
        {#each (isSimpleMode ? pb.simpleSteps : pb.immediateSteps) as step, i}
          <li class="flex items-start gap-4">
            <span class="flex-shrink-0 w-7 h-7 rounded-full bg-teal-dim
                         flex items-center justify-center text-sm text-bright font-semibold tabular-nums">
              {i + 1}
            </span>
            <p class="text-base text-body"><Glossed text={step} /></p>
          </li>
        {/each}
      </ol>
    </div>
    </GlossScope>

    {#if pb.relatedItemIds.length > 0}
    <div class="panel p-5 mb-6">
      <h2 class="text-lg font-semibold text-bright mb-3">{text(note, 'once-safe')}</h2>
      <div class="space-y-2">
        {#each pb.relatedItemIds as id}
          {@const item = graph.items.get(id)}
          {#if item}
            <button type="button"
              on:click={() => onScrollToItem(id, item.category)}
              class="w-full text-left flex items-center gap-3 p-3 min-h-[48px] rounded-xl border border-border
                     hover:border-teal transition-colors group">
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
                <span class="text-xs text-muted ml-2">
                  {categoryLabel(item.category)}
                </span>
              </div>
              {#if isImplemented(id)}
                <span class="text-sm text-teal-light flex-shrink-0">{text(note, 'done')}</span>
              {:else}
                <span class="text-sm text-dim group-hover:text-teal-light flex-shrink-0 transition-colors">
                  {text(note, 'open')}
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
        class="btn-primary">
        {text(note, 'continue')}
      </button>
      <button type="button"
        on:click={() => incidentScenario = null}
        class="btn-ghost">
        {text(note, 'back')}
      </button>
    </div>

    {/if}
  {/if}

</div>
