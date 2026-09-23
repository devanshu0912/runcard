import type { useCanvasRef } from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Snapshots the Skia canvas to a PNG and opens the system share sheet
 * (WhatsApp, Instagram, etc. appear there automatically).
 */
export async function shareCardImage(canvasRef: ReturnType<typeof useCanvasRef>): Promise<void> {
  const image = canvasRef.current?.makeImageSnapshot();
  if (!image) throw new Error('The card isn’t ready yet. Wait a moment and try again.');

  const file = new File(Paths.cache, `runcard-${Date.now()}.png`);
  file.create();
  file.write(image.encodeToBytes());

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing isn’t available on this device.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'image/png',
    dialogTitle: 'Share your run',
    UTI: 'public.png',
  });
}
