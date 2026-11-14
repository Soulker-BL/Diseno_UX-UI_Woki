import { router } from "expo-router";
import { Button, Screen } from "../components/ui";
export default function NotFound() {
  return (
    <Screen title="Pantalla no encontrada">
      <Button onPress={() => router.replace("/")}>Volver al inicio</Button>
    </Screen>
  );
}
