<script lang="ts">
  import { onDestroy } from 'svelte';
  import { scanFromCamera, stopCamera } from '$lib/services/scanner';

  interface Props {
    onscanned: (isbn: string) => void;
    oncancel: () => void;
    onskip: () => void;
  }

  let { onscanned, oncancel, onskip }: Props = $props();

  let videoEl: HTMLVideoElement;
  let scanning = $state(false);
  let error = $state('');
  let manualIsbn = $state('');

  function formatScanError(e: unknown): string {
    if (!(e instanceof Error)) return 'Barcode scanning failed. Please try again or enter ISBN manually.';

    const name = e.name;
    const message = e.message ?? '';

    if (name === 'NotAllowedError' || name === 'SecurityError') {
      return 'Camera permission was denied. Allow camera access in your browser settings to scan barcodes.';
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return 'No camera was found on this device. Enter the ISBN manually instead.';
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
      return 'Your camera is busy or unavailable. Close other camera apps and try again.';
    }
    if (name === 'OverconstrainedError') {
      return 'Could not access a compatible camera on this device. Please enter the ISBN manually.';
    }
    if (name === 'TypeError' && /secure|https|context/i.test(message)) {
      return 'Camera scanning requires a secure connection (HTTPS or localhost).';
    }
    if (/not supported/i.test(message)) {
      return 'Camera access is not supported in this browser/context. Enter the ISBN manually instead.';
    }

    return `Scanner error: ${name}${message ? ` - ${message}` : ''}`;
  }

  async function startScan() {
    error = '';
    scanning = true;
    try {
      const result = await scanFromCamera(videoEl);
      onscanned(result.text);
    } catch (e) {
      scanning = false;
      error = formatScanError(e);
    }
  }

  function submitManual() {
    const cleaned = manualIsbn.replace(/[^0-9X]/gi, '');
    if (cleaned.length === 10 || cleaned.length === 13) {
      onscanned(cleaned);
    } else {
      error = 'Please enter a valid 10 or 13 digit ISBN.';
    }
  }

  function cancel() {
    if (videoEl) stopCamera(videoEl);
    oncancel();
  }

  onDestroy(() => {
    if (videoEl) stopCamera(videoEl);
  });
</script>

<div class="flex flex-col gap-4">
  <div class="relative rounded-xl overflow-hidden bg-black aspect-3/4 w-full max-w-xs mx-auto">
    <!-- svelte-ignore a11y_media_has_caption -->
    <video bind:this={videoEl} class="w-full h-full object-cover" playsinline autoplay></video>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-48 h-32 relative">
        <div class="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[var(--color-accent)] rounded-tl"></div>
        <div class="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[var(--color-accent)] rounded-tr"></div>
        <div class="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[var(--color-accent)] rounded-bl"></div>
        <div class="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[var(--color-accent)] rounded-br"></div>
      </div>
    </div>
    {#if !scanning}
      <div class="absolute inset-0 flex items-center justify-center bg-black/60">
        <button onclick={startScan} class="btn-primary">Start scanning</button>
      </div>
    {/if}
  </div>

  {#if error}<p class="text-sm text-red-400 text-center">{error}</p>{/if}

  <div class="border-t border-[var(--color-border)] pt-4 flex flex-col gap-3">
    <button onclick={onskip} class="btn-ghost w-full">Skip — enter details manually</button>
    <p class="text-sm text-[var(--color-muted)] text-center">Or enter ISBN manually</p>
    <div class="flex gap-2">
      <input
        type="text"
        inputmode="numeric"
        placeholder="9781234567890"
        bind:value={manualIsbn}
        onkeydown={(e) => e.key === 'Enter' && submitManual()}
        class="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] placeholder-[var(--color-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
      />
      <button onclick={submitManual} class="btn-primary">Look up</button>
    </div>
  </div>

  <button onclick={cancel} class="btn-secondary w-full">Cancel</button>
</div>