import { BrowserMultiFormatReader } from '@zxing/browser';

export interface ScanResult {
  text: string;
  format: string;
}

const reader = new BrowserMultiFormatReader();
let activeControls: { stop: () => void } | null = null;

async function getCameraStream(): Promise<MediaStream> {
  // Prefer rear camera for ISBN scanning on mobile, but gracefully
  // fall back to any available camera on devices without one.
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } }
    });
  } catch {
    return navigator.mediaDevices.getUserMedia({ video: true });
  }
}

export async function scanFromCamera(videoElement: HTMLVideoElement): Promise<ScanResult> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera access is not supported in this browser/context.');
  }

  const stream = await getCameraStream();
  videoElement.srcObject = stream;
  await videoElement.play();

  // Wait for video to have actual frames
  await new Promise(resolve => setTimeout(resolve, 500));

  return new Promise((resolve, reject) => {
    const maybeControls = reader.decodeFromStream(stream, videoElement, (result, err) => {
      if (result) {
        stopCamera(videoElement);
        resolve({
          text: result.getText(),
          format: result.getBarcodeFormat().toString()
        });
      }
      if (err && err.name !== 'NotFoundException') {
        stopCamera(videoElement);
        reject(err);
      }
    });

    Promise.resolve(maybeControls)
      .then((controls) => {
        activeControls = controls;
      })
      .catch(() => {
        activeControls = null;
      });
  });
}

export function stopCamera(videoElement: HTMLVideoElement): void {
  try {
    activeControls?.stop();
    activeControls = null;
    const stream = videoElement.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    videoElement.srcObject = null;
  } catch {
    // silently ignore
  }
}