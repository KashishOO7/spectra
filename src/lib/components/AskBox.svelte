<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import note from '#spectra-wiki/page/ask-box';
  import { text } from '$lib/wiki/page.js';
  import { sendAsk } from '$lib/nav/ask.js';

  export let where: 'incident';

  let question = '';
  let input: HTMLInputElement;
  let empty = false;
  const id = `ask-${where}`;

  let ready = false;
  onMount(() => { ready = true; });

  function submit() {
    if (question.trim().length < 2) { empty = true; input?.focus(); return; }
    empty = false;
    sendAsk(question);
    void goto('/audit');
  }
</script>

<form class="panel p-4 sm:p-5 border-2 border-teal" role="search" on:submit|preventDefault={submit} data-ask-box={where}>
  <label for={id} class="block text-lg font-semibold text-bright mb-3">
    {text(note, 'label-incident')}
  </label>
  <div class="flex flex-wrap items-center gap-3">
    <div class="relative flex-1 min-w-[min(20rem,100%)]">
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"
           stroke-linecap="round" class="absolute left-4 top-1/2 -translate-y-1/2 text-dim pointer-events-none" aria-hidden="true">
        <circle cx="7" cy="7" r="5"/><path d="M11 11l4 4"/>
      </svg>
      <input {id} bind:this={input} bind:value={question} type="text" autocomplete="off" readonly={!ready}
        aria-describedby={empty ? `${id}-empty` : undefined}
        placeholder={text(note, 'placeholder-incident')}
        class="w-full min-h-[48px] pl-11 pr-4 bg-surface border border-border rounded-xl text-base text-body placeholder-dim"/>
    </div>
    <button type="submit" disabled={!ready} class="btn-primary disabled:opacity-60 disabled:cursor-wait">{text(note, 'button')}</button>
  </div>
  {#if empty}
    <p id="{id}-empty" class="text-sm text-body mt-2">{text(note, 'empty')}</p>
  {/if}
</form>
