<script lang="ts">
  import { setContext } from 'svelte';
  import { GLOSS_SCOPE, glossScope } from '$lib/audit/glossScope.js';

  export let step: string | undefined = undefined;
  setContext(GLOSS_SCOPE, glossScope(step));
</script>

<slot />
