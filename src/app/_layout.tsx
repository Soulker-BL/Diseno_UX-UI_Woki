import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { AppProvider } from "../store";
import { colors } from "../components/ui";

export default function RootLayout() {
  const splash = usePathname() === "/";
  const backgroundColor = splash ? "#005b66" : colors.bg;
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <StatusBar style={splash ? "light" : "dark"} />
        <View
          style={{
            flex: 1,
            width: "100%",
            maxWidth: 680,
            alignSelf: "center",
            backgroundColor,
          }}
        >
          <AppProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor },
              }}
            />
          </AppProvider>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
