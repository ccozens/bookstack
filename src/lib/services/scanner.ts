import { BrowserMultiFormatReader } from '@zxing/browser';

export interface ScanResult {
  text: string;
  format: string;
}

export async function scanFromCamera(videoElement: HTMLVideoElement): Promise<ScanResult> {
  return new Promise((resolve, reject) => {
    BrowserMultiFormatReader.decodeFromVideoDevice(
      undefined,
      videoElement,
      (result, err) => {
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
      }
    );
  });
}

export function stopCamera(videoElement: HTMLVideoElement): void {
  try {
    const stream = videoElement.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    videoElement.srcObject = null;
  } catch {
    // silently ignore cleanup errors
  }
}