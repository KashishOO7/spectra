<script lang="ts">
  import { getContext, onDestroy } from 'svelte';
  import { GLOSSARY_TERMS, type GlossaryEntry } from '$lib/audit/glossary.js';
  import { GLOSS_SCOPE, type GlossScope } from '$lib/audit/glossScope.js';

  const scope = getContext<GlossScope | undefined>(GLOSS_SCOPE);
  const id = scope ? scope.next() : -1;
  const claims = scope?.claims;

  export let text: string;
  export let gloss: boolean = true;

  type Part = { kind: 'text'; value: string } | { kind: 'term'; value: string; entry: GlossaryEntry };

  function termsIn(source: string): Set<string> {
    const out = new Set<string>();
    for (const part of split(source, new Set(scope?.skip ?? []))) if (part.kind === 'term') out.add(part.entry.term);
    return out;
  }

  function earlier(all: Map<number, Set<string>> | undefined): Set<string> {
    const out = new Set<string>();
    for (const [other, terms] of all ?? []) if (other < id) for (const t of terms) out.add(t);
    return out;
  }

  $: if (claims) claims.update(all => new Map(all).set(id, gloss ? termsIn(text ?? '') : new Set()));
  onDestroy(() => claims?.update(all => { const next = new Map(all); next.delete(id); return next; }));

  function split(source: string, taken: Set<string>): Part[] {
    if (!gloss || !source) return [{ kind: 'text', value: source ?? '' }];
    const used = new Set(taken);
    let parts: Part[] = [{ kind: 'text', value: source }];

    for (const { match, entry } of GLOSSARY_TERMS) {
      if (used.has(entry.term)) continue;
      const re = new RegExp(`(^|[^\\p{L}\\p{N}-])(${match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![\\p{L}\\p{N}-])`, 'iu');
      const next: Part[] = [];
      let done = false;
      for (const part of parts) {
        if (done || part.kind !== 'text') { next.push(part); continue; }
        const m = re.exec(part.value);
        if (!m) { next.push(part); continue; }
        const start = m.index + m[1].length;
        const end = start + m[2].length;
        if (start > 0) next.push({ kind: 'text', value: part.value.slice(0, start) });
        next.push({ kind: 'term', value: part.value.slice(start, end), entry });
        if (end < part.value.length) next.push({ kind: 'text', value: part.value.slice(end) });
        used.add(entry.term);
        done = true;
      }
      parts = next;
    }
    return parts;
  }

  $: parts = split(text, new Set([...earlier($claims), ...(scope?.skip ?? [])]));

  let open: string | null = null;
  let pinned = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const AUTO_CLOSE_MS = 9000;

  function show(key: string) {
    open = key;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { open = null; pinned = false; }, AUTO_CLOSE_MS);
  }

  function hide() {
    open = null;
    pinned = false;
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function pin(key: string) {
    if (pinned && open === key) { hide(); return; }
    pinned = true;
    show(key);
  }

  function unhover() {
    if (!pinned) hide();
  }

  function clamp(node: HTMLElement) {
    const fit = () => {
      node.style.transform = 'none';
      const r = node.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const margin = 12;
      let dx = 0;
      if (r.left < margin) dx = margin - r.left;
      else if (r.right > vw - margin) dx = (vw - margin) - r.right;
      if (dx) node.style.transform = `translateX(${Math.round(dx)}px)`;
    };
    fit();
    window.addEventListener('resize', fit);
    return { destroy: () => window.removeEventListener('resize', fit) };
  }

  function onDocumentClick(event: MouseEvent) {
    if (!open) return;
    const el = event.target as HTMLElement | null;
    if (!el || !el.closest('.gloss-wrap')) hide();
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') hide();
  }
</script>

<svelte:window on:keydown={onKeydown} on:click={onDocumentClick} />

{#each parts as part, i}{#if part.kind === 'text'}{part.value}{:else}<span class="gloss-wrap"><span
      class="gloss-term"
      data-term={part.entry.term}
      role="button"
      tabindex="0"
      aria-expanded={open === `${i}`}
      on:click|stopPropagation={() => pin(`${i}`)}
      on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pin(`${i}`); } }}
      on:mouseenter={() => show(`${i}`)}
      on:mouseleave={unhover}
      on:focus={() => show(`${i}`)}
      on:blur={unhover}
    >{part.value}</span>{#if open === `${i}`}<span class="gloss-pop" role="note" use:clamp
      >{part.entry.meaning}</span>{/if}</span>{/if}{/each}

<style>
  .gloss-wrap {
    position: relative;
    display: inline;
  }

  .gloss-term {
    font: inherit;
    color: inherit;
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    border-bottom: 1.5px dotted rgb(var(--c-teal));
    line-height: inherit;
    display: inline;
  }

  .gloss-term:hover,
  .gloss-term:focus-visible {
    color: rgb(var(--c-teal-light));
    border-bottom-style: solid;
  }

  .gloss-pop {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 40;
    display: block;
    width: max-content;
    max-width: min(19rem, 78vw);
    padding: 0.6rem 0.75rem;
    border: 1px solid rgb(var(--c-border));
    border-radius: 10px;
    background: rgb(var(--c-surface));
    color: rgb(var(--c-bright));
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
    font-size: 0.85rem;
    line-height: 1.45;
    text-align: left;
    white-space: normal;
  }

  @media (max-width: 640px) {
    .gloss-pop {
      max-width: min(19rem, calc(100vw - 24px));
      font-size: 0.9rem;
    }
  }
</style>
