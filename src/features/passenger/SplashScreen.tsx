import { useEffect, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { router } from "expo-router";
import { BrandLogo } from "./BrandLogo";
import { BrandTaxi } from "./BrandTaxi";

const TAXI_WIDTH = 118;
const TAXI_HEIGHT = 58;
const DRIVE_DURATION = 1900;
const SPLASH_DURATION = 3150;

export default function SplashScreen() {
  const { width } = useWindowDimensions();
  const [taxiX] = useState(() => new Animated.Value(-170));
  const [dashX] = useState(() => new Animated.Value(0));
  const [wheelSpin] = useState(() => new Animated.Value(0));
  const useNativeDriver = Platform.OS !== "web";

  useEffect(() => {
    taxiX.setValue(-170);
    wheelSpin.setValue(0);
    const drive = Animated.parallel([
      Animated.timing(taxiX, {
        toValue: width + 40,
        duration: DRIVE_DURATION,
        delay: 450,
        easing: Easing.bezier(0.4, 0.1, 0.3, 1),
        useNativeDriver,
      }),
      Animated.timing(wheelSpin, {
        toValue: 1,
        duration: DRIVE_DURATION,
        delay: 450,
        easing: Easing.linear,
        useNativeDriver,
      }),
    ]);
    const dashes = Animated.loop(Animated.timing(dashX, {
      toValue: -44,
      duration: 800,
      easing: Easing.linear,
      useNativeDriver,
    }));

    drive.start();
    dashes.start();
    const timer = setTimeout(() => router.replace("/inicio"), SPLASH_DURATION);
    return () => {
      clearTimeout(timer);
      drive.stop();
      dashes.stop();
    };
  }, [dashX, taxiX, useNativeDriver, wheelSpin, width]);

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

      <View accessibilityLabel="Taxi Woki pasando por la carretera" accessibilityRole="image" style={styles.road}>
        <View style={styles.roadSurface} />
        <Animated.View style={[styles.dashes, { transform: [{ translateX: dashX }] }]}>
          {Array.from({ length: 28 }, (_, index) => <View key={index} style={styles.dash} />)}
        </Animated.View>
        <Animated.View style={[styles.taxi, { transform: [{ translateX: taxiX }] }]}>
          <BrandTaxi width={TAXI_WIDTH} height={TAXI_HEIGHT} wheelSpin={wheelSpin} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#005b66" },
  brandBlock: { alignItems: "center", marginTop: -20 },
  tagline: { marginTop: 20, color: "#fff", fontSize: 25, lineHeight: 32, fontWeight: "800", letterSpacing: -0.25, textShadowColor: "#00303744", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 14 },
  taglineAccent: { textDecorationLine: "underline", textDecorationColor: "#f5a524", textDecorationStyle: "solid" },
  road: { position: "absolute", left: 0, right: 0, bottom: "16%", height: 64, overflow: "hidden" },
  roadSurface: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.14)" },
  dashes: { position: "absolute", left: 0, right: -44, top: 39, height: 3, flexDirection: "row", gap: 22 },
  dash: { width: 22, height: 3, backgroundColor: "rgba(255,255,255,0.8)" },
  taxi: { position: "absolute", left: 0, bottom: 10, width: TAXI_WIDTH, height: TAXI_HEIGHT },
});
