import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

export function BrandLogo({ color = "#fff", pinColor = "#f5a524", size = 38 }: { color?: string; pinColor?: string; size?: number }) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Woki" style={styles.logo}>
      <Text style={[styles.word, { color, fontSize: size, lineHeight: size + 7 }]}>Wok</Text>
      <View style={[styles.i, { height: size + 7 }]}>
        <Text style={[styles.word, { color, fontSize: size, lineHeight: size + 7 }]}>ı</Text>
        <Svg width={size * 0.62} height={size * 0.78} viewBox="0 0 24 30" style={styles.pin}>
          <Path d="M12 1a8 8 0 0 0-8 8c0 6 8 16 8 16s8-10 8-16a8 8 0 0 0-8-8z" fill={pinColor} />
          <Circle cx="12" cy="9" r="3" fill={color === "#fff" ? "#005b66" : "#fff"} />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { flexDirection: "row", alignItems: "center", height: 50 },
  word: { fontWeight: "800", letterSpacing: -1.3 },
  i: { position: "relative", justifyContent: "center", marginLeft: -1 },
  pin: { position: "absolute", right: -2, top: -4 },
});
