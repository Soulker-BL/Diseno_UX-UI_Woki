import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { router } from "expo-router";
import { BrandLogo } from "./BrandLogo";

const SPLASH_DURATION = 3150;

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => router.replace("/inicio"), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="splashGradient" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor="#005b66" />
            <Stop offset="0.58" stopColor="#087f91" />
            <Stop offset="1" stopColor="#2aa5ae" />
          </LinearGradient>
        </Defs>
        <Rect width="100" height="100" fill="url(#splashGradient)" />
        <Circle cx="93" cy="12" r="28" fill="#65d9dd" opacity="0.13" />
        <Circle cx="4" cy="86" r="28" fill="#65d9dd" opacity="0.12" />
      </Svg>

      <View style={styles.brandBlock}>
        <BrandLogo color="#fff" size={68} />
        <Text style={styles.tagline}>
          Tu taxi urbano, <Text style={styles.taglineAccent}>más cerca</Text>
        </Text>
      </View>

      <View accessibilityLabel="Cargando Woki" accessibilityRole="progressbar" style={styles.loading}>
        <ActivityIndicator color="#f5a524" size="large" />
        <Text style={styles.loadingText}>Preparando tu viaje</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#005b66" },
  brandBlock: { alignItems: "center", marginTop: -20 },
  tagline: { marginTop: 20, color: "#fff", fontSize: 25, lineHeight: 32, fontWeight: "800", letterSpacing: -0.25, textShadowColor: "#00303744", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 14 },
  taglineAccent: { textDecorationLine: "underline", textDecorationColor: "#f5a524", textDecorationStyle: "solid" },
  loading: { position: "absolute", bottom: "15%", alignItems: "center", gap: 12 },
  loadingText: { color: "#e7fbfc", fontSize: 13, fontWeight: "700", letterSpacing: 0.3 },
});
