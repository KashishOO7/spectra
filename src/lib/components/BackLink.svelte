<script lang="ts">
  import { cameFrom } from '$lib/nav/trail.js';
  import { CHAPTERS } from '$lib/audit/chapters.js';
  import chrome from '#spectra-wiki/page/header-and-footer';
  import { fill, named } from '$lib/wiki/page.js';

  export let parent: { href: string; name: string };
  let cls = '';
  export { cls as class };

  const NAMES = named(chrome, 'back-names');

  function nameOf(path: string, own?: string): string {
    if (own) return own;
    const url = new URL(path, 'https://x');
    const first = url.pathname.split('/')[1] ?? '';
    if (first === 'chapter') return CHAPTERS.find(c => c.id === url.pathname.split('/')[2])?.name ?? NAMES.home;
    if (first === 'checklist') return NAMES.step;
    if (url.pathname === '/audit') return url.searchParams.get('mode') === 'incident' ? NAMES.incident : NAMES.list;
    return NAMES[first || 'home'] ?? NAMES.home;
  }

  $: target = $cameFrom ? { href: $cameFrom.path, name: nameOf($cameFrom.path, $cameFrom.name) } : parent;

  function go(e: MouseEvent) {
    if (!$cameFrom || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    history.back();
  }
</script>

<a href={target.href} data-back on:click={go} class={cls} title={fill(chrome, 'back-to', { name: target.name })}>{fill(chrome, 'back-to', { name: target.name })}</a>
