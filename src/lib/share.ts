import type { useCanvasRef } from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';
// The main entry needs the 'ExpoMediaLibraryNext' native module, which Expo Go doesn't include.
// The legacy entry uses the older module that Expo Go has. Revisit once we move to dev builds.
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';

type CanvasRef = ReturnType<typeof useCanvasRef>;

/** Thrown when the user hasn't allowed saving to photos. `canAskAgain` is false once they've blocked it. */
export class PhotosPermissionError extends Error {
  constructor(public readonly canAskAgain: boolean) {
    super('RunCard doesn’t have permission to save to your photos.');
  }
}

/** Snapshots the Skia canvas into a PNG in the cache folder. */
function snapshotToPng(canvasRef: CanvasRef): File {
  const image = canvasRef.current?.makeImageSnapshot();
  if (!image) throw new Error('The card isn’t ready yet. Wait a moment and try again.');

  const file = new File(Paths.cache, `runcard-${Date.now()}.png`);
  file.create();
  file.write(image.encodeToBytes());
  return file;
}

/**
 * Snapshots the card and opens the system share sheet
 * (WhatsApp, Instagram, etc. appear there automatically).
 */
export async function shareCardImage(canvasRef: CanvasRef): Promise<void> {
  const file = snapshotToPng(canvasRef);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing isn’t available on this device.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'image/png',
    dialogTitle: 'Share your run',
    UTI: 'public.png',
  });
}

/** Snapshots the card and saves it to the phone's photo gallery. Asks for save-only permission first. */
export async function saveCardImage(canvasRef: CanvasRef): Promise<void> {
  let permission = await MediaLibrary.getPermissionsAsync(true, ['photo']);
  if (!permission.granted && permission.canAskAgain) {
    permission = await MediaLibrary.requestPermissionsAsync(true, ['photo']);
  }
  if (!permission.granted) throw new PhotosPermissionError(permission.canAskAgain);

  const file = snapshotToPng(canvasRef);
  await MediaLibrary.saveToLibraryAsync(file.uri);
}
