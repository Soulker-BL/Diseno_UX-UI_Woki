import { Text } from "react-native";
import { Button, Card, Sheet, s } from "../../components/ui";
import { TERMS } from "./terms";

export function LegalTermsSheet({ visible, close }: { visible: boolean; close: () => void }) {
  if (!visible) return null;
  return (
    <Sheet title="Términos y condiciones" close={close}>
      {TERMS.map(([title, body]) => (
        <Card key={title} compact>
          <Text style={s.heading}>{title}</Text>
          <Text style={s.text}>{body}</Text>
        </Card>
      ))}
      <Button onPress={close}>Entendido</Button>
    </Sheet>
  );
}
