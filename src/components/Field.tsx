import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { ui } from '../theme/ui';

type Props = TextInputProps & { label: string; error?: string; hint?: string };

export function Field({ label, error, hint, style, ...input }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={ui.muted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { color: ui.ink, fontSize: 14, fontWeight: '600' },
  input: {
    height: 52,
    borderRadius: ui.radius,
    backgroundColor: ui.surface,
    paddingHorizontal: 16,
    fontSize: 17,
    color: ui.ink,
  },
  inputError: { borderWidth: 1.5, borderColor: ui.danger },
  error: { color: ui.danger, fontSize: 13 },
  hint: { color: ui.muted, fontSize: 13 },
});
