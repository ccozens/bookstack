<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { scanFromCamera, stopCamera } from '$lib/services/scanner';

  const dispatch = createEventDispatcher<{ scanned: string; cancel: void }>();

  let videoEl: HTMLVideoElement;
  let scanning = false;
  let error = '';
  let manualIsbn = '';

  async function startScan() {
    error = '';
    scanning = true;
    try {
      const result = await scanFromCamera(videoEl);
      dispatch('scanned', result.text);
    } catch (e) {
      error = 'Could not read barcode. Try typing the ISBN below.';
      scanning = false;
    }
  }

  function submitManual() {
    const cleaned = manualIsbn.replace(/[^0-9X]/gi, '');
    if (cleaned.length === 10 || cleaned.length === 13) {
      dispatch('scanned', cleaned);
    } else {
      error = 'Please enter a valid 10 or 13 digit ISBN.';
    }
  }

  function cancel() {
    if (videoEl) stopCamera(videoEl);
    dispatch('cancel');
  }

  onDestroy(() => {
    if (videoEl) stopCamera(videoEl);
  });
</script>

<div class="flex flex-col gap-4">
  <!-- Camera viewfinder -->
  <div class="relative rounded-xl overflow-hidden bg-black aspect-[3/4] w-full max-w-xs mx-auto">
    <!-- svelte-ignore a11y-media-has-caption -->
    <video
      bind:this={videoEl}
      class="w-full h-full object-cover"
      playsinline
      autoplay
    ></video>

    <!-- Scan overlay -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-48 h-32 border-2 border-[--color-gold] rounded-lg opacity-80">
        <div class="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[--color-gold] rounded-tl"></div>
        <div class="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[--color-gold] rounded-tr"></div>
        <div class="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[--color-gold] rounded-bl"></div>
        <div class="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[--color-gold] rounded-br"></div>
      </div>
    </div>

    {#if !scanning}
      <div class="absolute inset-0 flex items-center justify-center bg-black/60">
        <button
          on:click={startScan}
          class="bg-[--color-spine] hover:bg-[--color-spine-light] text-white font-medium rounded-lg px-6 py-3 transition-colors"
        >
          Start scanning
        </button>
      </div>
    {/if}
  </div>

  {#if error}
    <p class="text-sm text-red-600 text-center">{error}</p>
  {/if}

  <!-- Manual ISBN entry -->
  <div class="border-t border-[--color-parchment-dark] pt-4">
    <p class="text-sm text-[--color-ink-muted] mb-2 text-center">Or enter ISBN manually</p>
    <div class="flex gap-2">
      <input
        type="text"
        inputmode="numeric"
        placeholder="9781234567890"
        bind:value={manualIsbn}
        on:keydown={(e) => e.key === 'Enter' && submitManual()}
        class="flex-1 rounded-lg border border-[--color-parchment-dark] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-spine] focus:border-transparent"
      />
      <button
        on:click={submitManual}
        class="bg-[--color-spine] hover:bg-[--color-spine-light] text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
      >
        Look up
      </button>
    </div>
  </div>

  <button
    on:click={cancel}
    class="text-sm text-[--color-ink-muted] hover:text-[--color-spine] transition-colors text-center"
  >
    Cancel
  </button>
</div>
