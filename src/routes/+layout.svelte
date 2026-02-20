<script lang="ts">
  import '../app.css';
  import AuthButton from '$lib/components/AuthButton.svelte';
</script>

<div class="min-h-screen flex flex-col">
  <header class="sticky top-0 z-40 bg-[--color-parchment]/95 backdrop-blur border-b border-[--color-parchment-dark] shadow-sm">
    <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="/" class="font-display font-bold text-xl text-[--color-ink] tracking-tight hover:text-[--color-spine] transition-colors">
        📚 My Library
      </a>
      <AuthButton />
    </div>
  </header>

  <main class="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
    <slot />
  </main>

  <footer class="text-center text-xs text-[--color-ink-muted] py-4 border-t border-[--color-parchment-dark]">
    Personal book library
  </footer>
</div>
