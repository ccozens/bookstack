/**
 * Scanner service — all barcode scanning logic lives here.
 * To add photo/image scanning later, add a new exported function in this file only.
 * The rest of the app imports only from this module.
 */

import type { BrowserMultiFormatReader } from '@zxing/browser';

let reader: BrowserMultiFormatReader | null = null;

async function getReader(): Promise<BrowserMultiFormatReader> {
  if (!reader) {
    const { BrowserMultiFormatReader } = await import('@zxing/browser');
    reader = new BrowserMultiFormatReader();
  }
  return reader;
}

export interface ScanResult {
  text: string;
  format: string;
}

/**
 * Start scanning from a <video> element using the device camera.
 * Resolves with the first barcode detected, then stops the stream.
 */
export async function scanFromCamera(videoElement: HTMLVideoElement): Promise<ScanResult> {
  const r = await getReader();

  return new Promise((resolve, reject) => {
    r.decodeFromVideoDevice(
      undefined, // use default camera
      videoElement,
      (result, err) => {
        if (result) {
          stopCamera(videoElement);
          resolve({
            text: result.getText(),
            format: result.getBarcodeFormat().toString()
          });
        }
        // Ignore transient "not found" errors — they fire every frame
        if (err && err.name !== 'NotFoundException') {
          stopCamera(videoElement);
          reject(err);
        }
      }
    );
  });
}

/**
 * Stop the camera stream attached to a video element.
 */
export function stopCamera(videoElement: HTMLVideoElement): void {
  try {
    const stream = videoElement.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    videoElement.srcObject = null;
    reader?.reset();
  } catch {
    // silently ignore cleanup errors
  }
}

/*
 * FUTURE EXTENSION POINT
 * To add photo/image scanning, add a function here, e.g.:
 *
 * export async function scanFromImageFile(file: File): Promise<ScanResult> { ... }
 *
 * No other files need to change.
 */
