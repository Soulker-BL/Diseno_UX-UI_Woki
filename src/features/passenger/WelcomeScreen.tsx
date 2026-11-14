import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { PassengerTheme } from "../../components/ui";
import { useApp } from "../../store";
import { BrandLogo } from "./BrandLogo";

export default function WelcomeScreen() {
  return <PassengerTheme><RoleSelection /></PassengerTheme>;
}

function RoleSelection() {
  const { passenger } = useApp();
  function enterPassenger() {
    router.push(passenger.authenticated ? "/pasajero/home" : "/pasajero/phone");
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Circle cx="98" cy="0" r="44" fill="#218e97" />
          <Circle cx="4" cy="92" r="31" fill="#65d9dd" opacity="0.16" />
          <Circle cx="92" cy="81" r="15" fill="#f5a524" opacity="0.12" />
        </Svg>
        <View style={styles.heroBrand}><BrandLogo color="#fff" pinColor="#f5a524" size={30} /><Text style={styles.cityPill}>CERRO DE PASCO</Text></View>
        <Text accessibilityRole="header" style={styles.title}>Muévete fácil y seguro con Woki</Text>
        <Text style={styles.heroSubtitle}>Tu ciudad, tu viaje. Elige cómo quieres usar Woki.</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeading}>
          <Text style={styles.eyebrow}>EMPIEZA POR AQUÍ</Text>
          <Text style={styles.subtitle}>¿Cómo quieres continuar?</Text>
        </View>
        <View style={styles.options}>
          <RoleCard title="Pasajero" subtitle="Pide un viaje y llega a tu destino" icon="person" onPress={enterPassenger} />
          <RoleCard title="Conductor" subtitle="Recibe solicitudes y conduce con Woki" icon="car" onPress={() => router.push("/conductor")} />
        </View>
        <Text style={styles.footer}>VIAJES CERCANOS · TRATO DE CONFIANZA</Text>
      </View>
    </ScrollView>
  );
}

function RoleCard({ title, subtitle, icon, onPress }: { title: string; subtitle: string; icon: "person" | "car"; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${subtitle}`} onPress={onPress} style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}>
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
  scroll: { flex: 1, backgroundColor: "#f4fafa" },
  screen: { flexGrow: 1, paddingBottom: 18 },
  hero: { minHeight: 235, overflow: "hidden", justifyContent: "flex-start", gap: 11, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 22, backgroundColor: "#005b66", borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  heroBrand: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  cityPill: { overflow: "hidden", paddingHorizontal: 11, paddingVertical: 7, borderRadius: 14, backgroundColor: "#ffffff20", color: "#e5ffff", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  title: { maxWidth: 390, color: "#fff", fontSize: 31, lineHeight: 36, fontWeight: "900", letterSpacing: -0.7 },
  heroSubtitle: { maxWidth: 350, color: "#e1fbfc", fontSize: 13, lineHeight: 19, fontWeight: "600" },
  content: { width: "100%", maxWidth: 480, alignSelf: "center", paddingHorizontal: 20, paddingTop: 23, gap: 14 },
  sectionHeading: { gap: 4 },
  eyebrow: { color: "#218e97", fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  subtitle: { color: "#0d2f34", fontSize: 19, lineHeight: 25, fontWeight: "900" },
  options: { gap: 11 },
  roleCard: { minHeight: 82, flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 19, borderWidth: 1, borderColor: "#c8e6e8", backgroundColor: "#fff", shadowColor: "#005b66", shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  roleCardPressed: { transform: [{ scale: 0.985 }], opacity: 0.82 },
  iconWrap: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#dff6f7" },
  roleCopy: { flex: 1, gap: 4 },
  roleTitle: { color: "#0d2f34", fontSize: 16, fontWeight: "900" },
  roleSubtitle: { color: "#526e73", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  arrow: { color: "#218e97", fontSize: 27, fontWeight: "400", lineHeight: 30 },
  footer: { alignSelf: "center", marginTop: 4, color: "#6b9da2", fontSize: 9, fontWeight: "800", letterSpacing: 1.1, textAlign: "center" },
});
