<script lang="ts">
  import type { SEQuizResult } from '$lib/types.js';
  import { SE_QUIZ_QUESTIONS } from '$lib/audit/quiz.js';
  import { SE_SCALE_LABELS, EMOTIONAL_REGISTER_LABELS } from '$lib/audit/constants.js';

  export let quizStep: number;                       
  export let quizAnswers: Record<string, number>;    
  export let seQuiz: SEQuizResult | null | undefined;
  export let onSubmit: () => void;
  export let onBack: () => void;
  export let onSeeHumanItems: () => void;
</script>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">
  <button type="button" on:click={onBack}
    class="flex items-center gap-2 text-sm text-dim hover:text-body transition-colors mb-8">
    ← Back to audit
  </button>

  {#if quizStep === 0}
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-2xl text-amber">◉</span>
        <h1 class="font-display text-2xl font-bold text-white">Social Engineering Self-Assessment</h1>
      </div>
      <p class="text-body leading-relaxed mb-4">
        7 short scenarios. Rate how you'd genuinely react — there are no right or wrong answers.
        Your results adjust the weighting of human vulnerability items in your checklist.
      </p>
      <div class="panel p-4 border-amber/20 mb-6">
        <p class="text-sm font-medium text-amber-light mb-2">Why this matters</p>
        <p class="text-sm text-body leading-relaxed">
          Everyone is susceptible to different manipulation techniques. Knowing your specific
          vulnerabilities is the first step to defending against them. This assessment stays
          entirely in your browser — it's never transmitted anywhere.
        </p>
      </div>
      {#if seQuiz}
        <p class="text-sm text-dim mb-4">
          You completed this on {new Date(seQuiz.completed_at).toLocaleDateString()}.
          Retaking will update your results.
        </p>
      {/if}
      <button type="button" on:click={() => { quizStep = 1; quizAnswers = {}; }}
        class="btn-primary">
        Start assessment →
      </button>
    </div>

  {:else if quizStep <= SE_QUIZ_QUESTIONS.length}
    {@const q = SE_QUIZ_QUESTIONS[quizStep - 1]}
    <div class="flex items-center gap-3 mb-8">
      <div class="flex gap-1">
        {#each SE_QUIZ_QUESTIONS as _, i}
          <div class="h-1.5 w-6 rounded-full transition-all duration-300
                       {i < quizStep - 1 ? 'bg-amber/50' : i === quizStep - 1 ? 'bg-amber' : 'bg-border'}"></div>
        {/each}
      </div>
      <span class="label-mono opacity-60">{quizStep} of {SE_QUIZ_QUESTIONS.length}</span>
    </div>

    <div class="panel p-6 mb-6 border-amber/20">
      <p class="text-body leading-relaxed text-sm mb-2">{q.scenario}</p>
    </div>
    <p class="text-sm text-bright mb-5">{q.prompt}</p>

    <div class="grid grid-cols-1 gap-2.5 mb-8">
      {#each [1,2,3,4,5] as n}
        {@const selected = quizAnswers[q.id] === n}
        <button type="button"
          on:click={() => { quizAnswers[q.id] = n; }}
          class="text-left p-4 rounded-lg border transition-all duration-150
                 {selected ? 'border-amber/60 bg-amber-dim/20 text-white' : 'border-border bg-surface hover:border-muted text-body'}">
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-mono
                         {selected ? 'border-amber bg-amber text-void' : 'border-muted'}">
              {n}
            </span>
            <span class="text-sm font-sans">{SE_SCALE_LABELS[n]}</span>
          </div>
        </button>
      {/each}
    </div>

    <div class="flex items-center justify-between">
      <button type="button"
        on:click={() => quizStep = Math.max(0, quizStep - 1)}
        class="btn-ghost text-sm">← Back</button>
      {#if quizStep < SE_QUIZ_QUESTIONS.length}
        <button type="button"
          on:click={() => { if (quizAnswers[q.id]) quizStep++; }}
          class="btn-primary text-sm {!quizAnswers[q.id] ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}">
          Next →
        </button>
      {:else}
        <button type="button"
          on:click={onSubmit}
          class="btn-primary text-sm {!quizAnswers[q.id] ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}">
          See my results →
        </button>
      {/if}
    </div>

  {:else}
    {@const quiz = seQuiz}
    {#if quiz}
    <div class="mb-6">
      <h2 class="font-display text-2xl font-bold text-white mb-2">Your susceptibility profile</h2>
      <p class="text-sm text-body">
        Your checklist now weights human vulnerability items based on these results.
        Highest-scoring registers are the attack patterns most likely to work on you.
      </p>
    </div>

    <div class="panel p-5 mb-5">
      <p class="label-mono mb-4">Susceptibility by manipulation type</p>
      <div class="space-y-3">
        {#each Object.entries(quiz.susceptibilities).sort((a, b) => b[1] - a[1]) as [register, score]}
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-body">{EMOTIONAL_REGISTER_LABELS[register] ?? register}</span>
              <span class="text-xs font-mono {score >= 75 ? 'text-red-light' : score >= 50 ? 'text-amber-light' : 'text-teal-light'}">{score}%</span>
            </div>
            <div class="h-1.5 bg-border rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700
                           {score >= 75 ? 'bg-red' : score >= 50 ? 'bg-amber' : 'bg-teal'}"
                   style="width: {score}%"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    {#if quiz.top_register}
    <div class="panel p-4 border-amber/20 mb-6">
      <p class="label-mono text-amber mb-2">Your highest risk: {EMOTIONAL_REGISTER_LABELS[quiz.top_register] ?? quiz.top_register}</p>
      <p class="text-sm text-body">
        Items targeting this manipulation type have been prioritised in your checklist.
        Focus on them first, under Spotting scams.
      </p>
    </div>
    {/if}

    <div class="flex flex-wrap gap-3">
      <button type="button" on:click={onSeeHumanItems}
        class="btn-primary text-sm">See my human vulnerability items →</button>
      <button type="button" on:click={onBack} class="btn-ghost text-sm">
        Back to audit
      </button>
    </div>
    {/if}
  {/if}
</div>
