import { BrowserMultiFormatReader } from '@zxing/browser';

export interface ScanResult {
  text: string;
  format: string;
}

const reader = new BrowserMultiFormatReader();

export async function scanFromCamera(videoElement: HTMLVideoElement): Promise<ScanResult> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }
  });
  videoElement.srcObject = stream;
  await videoElement.play();

  // Wait for video to have actual frames
  await new Promise(resolve => setTimeout(resolve, 500));

  return new Promise((resolve, reject) => {
    reader.decodeFromStream(stream, videoElement, (result, err) => {
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
  });
}

export function stopCamera(videoElement: HTMLVideoElement): void {
  try {
    const stream = videoElement.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    videoElement.srcObject = null;
  } catch {
    // silently ignore
  }
}