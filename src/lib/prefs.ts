import { File, Paths } from 'expo-file-system';

/** Small settings that survive app restarts. Stored as one JSON file; no storage library needed. */
export type Prefs = { themeId?: string };

const prefsFile = () => new File(Paths.document, 'prefs.json');

/** Never throws: a missing or corrupt file just means "no saved prefs". */
export function loadPrefs(): Prefs {
  try {
    const file = prefsFile();
    if (!file.exists) return {};
    const data: unknown = JSON.parse(file.textSync());
    return data && typeof data === 'object' ? (data as Prefs) : {};
  } catch {
    return {};
  }
}

/** Merges `patch` into the saved prefs. Failing to save only costs the user their last choice. */
export function savePrefs(patch: Prefs): void {
  try {
    const file = prefsFile();
    const next = { ...loadPrefs(), ...patch };
    if (!file.exists) file.create();
    file.write(JSON.stringify(next));
  } catch {
    // Ignore: nothing the user can do about it, and the app works without it.
  }
}
