import { Animated, StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export function BrandTaxi({ width = 106, height = 52, wheelSpin }: { width?: number; height?: number; wheelSpin?: Animated.Value }) {
  const spin = wheelSpin?.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "1080deg"] }) ?? "0deg";
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 106 52">
        <Rect x="44" y="0" width="22" height="8" rx="3" fill="#005b66" />
        <Circle cx="55" cy="4" r="1.6" fill="#65d9dd" />
        <Path d="M6 38v-6c0-5 3-8 9-9l15-11c3-3 6-4 10-4h26c5 0 8 2 11 5l11 10c7 1 11 4 11 9v6z" fill="#e8f5f4" />
        <Path d="M32 23l9-10h13v10zM58 23V13h8l9 10z" fill="#73b6bd" />
        <Rect x="6" y="31" width="93" height="4" fill="#218e97" />
        <Circle cx="28" cy="40" r="8" fill="#0d2f34" />
        <Rect x="27" y="33" width="2" height="14" fill="#cfe6e8" />
        <Circle cx="76" cy="40" r="8" fill="#0d2f34" />
        <Rect x="75" y="33" width="2" height="14" fill="#cfe6e8" />
      </Svg>
      {wheelSpin && <>
        <Animated.View style={[styles.wheel, { left: (20 * width) / 106, top: (32 * height) / 52, width: (16 * width) / 106, height: (16 * height) / 52, transform: [{ rotate: spin }] }]}><View style={styles.spoke} /><View style={[styles.spoke, styles.spokeCross]} /></Animated.View>
        <Animated.View style={[styles.wheel, { left: (68 * width) / 106, top: (32 * height) / 52, width: (16 * width) / 106, height: (16 * height) / 52, transform: [{ rotate: spin }] }]}><View style={styles.spoke} /><View style={[styles.spoke, styles.spokeCross]} /></Animated.View>
      </>}
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: { position: "absolute", borderRadius: 100, borderWidth: 1.2, borderColor: "#a7d1d1", alignItems: "center", justifyContent: "center" },
  spoke: { width: 1, height: "90%", backgroundColor: "#a7d1d1" },
  spokeCross: { position: "absolute", width: "90%", height: 1 },
});
