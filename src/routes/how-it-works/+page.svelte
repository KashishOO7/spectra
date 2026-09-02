<script lang="ts">

  const steps = [
    {
      n: '1',
      title: 'You say what you would rather avoid',
      body:
        'The front page lists eight plain things people would rather did not happen to them. ' +
        'Tap the ones that sound like you. Tap none of them and press the button anyway, which ' +
        'also works, and change your mind whenever you like.'
    },
    {
      n: '2',
      title: 'You get a short list, in order',
      body:
        'Spectra puts the same set of steps in the order that fits what you tapped. You see one ' +
        'at a time rather than a wall of everything at once.'
    },
    {
      n: '3',
      title: 'You do one thing',
      body:
        'Each step is a single action in plain words, with the setting named for your phone or ' +
        'your computer. If a step does not apply to you, say so and it moves out of your way.'
    },
    {
      n: '4',
      title: 'It remembers where you got to',
      body:
        'What you have done is saved in this browser, so you can stop, close the tab, and pick ' +
        'it up later from the same place.'
    }
  ];

  const limits = [
    {
      title: 'It never looks at your accounts, files or devices',
      body:
        'Spectra has no way to see any of them. Nothing it shows you is based on checking ' +
        'anything of yours.'
    },
    {
      title: 'It never sends anything anywhere',
      body:
        'What you tap stays in this browser, on this device. There is no account and nothing to ' +
        'sign up for.'
    },
    {
      title: 'It does not tell you what will happen to you',
      body:
        'It shows what is generally worth doing and links the source each step came from, so you ' +
        'can read the reasoning and decide for yourself.'
    }
  ];
</script>

<svelte:head>
  <title>How Spectra works | Spectra</title>
  <meta name="description" content="Spectra in about a minute: you say what you would rather avoid, you get a short list in order, you do one thing, and it remembers where you got to." />
  <link rel="canonical" href="https://spectra.fpszero.com/how-it-works" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Spectra" />
  <meta property="og:title" content="How Spectra works | Spectra" />
  <meta property="og:description" content="Spectra in about a minute: you say what you would rather avoid, you get a short list in order, you do one thing, and it remembers where you got to." />
  <meta property="og:url" content="https://spectra.fpszero.com/how-it-works" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="How Spectra works | Spectra" />
  <meta name="twitter:description" content="Spectra in about a minute: you say what you would rather avoid, you get a short list in order, you do one thing, and it remembers where you got to." />
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-12">

  <h1 class="font-display text-3xl font-bold text-white mb-4">How Spectra works</h1>
  <p class="text-body text-lg leading-relaxed mb-2">
    Spectra is a checklist that puts itself in order for you.
  </p>
  <p class="text-dim text-sm mb-10">About a minute to read.</p>

  <ol class="space-y-3 mb-12">
    {#each steps as step}
      <li class="panel p-5 flex gap-4 items-start">
        <span class="font-display text-2xl font-bold text-amber/70 leading-none w-7 shrink-0"
              aria-hidden="true">{step.n}</span>
        <div>
          <h2 class="font-display text-bright font-semibold text-base mb-1.5">{step.title}</h2>
          <p class="text-sm text-body leading-relaxed">{step.body}</p>
        </div>
      </li>
    {/each}
  </ol>

  <section class="mb-12">
    <h2 class="font-display text-xl font-semibold text-bright mb-3">Why the order changes</h2>
    <p class="text-body leading-relaxed mb-3">
      The same list in a different order is the whole idea. Somebody worried about a person they
      know needs different steps first from somebody worried about scams sent to millions of
      people at once. Spectra does that reordering for you.
    </p>
    <p class="text-body leading-relaxed">
      You never have to take the order on trust. Every step says why it is there, and the page
      under the hood shows exactly how the ordering is worked out, including what it is not good
      at.
    </p>
  </section>

  <section class="mb-12">
    <h2 class="font-display text-xl font-semibold text-bright mb-4">What Spectra does not do</h2>
    <div class="space-y-3">
      {#each limits as l}
        <div class="border-l-2 border-border pl-4">
          <p class="font-sans font-medium text-sm text-bright mb-1">{l.title}</p>
          <p class="text-sm text-body leading-relaxed">{l.body}</p>
        </div>
      {/each}
    </div>
  </section>

  <div class="pt-8 border-t border-border flex flex-col sm:flex-row gap-3">
    <a href="/" class="btn-primary">Start</a>
    <a href="/methodology" class="btn-ghost">
      Under the hood
      <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round"><path d="M4 1L8 5L4 9"/></svg>
    </a>
  </div>
</div>
