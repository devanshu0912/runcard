// Skia loads Reanimated when it is imported. Loading it here first means it initialises
// before any Skia screen, and if it fails we see Reanimated's real error, not Skia's "not installed".
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RunProvider } from '../src/state/RunContext';
import { ui } from '../src/theme/ui';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RunProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: ui.bg },
            headerTintColor: ui.ink,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: ui.bg },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="card" options={{ title: 'Your card' }} />
        </Stack>
      </RunProvider>
    </SafeAreaProvider>
  );
}
