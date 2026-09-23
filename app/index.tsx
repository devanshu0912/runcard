import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Button } from '../src/components/Button';
import { Field } from '../src/components/Field';
import { parseDistance, parseDuration } from '../src/lib/format';
import { pickAndParseGpx } from '../src/lib/importGpx';
import { useRun } from '../src/state/RunContext';
import { ui } from '../src/theme/ui';

type Errors = { distance?: string; time?: string };

export default function HomeScreen() {
  const { setRun } = useRun();
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [importing, setImporting] = useState(false);

  async function handleImport() {
    try {
      setImporting(true);
      const run = await pickAndParseGpx();
      if (run) {
        setRun(run);
        router.push('/card');
      }
    } catch (e) {
      Alert.alert('Couldn’t read that file', e instanceof Error ? e.message : 'Try another GPX file.');
    } finally {
      setImporting(false);
    }
  }

  function handleCreate() {
    const km = parseDistance(distance);
    const sec = parseDuration(time);
    setErrors({
      distance: km ? undefined : 'Enter a distance, like 5 or 10.5',
      time: sec ? undefined : 'Enter a time, like 28:30 or 1:05:00',
    });
    if (!km || !sec) return;
    setRun({
      distanceKm: km,
      durationSec: sec,
      startTime: new Date().toISOString(),
      title: title.trim() || undefined,
      source: 'manual',
    });
    router.push('/card');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.wordmark}>runcard</Text>
          <Text style={styles.headline}>Turn today’s run into a card worth posting.</Text>

          <View style={styles.section}>
            <Button label="Import a GPX file" onPress={handleImport} loading={importing} />
            <Text style={styles.hint}>
              Export the run from Strava, Garmin or any tracker as GPX, then pick it here. Route, pace and
              elevation fill in for you.
            </Text>
          </View>

          <View style={styles.divider}>
            <View style={styles.rule} />
            <Text style={styles.dividerText}>or type it in</Text>
            <View style={styles.rule} />
          </View>

          <View style={styles.form}>
            <Field
              label="Distance (km)"
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              placeholder="5.0"
              error={errors.distance}
            />
            <Field
              label="Time"
              value={time}
              onChangeText={setTime}
              keyboardType="numbers-and-punctuation"
              placeholder="28:30"
              hint="Minutes:seconds, or hours:minutes:seconds"
              error={errors.time}
            />
            <Field
              label="Title (optional)"
              value={title}
              onChangeText={setTitle}
              placeholder="Sunday long run"
              maxLength={32}
              returnKeyType="done"
            />
            <Button label="Create card" onPress={handleCreate} variant="secondary" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ui.bg },
  flex: { flex: 1 },
  content: { padding: 24, paddingTop: 32, gap: 24 },
  wordmark: { fontSize: 20, fontWeight: '800', color: ui.ink, letterSpacing: -0.5 },
  headline: { fontSize: 32, lineHeight: 38, fontWeight: '800', color: ui.ink, letterSpacing: -0.8 },
  section: { gap: 10 },
  hint: { color: ui.muted, fontSize: 14, lineHeight: 20 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { flex: 1, height: 1, backgroundColor: ui.line },
  dividerText: { color: ui.muted, fontSize: 13 },
  form: { gap: 16 },
});
