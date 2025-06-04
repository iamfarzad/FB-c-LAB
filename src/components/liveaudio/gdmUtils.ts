// components/liveaudio/gdmUtils.ts
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Blob } from '@google/genai'; // Use type import if only types are needed

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // convert float32 -1 to 1 to int16 -32768 to 32767
    int16[i] = Math.max(-32768, Math.min(32767, data[i] * 32768)); // Clamping
  }

  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000', // Standard PCM MIME type
  };
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // Ensure data length is even for Int16Array conversion
  const dataBuffer = data.byteLength % 2 === 0 ? data.buffer : data.slice(0, data.byteLength - (data.byteLength % 2)).buffer;
  const dataInt16 = new Int16Array(dataBuffer);
  
  const numFrames = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(
    numChannels,
    numFrames,
    sampleRate,
  );

  const dataFloat32 = new Float32Array(numFrames * numChannels);
  for (let i = 0; i < dataInt16.length; i++) {
    dataFloat32[i] = dataInt16[i] / 32768.0;
  }
  
  if (numChannels === 1) {
    buffer.copyToChannel(dataFloat32, 0);
  } else {
    for (let i = 0; i < numChannels; i++) {
      const channelData = new Float32Array(numFrames);
      for (let j = 0; j < numFrames; j++) {
        channelData[j] = dataFloat32[j * numChannels + i];
      }
      buffer.copyToChannel(channelData, i);
    }
  }

  return buffer;
}
