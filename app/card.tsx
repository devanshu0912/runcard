import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { useCanvasRef } from '@shopify/react-native-skia';

import { Button } from '../src/components/Button';
import { CARD_FORMATS, RunCard, type CardFormat } from '../src/components/RunCard';
import { loadPrefs, savePrefs } from '../src/lib/prefs';
import { PhotosPermissionError, saveCardImage, shareCardImage } from '../src/lib/share';
import { useRun } from '../src/state/RunContext';
import { CARD_THEMES } from '../src/theme/cardThemes';
import { ui } from '../src/theme/ui';

export default function CardScreen() {
  const { run } = useRun();
  const { width } = useWindowDimensions();
  const canvasRef = useCanvasRef();
  // Start on the theme they picked last time (falls back to the first theme below if it's gone).
  const [themeId, setThemeId] = useState(() => loadPrefs().themeId ?? CARD_THEMES[0].id);
  const [format, setFormat] = useState<CardFormat>('4:5');
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!run) return <Redirect href="/" />;

  const theme = CARD_THEMES.find((t) => t.id === themeId) ?? CARD_THEMES[0];
  const cardWidth = Math.min(width - 48, 440);

  async function handleShare() {
    try {
      setSharing(true);
      await shareCardImage(canvasRef);
    } catch (e) {
      Alert.alert('Couldn’t share the card', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setSharing(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await saveCardImage(canvasRef);
      Alert.alert('Saved to photos', 'Your card is in your gallery.');
    } catch (e) {
      if (e instanceof PhotosPermissionError && !e.canAskAgain) {
        // Android won't show the prompt again once it's been blocked, so send them to settings.
        Alert.alert(
          'Allow RunCard to save photos',
          'Saving is turned off for RunCard. Open settings, allow Photos, then tap Save to photos again.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open settings', onPress: () => Linking.openSettings() },
          ],
        );
      } else if (e instanceof PhotosPermissionError) {
        Alert.alert(
          'Couldn’t save the card',
          'RunCard needs permission to save to your photos. Tap Save to photos again and choose Allow.',
        );
      } else {
        Alert.alert('Couldn’t save the card', e instanceof Error ? e.message : 'Try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.segmented} accessibilityRole="radiogroup">
          {CARD_FORMATS.map((f) => {
            const active = f === format;
            return (
              <Pressable
                key={f}
                onPress={() => setFormat(f)}
                accessibilityRole="radio"
                accessibilityLabel={f === '4:5' ? 'Post, 4 by 5' : 'Story, 9 by 16'}
                accessibilityState={{ selected: active }}
                style={[styles.segment, active && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{f}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.cardWrap, { width: cardWidth }]}>
          <RunCard run={run} theme={theme} width={cardWidth} format={format} canvasRef={canvasRef} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themes}>
          {CARD_THEMES.map((t) => {
            const active = t.id === theme.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => {
                  setThemeId(t.id);
                  savePrefs({ themeId: t.id });
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <View style={[styles.swatch, { backgroundColor: t.bg[0] }]} />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.actions}>
          <Button label="Share card" onPress={handleShare} loading={sharing} />
          <Button label="Save to photos" onPress={handleSave} loading={saving} variant="secondary" />
          <Button label="Make another" onPress={() => router.back()} variant="secondary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ui.bg },
  content: { padding: 24, paddingTop: 8, gap: 20, alignItems: 'center' },
  segmented: { flexDirection: 'row', padding: 4, borderRadius: 20, backgroundColor: ui.surface },
  segment: { height: 32, paddingHorizontal: 20, borderRadius: 16, justifyContent: 'center' },
  segmentActive: { backgroundColor: ui.ink },
  segmentText: { color: ui.muted, fontSize: 14, fontWeight: '600' },
  segmentTextActive: { color: ui.bg },
  cardWrap: { borderRadius: 20, overflow: 'hidden' },
  themes: { gap: 8, paddingHorizontal: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: ui.surface,
  },
  chipActive: { backgroundColor: ui.ink },
  swatch: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)' },
  chipText: { color: ui.ink, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  actions: { alignSelf: 'stretch', gap: 10 },
});
