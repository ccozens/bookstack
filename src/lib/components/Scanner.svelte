<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { scanFromCamera, stopCamera } from '$lib/services/scanner';

  const dispatch = createEventDispatcher<{ scanned: string; cancel: void, skip: void }>();
  let videoEl: HTMLVideoElement;
  let scanning = false;
  let error = '';
  let manualIsbn = '';


  async function startScan() {
    error = ''; scanning = true;
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

  function cancel() { if (videoEl) stopCamera(videoEl); dispatch('cancel'); }
  onDestroy(() => { if (videoEl) stopCamera(videoEl); });
</script>

<div class="flex flex-col gap-4">
  <div class="relative rounded-xl overflow-hidden bg-black aspect-[3/4] w-full max-w-xs mx-auto">
    <!-- svelte-ignore a11y-media-has-caption -->
    <video bind:this={videoEl} class="w-full h-full object-cover" playsinline autoplay></video>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-48 h-32 relative">
        <div class="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[--color-accent] rounded-tl"></div>
        <div class="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[--color-accent] rounded-tr"></div>
        <div class="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[--color-accent] rounded-bl"></div>
        <div class="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[--color-accent] rounded-br"></div>
      </div>
    </div>
    {#if !scanning}
      <div class="absolute inset-0 flex items-center justify-center bg-black/60">
        <button on:click={startScan}
          class="btn-primary"
        >Start scanning</button>
      </div>
    {/if}
  </div>

  {#if error}<p class="text-sm text-red-400 text-center">{error}</p>{/if}

  <div class="border-t border-[--color-border] pt-4">
        <button
      on:click={() => dispatch('skip')}
      class="btn-ghost w-full"
    >
      Skip — enter details manually
    </button>
    <p class="text-sm text-[--color-muted] mb-2 text-center">Or enter ISBN manually</p>
    <div class="flex gap-2">
      <input type="text" inputmode="numeric" placeholder="9781234567890" bind:value={manualIsbn}
        on:keydown={(e) => e.key === 'Enter' && submitManual()}
        class="flex-1 rounded-lg border border-[--color-border] bg-[--color-surface-2] text-[--color-text] placeholder-[--color-muted] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-accent] focus:border-transparent"
      />
      <button on:click={submitManual}
        class="btn-primary"
      >Look up</button>
    </div>
  </div>

  <button on:click={cancel} class="btn-secondary w-full">Cancel</button>
</div>
