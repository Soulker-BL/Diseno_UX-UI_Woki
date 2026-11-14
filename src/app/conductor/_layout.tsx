import { Tabs } from "expo-router";
import { StyleSheet, View, type ColorValue } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { PassengerTheme, colors } from "../../components/ui";
import { useApp } from "../../store";
import DriverOnboardingScreen from "../../features/driver/DriverOnboardingScreen";

function DriverTabIcon({ name, color }: { name: "radar" | "trip" | "wallet" | "profile"; color: ColorValue }) {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {name === "radar" && <><Circle cx="12" cy="12" r="8.5"/><Circle cx="12" cy="12" r="3.2"/><Path d="m18 6 3-3M12 3.5V7"/></>}
    {name === "trip" && <><Path d="m4 14 1.5-5h13L20 14v5h-2v-2H6v2H4zM6 9l1.2-3h9.6L18 9"/><Circle cx="7.5" cy="14" r="1"/><Circle cx="16.5" cy="14" r="1"/></>}
    {name === "wallet" && <><Rect x="3.5" y="5" width="17" height="14" rx="2.5"/><Path d="M4 9h16M15 14h2"/><Circle cx="14" cy="14" r=".6" fill={color}/></>}
    {name === "profile" && <><Circle cx="12" cy="8" r="3.5"/><Path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></>}
  </Svg>;
}

export default function DriverLayout() {
  const { driver } = useApp();
  return (
    <PassengerTheme>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.deep,
            tabBarInactiveTintColor: colors.muted,
            tabBarStyle: { minHeight: 64, paddingBottom: 8, paddingTop: 7, borderTopColor: colors.border, backgroundColor: "#fff", elevation: 12, shadowColor: "#005b66", shadowOpacity: 0.08, shadowRadius: 9, shadowOffset: { width: 0, height: -3 } },
            tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
          }}
        >
        <Tabs.Screen
          name="index"
          options={{ title: "Radar", tabBarIcon: ({ color }) => <DriverTabIcon name="radar" color={color} /> }}
        />
        <Tabs.Screen
          name="viaje"
          options={{ title: "Viaje", tabBarIcon: ({ color }) => <DriverTabIcon name="trip" color={color} /> }}
        />
        <Tabs.Screen
          name="billetera"
          options={{ title: "Billetera", tabBarIcon: ({ color }) => <DriverTabIcon name="wallet" color={color} /> }}
        />
        <Tabs.Screen
          name="perfil"
          options={{ title: "Perfil", tabBarIcon: ({ color }) => <DriverTabIcon name="profile" color={color} /> }}
        />
        </Tabs>
        {driver.registrationStage !== "ready" && <View style={[StyleSheet.absoluteFill, { zIndex: 10, elevation: 10, backgroundColor: colors.bg }]}><DriverOnboardingScreen /></View>}
      </View>
    </PassengerTheme>
  );
}
