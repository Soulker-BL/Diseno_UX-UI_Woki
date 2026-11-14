import { createContext, type ReactNode, useContext, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";

export const colors = {
  bg: "#f5fbfc",
  card: "#ffffff",
  ink: "#0d2f34",
  muted: "#526e73",
  primary: "#218e97",
  deep: "#005b66",
  soft: "#def5f7",
  border: "#bfe5e9",
  danger: "#b4232e",
  warning: "#fff4dc",
  accent: "#f5a524",
};
export const passengerPalette = {
  bg: "#f5fbfc",
  card: "#ffffff",
  ink: "#0d2f34",
  muted: "#526e73",
  primary: "#087f91",
  brand: "#218e97",
  deep: "#005b66",
  soft: "#def5f7",
  border: "#bfe5e9",
  danger: "#b4232e",
  warning: "#fff4dc",
  accent: "#65d9dd",
  map: "#dff3f5",
  mapRoad: "#addfe4",
  pin: "#f5a524",
};
type Palette = typeof passengerPalette;
const UiThemeContext = createContext<"default" | "passenger">("default");
const defaultPalette: Palette = {
  ...passengerPalette,
  ...colors,
  brand: colors.primary,
  map: "#e0ebe6",
  mapRoad: "#ffffff",
  pin: colors.accent,
};

export function PassengerTheme({ children }: { children: ReactNode }) {
  return (
    <UiThemeContext.Provider value="passenger">
      {children}
    </UiThemeContext.Provider>
  );
}

function usePalette(): Palette {
  return useContext(UiThemeContext) === "passenger"
    ? passengerPalette
    : defaultPalette;
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, gap: 16, flexGrow: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  card: {
    padding: 18,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  title: { fontSize: 26, fontWeight: "700", color: colors.ink },
  heading: { fontSize: 19, fontWeight: "700", color: colors.ink },
  text: { fontSize: 15, lineHeight: 23, color: colors.ink },
  muted: { fontSize: 13, lineHeight: 20, color: colors.muted },
  price: { fontSize: 30, color: colors.deep, fontWeight: "800" },
  label: {
    color: colors.deep,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    color: colors.ink,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    minHeight: 50,
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
  divider: { height: 1, backgroundColor: colors.border },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.soft,
    color: colors.deep,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: "600",
    fontSize: 12,
  },
});
export function Screen({
  title,
  back,
  right,
  left,
  panelActions,
  children,
  mapBackground = false,
  stickyContent,
  destinationTitle = false,
  softTitle = false,
  actionsBesideTitle = false,
  mapOrigin,
  mapDest,
  onMapOriginChange,
}: {
  title: string;
  back?: () => void;
  right?: ReactNode;
  left?: ReactNode;
  panelActions?: ReactNode;
  children: ReactNode;
  mapBackground?: boolean;
  stickyContent?: ReactNode;
  destinationTitle?: boolean;
  softTitle?: boolean;
  actionsBesideTitle?: boolean;
  mapOrigin?: [number, number];
  mapDest?: [number, number];
  onMapOriginChange?: (p: [number, number]) => void;
}) {
  const palette = usePalette();
  const passenger = useContext(UiThemeContext) === "passenger";
  const [mapPanelCollapsed, setMapPanelCollapsed] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);
  if (mapBackground && passenger) {
    return (
      <KeyboardAvoidingView style={[s.screen, { backgroundColor: palette.map }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <MapPreview origin={mapOrigin} dest={mapDest} onMove={onMapOriginChange} fullScreen />
        <View style={mapScreenStyles.topBar}>
          <View style={mapScreenStyles.leftActions}>{left}{back && <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={back} style={mapScreenStyles.backButton}><Text style={mapScreenStyles.backGlyph}>‹</Text></Pressable>}</View>
          {!actionsBesideTitle && right}
        </View>
        {!mapPanelCollapsed ? (
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={mapScreenStyles.scroll} contentContainerStyle={mapScreenStyles.mapContent}>
              <View onLayout={({ nativeEvent }) => setPanelHeight(nativeEvent.layout.height)} style={[mapScreenStyles.panel, !!stickyContent && mapScreenStyles.panelScrollable]}>
              <Pressable accessibilityRole="button" accessibilityLabel="Ocultar panel para ver el mapa completo" onPress={() => setMapPanelCollapsed(true)} style={mapScreenStyles.handleTouch}><View style={mapScreenStyles.handle} /></Pressable>
              {destinationTitle || softTitle ? <View style={mapScreenStyles.destinationHeader}>
                <View style={mapScreenStyles.destinationTitleGroup}>
                  <View style={mapScreenStyles.destinationIcon}><Svg width={20} height={20} viewBox="0 0 24 24">{destinationTitle ? <><Circle cx="10.8" cy="10.8" r="6.6" fill="none" stroke="#087f91" strokeWidth="2" /><Path d="m16 16 4.3 4.3" fill="none" stroke="#087f91" strokeWidth="2" strokeLinecap="round" /></> : <><Circle cx="12" cy="12" r="6.5" fill="none" stroke="#087f91" strokeWidth="1.8" /><Circle cx="12" cy="12" r="2" fill="none" stroke="#087f91" strokeWidth="1.7" /><Path d="M12 2.5v2.8m0 13.4v2.8m9.5-9.5h-2.8M5.3 12H2.5" fill="none" stroke="#087f91" strokeWidth="1.7" strokeLinecap="round" /></>}</Svg></View>
                  <Text accessibilityRole="header" numberOfLines={2} adjustsFontSizeToFit style={mapScreenStyles.destinationTitle}>{title}</Text>
                </View>
                {actionsBesideTitle && right}
                {destinationTitle && <Pressable accessibilityRole="button" accessibilityLabel="Cerrar selección de destino" onPress={() => setMapPanelCollapsed(true)} style={({ pressed }) => [mapScreenStyles.destinationClose, pressed && { opacity: 0.55 }]}><Text style={mapScreenStyles.destinationCloseGlyph}>×</Text></Pressable>}
              </View> : <View style={mapScreenStyles.titleBand}>
                <Text accessibilityRole="header" numberOfLines={2} adjustsFontSizeToFit style={mapScreenStyles.title}>{title}</Text>
              </View>}
              {stickyContent ? <>
                <View style={{ gap: 10 }}>{stickyContent}</View>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={mapScreenStyles.innerScroll} contentContainerStyle={mapScreenStyles.innerContent}>{children}</ScrollView>
              </> : <View style={{ gap: 13 }}>{children}</View>}
            </View>
          </ScrollView>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel="Mostrar detalles del viaje" onPress={() => setMapPanelCollapsed(false)} style={mapScreenStyles.expandPanel}>
            <View style={mapScreenStyles.handle} /><Text style={mapScreenStyles.expandLabel}>Mostrar {title.toLowerCase()}</Text>
          </Pressable>
        )}
        {!mapPanelCollapsed && panelActions && <View style={[mapScreenStyles.panelActions, { bottom: panelHeight + 20 }]}>{panelActions}</View>}
      </KeyboardAvoidingView>
    );
  }
  return (
    <KeyboardAvoidingView
      style={[s.screen, passenger && { backgroundColor: palette.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={passenger ? screenStyles.passengerHeader : screenStyles.defaultHeader}>
        {actionsBesideTitle ? (
          <View style={screenStyles.titleActionRow}>
            <Text accessibilityRole="header" numberOfLines={2} adjustsFontSizeToFit style={[s.title, passenger && screenStyles.passengerTitle, screenStyles.inlineTitle]}>{title}</Text>
            {right}
          </View>
        ) : <>
          <View style={[s.row, { justifyContent: "space-between" }]}>
            {back && (passenger ? <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={back} style={screenStyles.backButton}><Text style={screenStyles.backText}>‹  Volver</Text></Pressable> : <Button tone="plain" onPress={back}>← Volver</Button>)}
            {right}
          </View>
          <Text accessibilityRole="header" numberOfLines={2} adjustsFontSizeToFit style={[s.title, passenger && screenStyles.passengerTitle]}>{title}</Text>
        </>}
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          s.content,
          passenger && { padding: 20, gap: 14 },
        ]}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const screenStyles = StyleSheet.create({
  defaultHeader: { paddingHorizontal: 18, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: colors.border, gap: 10 },
  passengerHeader: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 22, gap: 12, backgroundColor: "#087e89", borderBottomLeftRadius: 25, borderBottomRightRadius: 25, overflow: "hidden" },
  passengerTitle: { color: "#fff", fontSize: 25, lineHeight: 31, letterSpacing: -0.5, fontWeight: "900", flexShrink: 1 },
  titleActionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  inlineTitle: { flex: 1, minWidth: 0 },
  backButton: { minHeight: 40, justifyContent: "center", paddingHorizontal: 12, borderRadius: 14, backgroundColor: "#ffffff26", borderWidth: 1, borderColor: "#ffffff3d" },
  backText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});

const mapScreenStyles = StyleSheet.create({
  topBar: { position: "absolute", zIndex: 3, top: 12, left: 16, right: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  leftActions: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  panelActions: { position: "absolute", zIndex: 5, left: 16, right: 16, minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  backButton: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#d9e7e0", backgroundColor: "#ffffffed", shadowColor: "#123b37", shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  backGlyph: { color: "#005b66", fontSize: 33, lineHeight: 36, marginTop: -4 },
  scroll: { flex: 1 },
  mapContent: { flexGrow: 1, justifyContent: "flex-end", paddingTop: 70, paddingHorizontal: 12, paddingBottom: 12 },
  panel: { maxHeight: "88%", paddingHorizontal: 19, paddingTop: 9, paddingBottom: 20, borderRadius: 28, borderWidth: 1, borderColor: "#ffffff", backgroundColor: "rgba(255,255,255,0.96)", shadowColor: "#0d2f34", shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: -5 }, elevation: 8 },
  panelScrollable: { flex: 1, minHeight: 0 }, innerScroll: { flex: 1, minHeight: 0 }, innerContent: { gap: 9, paddingBottom: 3 },
  handleTouch: { alignSelf: "center", width: 72, height: 44, alignItems: "center", justifyContent: "center", marginBottom: 0 },
  handle: { alignSelf: "center", width: 38, height: 4, borderRadius: 4, backgroundColor: "#a9dce1" },
  expandPanel: { position: "absolute", left: 14, right: 14, bottom: 14, minHeight: 68, alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 20, borderWidth: 1, borderColor: "#005b66", backgroundColor: "#005b66", shadowColor: "#0d2f34", shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  expandLabel: { color: "#fff", fontSize: 13, fontWeight: "800" },
  titleBand: { marginHorizontal: -19, marginBottom: 13, minHeight: 58, justifyContent: "center", paddingHorizontal: 19, paddingVertical: 12, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, backgroundColor: "#007985" },
  title: { color: "#fff", fontSize: 21, lineHeight: 26, fontWeight: "900", letterSpacing: -0.4, flexShrink: 1 },
  destinationHeader: { minHeight: 54, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  destinationTitleGroup: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  destinationIcon: { width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#e1f8f9" },
  destinationTitle: { flex: 1, color: "#006b77", fontSize: 24, lineHeight: 29, fontWeight: "900", letterSpacing: -0.55 },
  destinationClose: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#eff8f9" },
  destinationCloseGlyph: { color: "#4a7a80", fontSize: 24, lineHeight: 26, fontWeight: "500", marginTop: -1 },
});
export function Card({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  const palette = usePalette();
  const passenger = useContext(UiThemeContext) === "passenger";
  return (
    <View
      style={[
        s.card,
        passenger && {
          padding: compact ? 11 : 16,
          backgroundColor: palette.card,
          borderRadius: 17,
          borderWidth: 1,
          borderColor: compact ? "#b7dfe3" : "#d6e9eb",
          ...(compact ? { shadowColor: "#164c53", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 } : {}),
          gap: compact ? 8 : 11,
        },
      ]}
    >
      {children}
    </View>
  );
}
export function Button({
  children,
  onPress,
  disabled,
  tone = "primary",
  compact = false,
  centered = false,
}: {
  children: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "danger" | "plain" | "linkDanger";
  compact?: boolean;
  centered?: boolean;
}) {
  const palette = usePalette();
  const passenger = useContext(UiThemeContext) === "passenger";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.button,
        passenger && {
          alignSelf: centered ? "center" : compact ? "flex-start" : "stretch",
          minHeight: compact ? 44 : 54,
          borderRadius: compact ? 13 : 16,
          paddingHorizontal: compact ? 12 : 18,
          backgroundColor: tone === "danger" ? palette.danger : tone === "primary" ? palette.primary : tone === "secondary" ? palette.soft : "transparent",
        },
        {
          backgroundColor:
            tone === "danger"
              ? palette.danger
              : tone === "linkDanger"
                ? "transparent"
                : tone === "primary"
                  ? passenger ? palette.primary : palette.brand
                : tone === "secondary"
                  ? palette.soft
                  : "transparent",
          opacity: disabled ? (passenger ? 0.5 : 0.4) : pressed ? (passenger ? 0.76 : 0.7) : 1,
        },
      ]}
    >
      <Text
        style={[
          s.buttonText,
          passenger && { fontWeight: "700", letterSpacing: 0.1 },
          tone === "linkDanger" ? { color: palette.danger, fontWeight: "800" } : tone !== "primary" && tone !== "danger" && { color: palette.deep },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const palette = usePalette();
  const passenger = useContext(UiThemeContext) === "passenger";
  return (
    <View style={{ gap: 7 }}>
      <Text
        style={[
          s.muted,
          passenger && { color: palette.ink, fontSize: 13, fontWeight: "600" },
        ]}
      >
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={passenger ? palette.muted : colors.muted}
        style={[
          s.input,
          passenger && {
            minHeight: 54,
            borderRadius: 14,
            borderColor: palette.border,
            backgroundColor: palette.card,
          },
        ]}
        {...props}
      />
    </View>
  );
}
export function Notice({
  children,
  danger,
}: {
  children: string;
  danger?: boolean;
}) {
  const palette = usePalette();
  const passenger = useContext(UiThemeContext) === "passenger";
  return (
    <View
      accessibilityRole="alert"
      style={{
        backgroundColor: danger ? "#fff0ef" : passenger ? "#eaf8f9" : palette.soft,
        padding: 13,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: danger ? "#f1d4d1" : passenger ? "#cde9ec" : palette.border,
        borderLeftWidth: 3,
        borderLeftColor: danger ? palette.danger : palette.brand,
      }}
    >
        <Text style={[s.text, { color: danger ? palette.danger : palette.deep, ...(passenger ? { fontSize: 13, lineHeight: 19, fontWeight: "600" as const } : {}) }]}>
        {children}
      </Text>
    </View>
  );
}
export function Sheet({
  title,
  close,
  children,
  hideClose = false,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
  hideClose?: boolean;
}) {
  const palette = usePalette();
  const passenger = useContext(UiThemeContext) === "passenger";
  return (
    <Modal transparent animationType="slide" onRequestClose={close} visible>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          backgroundColor: passenger ? "#005b6644" : "#102f4088",
          justifyContent: "flex-end",
        }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            maxHeight: "90%",
            backgroundColor: passenger ? palette.card : "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.content}
          >
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <Text style={s.heading}>{title}</Text>
              {!hideClose && <Button tone="plain" onPress={close}>Cerrar</Button>}
            </View>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
export type Confirmation = {
  title: string;
  message: string;
  action: () => void;
  danger?: boolean;
  summary?: { eyebrow: string; title: string; detail: string; price: string };
  hideClose?: boolean;
} | null;
export function Confirm({
  value,
  close,
}: {
  value: Confirmation;
  close: () => void;
}) {
  return (
    value && (
      <Sheet title={value.title} close={close} hideClose={value.hideClose}>
        {!!value.message && <Text style={s.text}>{value.message}</Text>}
        {value.summary && <View style={{ gap: 5, padding: 15, borderRadius: 18, backgroundColor: "#e2f8f8", borderWidth: 1, borderColor: "#9fe1e4" }}>
          <Text style={{ color: "#087f91", fontSize: 10, fontWeight: "900", letterSpacing: 1 }}>{value.summary.eyebrow}</Text>
          <Text style={{ color: "#073b43", fontSize: 19, fontWeight: "900" }}>{value.summary.title}</Text>
          <Text style={{ color: "#526e73", fontSize: 13, fontWeight: "600" }}>{value.summary.detail}</Text>
          <Text style={{ color: "#005b66", fontSize: 25, fontWeight: "900", marginTop: 3 }}>{value.summary.price}</Text>
        </View>}
        <Button
          tone={value.danger ? "danger" : "primary"}
          onPress={() => {
            close();
            value.action();
          }}
        >
          Confirmar
        </Button>
        <Button tone="secondary" onPress={close}>
          Cancelar
        </Button>
      </Sheet>
    )
  );
}
export function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const passenger = useContext(UiThemeContext) === "passenger";
  return (
    <View style={s.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          accessibilityRole="button"
          accessibilityLabel={`${n} estrellas`}
          accessibilityState={{ selected: n <= value }}
          onPress={() => onChange(n)}
          style={passenger ? starStyles.passengerStar : undefined}
        >
          <Text
            style={[{
              color:
                n <= value
                  ? passenger
                    ? "#ffae00"
                    : colors.accent
                  : passenger
                    ? "#bfd4d7"
                    : colors.border,
              fontSize: passenger ? 32 : 36,
              lineHeight: passenger ? 38 : undefined,
            }, passenger && n <= value && starStyles.passengerStarSelected]}
          >
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
const starStyles = StyleSheet.create({
  passengerStar: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: 4 },
  passengerStarSelected: {},
});
export function Photo({
  uri,
  onChange,
  label = "tu foto",
}: {
  uri: string | null;
  onChange: (uri: string) => void;
  label?: string;
}) {
  const [error, setError] = useState("");
  const palette = usePalette();
  const passenger = useContext(UiThemeContext) === "passenger";
  return (
    <View style={{ gap: 8 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Elegir ${label}`}
        onPress={async () => {
          try {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            if (!result.canceled) onChange(result.assets[0].uri);
          } catch {
            setError("No se pudo abrir la galería. Intenta de nuevo.");
          }
        }}
        style={{
          alignSelf: "center",
          height: 90,
          width: 90,
          borderRadius: 45,
          backgroundColor: passenger ? palette.soft : colors.soft,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {uri ? (
          <Image
            accessibilityLabel={label}
            source={{ uri }}
            style={{ width: 90, height: 90 }}
          />
        ) : (
          <Text style={{ color: passenger ? palette.deep : colors.deep }}>+ {label}</Text>
        )}
      </Pressable>
      {!!error && <Notice danger>{error}</Notice>}
    </View>
  );
}
export type Attachment = { name: string; uri: string };
export function Upload({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: Attachment;
  onChange: (file: Attachment) => void;
}) {
  const [error, setError] = useState("");
  return (
    <View style={{ gap: 8 }}>
      <Button
        tone="secondary"
        onPress={async () => {
          try {
            const result = await DocumentPicker.getDocumentAsync({
              type: ["image/*", "application/pdf"],
              copyToCacheDirectory: true,
            });
            if (!result.canceled) {
              const file = result.assets[0];
              onChange({ name: file.name, uri: file.uri });
            }
          } catch {
            setError("No se pudo seleccionar el archivo. Intenta de nuevo.");
          }
        }}
      >
        {value ? `${label}: ${value.name}` : `Adjuntar ${label}`}
      </Button>
      {!!error && <Notice danger>{error}</Notice>}
    </View>
  );
}
export async function openLink(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    /* The caller also displays the destination phone or URL as text. */
  }
}
export function MapPreview({
  origin = [42, 40],
  dest,
  onMove,
  fullScreen = false,
}: {
  origin?: [number, number];
  dest?: [number, number];
  onMove?: (p: [number, number]) => void;
  fullScreen?: boolean;
}) {
  const [size, setSize] = useState({ width: 1, height: 1 });
  const palette = usePalette();
  const passenger = useContext(UiThemeContext) === 'passenger';
  const mapHeight = passenger ? (100 * size.height) / Math.max(size.width, 1) : 100;
  const mapY = (value: number) => passenger ? (value * mapHeight) / 100 : value;
  const streets = [
    `M-8 ${mapHeight * 0.2} C17 ${mapHeight * 0.27} 21 ${mapHeight * 0.09} 45 ${mapHeight * 0.15} S72 ${mapHeight * 0.33} 108 ${mapHeight * 0.25}`,
    `M-5 ${mapHeight * 0.57} C18 ${mapHeight * 0.47} 32 ${mapHeight * 0.6} 49 ${mapHeight * 0.52} S78 ${mapHeight * 0.46} 106 ${mapHeight * 0.56}`,
    `M8 ${mapHeight * 1.06} C18 ${mapHeight * 0.8} 13 ${mapHeight * 0.69} 29 ${mapHeight * 0.52} S37 ${mapHeight * 0.32} 34 ${mapHeight * -0.05}`,
    `M62 ${mapHeight * 1.06} C55 ${mapHeight * 0.81} 63 ${mapHeight * 0.69} 58 ${mapHeight * 0.52} S67 ${mapHeight * 0.28} 73 ${mapHeight * -0.05}`,
    `M100 ${mapHeight * 0.83} C75 ${mapHeight * 0.79} 77 ${mapHeight * 0.67} 72 ${mapHeight * 0.53} S80 ${mapHeight * 0.31} 102 ${mapHeight * 0.08}`,
    `M-5 ${mapHeight * 0.87} C17 ${mapHeight * 0.81} 30 ${mapHeight * 0.91} 46 ${mapHeight * 0.85} S75 ${mapHeight * 0.72} 105 ${mapHeight * 0.88}`,
  ];
  const markerOrigin: [number, number] = [origin[0], mapY(fullScreen && passenger ? Math.min(origin[1], 18) : origin[1])];
  const markerDest: [number, number] | undefined = dest ? [dest[0], mapY(fullScreen && passenger ? Math.min(dest[1], 8) : dest[1])] : undefined;
  const marker = (x: number, y: number, fill: string, key: string) => (
    <G key={key}>
      <Ellipse cx={x} cy={y + 4.8} rx="3.3" ry="1.1" fill="#173c3540" />
      <Path d={`M${x} ${y + 4.2} C${x - 1} ${y + 2.1} ${x - 4.2} ${y - 0.8} ${x - 4.2} ${y - 3.1} A4.2 4.2 0 1 1 ${x + 4.2} ${y - 3.1} C${x + 4.2} ${y - 0.8} ${x + 1} ${y + 2.1} ${x} ${y + 4.2} Z`} fill={fill} stroke="#fff" strokeWidth="0.8" />
      <Circle cx={x} cy={y - 3.1} r="1.25" fill="#fff" />
    </G>
  );
  return (
    <View style={fullScreen ? StyleSheet.absoluteFill : undefined}>
      <Pressable
        accessibilityRole={onMove ? 'button' : 'image'}
        accessibilityLabel={onMove ? 'Mapa esquemático. Toca para cambiar el punto de recojo' : 'Vista esquemática del recorrido'}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setSize((current) =>
            current.width === width && current.height === height
              ? current
              : { width, height },
          );
        }}
        onPress={onMove ? (e) => onMove([
          Math.max(5, Math.min(95, (e.nativeEvent.locationX / size.width) * 100)),
          Math.max(5, Math.min(95, (e.nativeEvent.locationY / size.height) * 100)),
        ]) : undefined}
        style={fullScreen ? mapPreviewStyles.full : { height: passenger ? 210 : 220, backgroundColor: passenger ? palette.map : '#e0ebe6', borderRadius: 20, overflow: 'hidden' }}
      >
        <Svg width="100%" height="100%" viewBox={`0 0 100 ${mapHeight}`} preserveAspectRatio="none">
          <Rect width="100" height={mapHeight} fill={passenger ? palette.map : '#e0ebe6'} />
          {passenger && <>
            <Rect x="2" y={mapHeight * 0.03} width="17" height={mapHeight * 0.11} rx="2" fill="#def5f7" />
            <Rect x="80" y={mapHeight * 0.66} width="17" height={mapHeight * 0.16} rx="3" fill="#def5f7" />
            <Rect x="38" y={mapHeight * 0.72} width="11" height={mapHeight * 0.14} rx="3" fill="#def5f7" />
            <Circle cx="82" cy={mapHeight * 0.14} r="9" fill="#def5f7" />
          </>}
          {passenger ? <>
            {streets.map((d, i) => <Path key={`edge-${i}`} d={d} fill="none" stroke={palette.mapRoad} strokeWidth={fullScreen ? (i < 2 ? '3.1' : '2.5') : (i < 2 ? '5.8' : '4.6')} strokeLinecap="round" />)}
            {streets.map((d, i) => <Path key={`road-${i}`} d={d} fill="none" stroke="#fff" strokeWidth={fullScreen ? (i < 2 ? '2.2' : '1.7') : (i < 2 ? '4.3' : '3.3')} strokeLinecap="round" />)}
          </> : <>
            {[15, 35, 55, 75, 95].map((n) => <Line key={`h${n}`} x1="0" y1={n} x2="100" y2={n} stroke="white" strokeWidth="4" />)}
            {[12, 32, 52, 72, 92].map((n) => <Line key={`v${n}`} x1={n} y1="0" x2={n} y2="100" stroke="white" strokeWidth="3" />)}
          </>}
          {passenger && <>
            <SvgText x="9" y={mapHeight * 0.34} fontSize="3.3" fill="#526e73" letterSpacing="0.5">CHAUPIMARCA</SvgText>
            <SvgText x="65" y={mapHeight * 0.95} fontSize="3" fill="#526e73" letterSpacing="0.4">CENTRO</SvgText>
          </>}
          {!passenger && <SvgText x="5" y="94" fontSize="4" fill={colors.deep}>CERRO DE PASCO</SvgText>}
          {dest && <Path d={`M${markerOrigin[0]},${markerOrigin[1]} C${markerOrigin[0] + 13},${markerOrigin[1] - 12} ${markerDest![0] - 14},${markerDest![1] + 12} ${markerDest![0]},${markerDest![1]}`} fill="none" stroke={passenger ? palette.brand : colors.primary} strokeWidth="1.5" strokeDasharray="2.3 2.3" />}
          {passenger ? marker(markerOrigin[0], markerOrigin[1], palette.brand, 'origin') : <Circle cx={markerOrigin[0]} cy={markerOrigin[1]} r="3" fill={colors.deep} stroke="white" strokeWidth="1" />}
          {dest && markerDest && (passenger ? marker(markerDest[0], markerDest[1], palette.pin, 'destination') : <Circle cx={dest[0]} cy={dest[1]} r="3" fill={colors.accent} stroke="white" strokeWidth="1" />)}
        </Svg>
      </Pressable>
      {!fullScreen && <Text style={[s.muted, { marginTop: 6 }]}>{onMove ? "Mapa esquemático · Toca para ajustar el recojo" : "Vista esquemática del recorrido"}</Text>}
    </View>
  );
}

const mapPreviewStyles = StyleSheet.create({
  full: { ...StyleSheet.absoluteFill, overflow: 'hidden', backgroundColor: '#eaf2eb' },
});
