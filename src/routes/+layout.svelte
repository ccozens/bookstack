<script lang="ts">
  import '../app.css';
  import AuthButton from '$lib/components/AuthButton.svelte';
</script>

<div class="min-h-screen flex flex-col bg-[--color-bg]">
  <!-- Header -->
  <header class="sticky top-0 z-40 bg-[--color-bg] border-b border-[--color-border]">
    <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[--color-accent] flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
          </svg>
        </div>
        <span class="font-bold text-lg text-[--color-text] tracking-tight">BookStack</span>
      </div>
      <AuthButton />
    </div>
  </header>

  <!-- Main content — padding-bottom to clear bottom nav -->
  <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
    <slot />
  </main>

  <!-- Bottom nav -->
  <nav class="fixed bottom-0 left-0 right-0 bg-[--color-bg] border-t border-[--color-border] z-40">
    <div class="max-w-2xl mx-auto flex justify-around py-3">
      <a href="/" class="flex flex-col items-center gap-1 text-[--color-accent]">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
        <span class="text-xs font-semibold uppercase tracking-widest">Library</span>
      </a>
    </div>
  </nav>
</div>
