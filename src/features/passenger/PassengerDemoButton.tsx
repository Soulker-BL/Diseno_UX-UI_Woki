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
  button: { minHeight: 44, justifyContent: "center", alignItems: "center", paddingHorizontal: 8 },
  label: { color: "#005b66", fontSize: 12, fontWeight: "800", textDecorationLine: "underline" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
