import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { PassengerTheme } from "../../components/ui";
import { useApp } from "../../store";
import { PassengerDemoButton } from "./PassengerDemoButton";

export function RoleSelectionScreen() {
  const { passenger } = useApp();
  const passengerRoute = () => router.push(passenger.authenticated ? "/pasajero/home" : "/pasajero/register");

  return (
    <PassengerTheme>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.screen}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>ELIGE CÓMO CONTINUAR</Text>
          <Text accessibilityRole="header" style={styles.title}>¿Cómo quieres continuar?</Text>
          <Text style={styles.subtitle}>Selecciona tu experiencia para seguir.</Text>
        </View>
        <View style={styles.options}>
          <RoleCard title="Pasajero" subtitle="Pide un viaje y llega a tu destino" icon="person" onPress={passengerRoute} />
          <RoleCard title="Conductor" subtitle="Recibe solicitudes y conduce con Woki" icon="car" onPress={() => router.push("/conductor")} />
        </View>
        <View style={styles.bottomActions}>
          <Pressable accessibilityRole="button" onPress={() => router.replace("/pasajero/password")}><Text style={styles.backText}>‹  Volver</Text></Pressable>
          <PassengerDemoButton onPress={passengerRoute} />
        </View>
      </ScrollView>
    </PassengerTheme>
  );
}

function RoleCard({ title, subtitle, icon, onPress }: { title: string; subtitle: string; icon: "person" | "car"; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title + ". " + subtitle} onPress={onPress} style={({ pressed }) => [styles.roleCard, icon === "person" && styles.passengerRoleCard, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          {icon === "person" ? <><Circle cx="12" cy="7" r="3.3" fill="none" stroke="#005b66" strokeWidth="1.8"/><Path d="M5.5 20v-1.7a6.5 6.5 0 0 1 13 0V20z" fill="none" stroke="#005b66" strokeWidth="1.8" strokeLinejoin="round"/></> : <><Path d="M4 15l1.5-5h13L20 15v4h-2v-2H6v2H4zM6 10l1.3-3h9.4l1.3 3" fill="none" stroke="#005b66" strokeWidth="1.7" strokeLinejoin="round"/><Circle cx="7.5" cy="13" r="1" fill="#005b66"/><Circle cx="16.5" cy="13" r="1" fill="#005b66"/></>}
        </Svg>
      </View>
      <View style={styles.roleCopy}><Text style={styles.roleTitle}>{title}</Text><Text style={styles.roleSubtitle}>{subtitle}</Text></View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#f5fbfc" },
  screen: { flexGrow: 1, padding: 22, paddingBottom: 18 },
  hero: { gap: 9, paddingBottom: 5 },
  eyebrow: { color: "#087f91", fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: "#0d2f34", fontSize: 29, lineHeight: 34, fontWeight: "900" },
  subtitle: { color: "#526e73", fontSize: 14, lineHeight: 21 },
  options: { gap: 13, marginTop: 21 },
  roleCard: { minHeight: 96, flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 15, paddingVertical: 14, borderRadius: 20, borderWidth: 1.5, borderColor: "#bfe5e9", backgroundColor: "#fff", elevation: 2 },
  passengerRoleCard: { borderColor: "#69c7ce", backgroundColor: "#e8f8f9" },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.82 },
  iconWrap: { width: 50, height: 50, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#d1f1f3" },
  roleCopy: { flex: 1, gap: 4 },
  roleTitle: { color: "#111111", fontSize: 17, fontWeight: "900" },
  roleSubtitle: { color: "#111111", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  arrow: { color: "#111111", fontSize: 27, lineHeight: 30 },
  bottomActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 26 },
  backText: { color: "#005b66", fontSize: 13, fontWeight: "800" },
});
