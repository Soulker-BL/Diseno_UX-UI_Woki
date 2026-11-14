import { Pressable, StyleSheet, Text } from "react-native";

export function PassengerDemoButton({ onPress, label = "Demo" }: { onPress: () => void; label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Demo: pasar al siguiente paso"
      accessibilityHint="Avanza con datos de demostración."
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 44, justifyContent: "center", alignItems: "center", paddingHorizontal: 15, borderRadius: 16, borderWidth: 1, borderColor: "#f5a524", backgroundColor: "#ffd26f" },
  label: { color: "#111111", fontSize: 12, fontWeight: "900" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
