import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { ui } from '../theme/ui';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', loading, disabled }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={ui.ink} />
      ) : (
        <Text style={[styles.label, !primary && styles.labelSecondary]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: ui.radius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: ui.marigold },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: ui.line },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.98 }] },
  label: { color: ui.ink, fontSize: 16, fontWeight: '700' },
  labelSecondary: { fontWeight: '600' },
});
