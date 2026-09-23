import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import type { Run } from '../types/run';
import { parseGpx } from './gpx';

/** Opens the file picker, reads a .gpx file, and returns a Run (or null if cancelled). */
export async function pickAndParseGpx(): Promise<Run | null> {
  // Android rarely knows the GPX mime type, so accept anything and check the extension.
  const res = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (res.canceled || !res.assets?.length) return null;

  const asset = res.assets[0];
  if (!asset.name.toLowerCase().endsWith('.gpx')) {
    throw new Error('Choose a .gpx file. In Strava or Garmin, open the activity and export it as GPX.');
  }

  const xml = await new File(asset.uri).text();
  return parseGpx(xml);
}
