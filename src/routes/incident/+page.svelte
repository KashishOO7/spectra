<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types.js';
  import type { ContentGraph } from '$lib/types.js';
  import { loadProfile } from '$lib/engine/store.js';
  import { deserializeGraph } from '$lib/content/deserialize.js';
  import IncidentView from '$lib/components/audit/IncidentView.svelte';

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

  function toChecklist() {
    void goto('/audit');
  }
</script>

<svelte:head>
  <title>Something happened | Spectra</title>
  <meta name="description" content="Hacked, stolen, or something feels wrong? Start here." />
  <link rel="canonical" href="https://spectra.fpszero.com/incident" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Spectra" />
  <meta property="og:title" content="Something happened | Spectra" />
  <meta property="og:description" content="Hacked, stolen, or something feels wrong? Start here." />
  <meta property="og:url" content="https://spectra.fpszero.com/incident" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Something happened | Spectra" />
  <meta name="twitter:description" content="Hacked, stolen, or something feels wrong? Start here." />
</svelte:head>

<IncidentView
  bind:incidentScenario
  bind:isSimpleMode
  {graph}
  {implemented}
  onScrollToItem={toItem}
  onToChecklist={toChecklist} />
