import { useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, PassengerTheme } from "../../components/ui";
import { useApp } from "../../store";
import { BrandLogo } from "./BrandLogo";
import { LegalTermsSheet } from "./LegalTermsSheet";
import { PassengerDemoButton } from "./PassengerDemoButton";

export default function WelcomeScreen() {
  const { passenger, setPassenger } = useApp();
  const [showTerms, setShowTerms] = useState(false);

  function demoNext() {
    setPassenger((current) => ({ ...current, user: { ...current.user, phone: "987654321" } }));
    router.push("/pasajero/phone");
  }

  return (
    <PassengerTheme>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.topLine}>
          <View style={styles.pin}><Text style={styles.pinText}>⌖</Text></View>
          <Text style={styles.city}>CERRO DE PASCO</Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.logoPlate}><BrandLogo color="#005b66" size={48} /></View>
          <Text accessibilityRole="header" style={styles.title}>Muévete fácil.</Text>
          <Text accessibilityRole="header" style={styles.title}>Llega con Woki.</Text>
          <Text style={styles.subtitle}>Tu taxi urbano, más cerca.</Text>
          <View style={styles.routeLine}><View style={styles.routeStart} /><View style={styles.routeDash} /><View style={styles.routeEnd} /></View>
        </View>

        <View style={styles.actions}>
          <Button onPress={() => router.push(passenger.authenticated ? "/pasajero/home" : "/pasajero/login")}>Iniciar sesión</Button>
          <Pressable accessibilityRole="button" onPress={() => router.push("/pasajero/phone")} style={styles.loginLink}><Text style={styles.loginLinkText}>¿No tienes una cuenta? Regístrate aquí</Text></Pressable>
          <Text style={styles.security}>Tu número se usa para verificar tu cuenta y ayudarte a recuperar el acceso.</Text>
        </View>

        <View style={styles.legal}>
          <Text style={styles.legalCopy}>Al continuar, aceptas nuestros </Text>
          <Pressable accessibilityRole="button" onPress={() => setShowTerms(true)}><Text style={styles.legalLink}>términos y condiciones</Text></Pressable>
          <Text style={styles.legalCopy}> y la política de privacidad.</Text>
        </View>
        <View style={styles.footer}><PassengerDemoButton onPress={demoNext} /></View>
      </ScrollView>
      <LegalTermsSheet visible={showTerms} close={() => setShowTerms(false)} />
    </PassengerTheme>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, backgroundColor: "#f5fbfc", paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24 },
  topLine: { flexDirection: "row", alignItems: "center", gap: 9 },
  pin: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#dff7f8" },
  pinText: { color: "#087f91", fontSize: 24, fontWeight: "800" },
  city: { flex: 1, color: "#111111", fontSize: 10, fontWeight: "900", letterSpacing: 1.05 },
  hero: { flex: 1, minHeight: 360, justifyContent: "center", paddingVertical: 38 },
  logoPlate: { alignSelf: "flex-start", marginBottom: 32, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 22, backgroundColor: "#dff7f8" },
  title: { maxWidth: 420, color: "#111111", fontSize: 40, lineHeight: 46, fontWeight: "900", letterSpacing: -1.3 },
  subtitle: { marginTop: 13, color: "#111111", fontSize: 17, lineHeight: 24, fontWeight: "600" },
  routeLine: { width: "100%", maxWidth: 310, height: 52, flexDirection: "row", alignItems: "center", marginTop: 38 },
  routeStart: { width: 13, height: 13, borderWidth: 3, borderColor: "#218e97", borderRadius: 7, backgroundColor: "#fff" },
  routeDash: { flex: 1, height: 3, marginHorizontal: 6, borderRadius: 3, backgroundColor: "#65d9dd" },
  routeEnd: { width: 15, height: 15, borderRadius: 8, backgroundColor: "#f5a524", borderWidth: 3, borderColor: "#fff" },
  actions: { gap: 12 },
  loginLink: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  loginLinkText: { color: "#005b66", fontSize: 13, fontWeight: "800", textDecorationLine: "underline" },
  footer: { position: "absolute", bottom: 8, right: 14 },
  security: { color: "#111111", fontSize: 12, lineHeight: 18, textAlign: "center" },
  legal: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", marginTop: 22, paddingHorizontal: 6 },
  legalCopy: { color: "#111111", fontSize: 10, lineHeight: 16 },
  legalLink: { color: "#111111", fontSize: 10, lineHeight: 16, fontWeight: "800", textDecorationLine: "underline" },
});
