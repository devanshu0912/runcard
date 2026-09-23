import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { useCanvasRef } from '@shopify/react-native-skia';

import { Button } from '../src/components/Button';
import { RunCard } from '../src/components/RunCard';
import { shareCardImage } from '../src/lib/share';
import { useRun } from '../src/state/RunContext';
import { CARD_THEMES } from '../src/theme/cardThemes';
import { ui } from '../src/theme/ui';

export default function CardScreen() {
  const { run } = useRun();
  const { width } = useWindowDimensions();
  const canvasRef = useCanvasRef();
  const [themeId, setThemeId] = useState(CARD_THEMES[0].id);
  const [sharing, setSharing] = useState(false);

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

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.cardWrap, { width: cardWidth }]}>
          <RunCard run={run} theme={theme} width={cardWidth} canvasRef={canvasRef} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themes}>
          {CARD_THEMES.map((t) => {
            const active = t.id === theme.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setThemeId(t.id)}
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
          <Button label="Make another" onPress={() => router.back()} variant="secondary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ui.bg },
  content: { padding: 24, paddingTop: 8, gap: 20, alignItems: 'center' },
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
