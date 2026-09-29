<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types.js';
  import type { ContentGraph } from '$lib/types.js';
  import { loadProfile } from '$lib/engine/store.js';
  import { deserializeGraph } from '$lib/content/deserialize.js';
  import IncidentView from '$lib/components/audit/IncidentView.svelte';
  import note from '#spectra-wiki/page/incident';
  import { text } from '$lib/wiki/page.js';

  export let data: PageData;

  let incidentScenario: string | null = null;
  let isSimpleMode = true;

  let implemented: Record<string, boolean> = {};

  $: graph = deserializeGraph(data.graph);

  onMount(async () => {
    const profile = await loadProfile();
    implemented = profile?.implemented ?? {};
  });

  function toItem(id: string) {
    void goto(`/audit?highlight=${encodeURIComponent(id)}`);
  }

  const title = text(note, 'title');
  const description = text(note, 'description');

  function toChecklist() {
    void goto('/audit');
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href="https://spectra.fpszero.com/incident" />
</svelte:head>

<IncidentView
  bind:incidentScenario
  bind:isSimpleMode
  {graph}
  {implemented}
  onScrollToItem={toItem}
  onToChecklist={toChecklist} />
