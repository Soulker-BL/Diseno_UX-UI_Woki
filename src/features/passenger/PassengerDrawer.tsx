import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import type { PassengerScreenName } from "./navigation";
import { BrandLogo } from "./BrandLogo";

export function DrawerTrigger({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Abrir menú de cuenta" onPress={onPress} style={({ pressed }) => [styles.trigger, pressed && { opacity: 0.7 }]}>
      <View style={styles.hamburgerLine} /><View style={[styles.hamburgerLine, { width: 14 }]} /><View style={styles.hamburgerLine} />
    </Pressable>
  );
}

export function PassengerDrawer({ close, onNavigate, name, phone, photo, activeScreen, logout, support }: {
  close: () => void;
  onNavigate: (target: PassengerScreenName) => void;
  name: string;
  phone: string;
  photo: string | null;
  activeScreen?: PassengerScreenName;
  logout: () => void;
  support: () => void;
}) {
  const accountItems: [PassengerScreenName, string][] = [
    ["profile", "Mi perfil"], ["places", "Mis lugares"], ["history", "Historial de viajes"], ["reviews", "Reseñas recibidas"],
  ];
  const safetyItems: [PassengerScreenName, string][] = [
    ["contacts", "Contactos de emergencia"], ["termsView", "Términos y privacidad"],
  ];
  return (
    <Modal transparent animationType="fade" visible onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar menú" onPress={close} style={styles.scrim} />
        <View style={styles.panel}>
          <View style={styles.topLine}><BrandLogo color="#005b66" size={24} /><Pressable accessibilityRole="button" accessibilityLabel="Cerrar menú" onPress={close} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable></View>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              {photo ? <Image accessibilityLabel="Tu foto de perfil" source={{ uri: photo }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{(name || "P").slice(0, 1).toUpperCase()}</Text>}
            </View>
            <View style={{ flex: 1, gap: 3 }}><Text style={styles.eyebrow}>TU CUENTA WOKI</Text><Text numberOfLines={1} style={styles.name}>{name || "Pasajero Woki"}</Text><Text style={styles.phone}>+51 {phone}</Text></View>
          </View>
          <ScrollView style={styles.navScroll} contentContainerStyle={styles.navContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>CUENTA</Text>
            <View style={styles.linkGroup}>
              {accountItems.map(([target, label], index) => <DrawerLink key={target} target={target} label={label} active={activeScreen === target} onPress={() => onNavigate(target)} last={index === accountItems.length - 1} />)}
            </View>
            <Text style={styles.sectionLabel}>SEGURIDAD Y AYUDA</Text>
            <View style={styles.linkGroup}>
              {safetyItems.map(([target, label], index) => <DrawerLink key={target} target={target} label={label} active={activeScreen === target} onPress={() => onNavigate(target)} last={index === safetyItems.length - 1} />)}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Quiero ser conductor. Descubre beneficios y requisitos" onPress={() => onNavigate("driverInfo")} style={({ pressed }) => [styles.driverCard, pressed && styles.rowPressed]}>
              <View style={styles.driverIcon}><DrawerIcon name="driverInfo" color="#005b66" /></View>
              <View style={{ flex: 1, gap: 3 }}><Text style={styles.driverTitle}>Quiero ser conductor</Text><Text style={styles.driverSubtitle}>Beneficios y requisitos</Text></View>
              <Text style={styles.driverChevron}>›</Text>
            </Pressable>
          </ScrollView>
          <View style={styles.footer}>
            <Pressable accessibilityRole="button" onPress={support} style={({ pressed }) => [styles.footerAction, pressed && styles.rowPressed]}><View style={styles.iconTile}><DrawerIcon name="support" color="#087f91" /></View><Text style={styles.linkLabel}>Ayuda y soporte</Text><Text style={styles.chevron}>›</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={logout} style={({ pressed }) => [styles.footerAction, pressed && styles.rowPressed]}><View style={styles.logoutTile}><DrawerIcon name="logout" color="#b54141" /></View><Text style={styles.logoutText}>Cerrar sesión</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DrawerLink({ target, label, active, onPress, last }: { target: PassengerScreenName; label: string; active: boolean; onPress: () => void; last: boolean }) {
  return (
    <View>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.link, active && styles.linkActive, pressed && styles.rowPressed]}>
        <View style={[styles.iconTile, active && styles.iconTileActive]}><DrawerIcon name={target} color={active ? "#fff" : "#168b9a"} /></View>
        <Text style={[styles.linkLabel, active && styles.linkLabelActive]}>{label}</Text>
        <Text style={[styles.chevron, active && styles.chevronActive]}>›</Text>
      </Pressable>
      {!last && <View style={styles.itemDivider} />}
    </View>
  );
}

function DrawerIcon({ name, color }: { name: PassengerScreenName | "support" | "logout"; color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      {name === "profile" && <><Circle cx="12" cy="8" r="3.2" stroke={color} strokeWidth="1.7" /><Path d="M5.5 20c.6-3.4 2.9-5.2 6.5-5.2s5.9 1.8 6.5 5.2" stroke={color} strokeWidth="1.7" strokeLinecap="round" /></>}
      {name === "places" && <><Path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" /><Circle cx="12" cy="9" r="2.2" stroke={color} strokeWidth="1.6" /></>}
      {name === "history" && <><Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.7" /><Path d="M12 7v5l3.5 2" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></>}
      {name === "reviews" && <Path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />}
      {name === "contacts" && <><Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.7" /><Path d="M12 8v8M8 12h8" stroke={color} strokeWidth="1.7" strokeLinecap="round" /></>}
      {name === "termsView" && <><Rect x="5" y="3" width="14" height="18" rx="2.2" stroke={color} strokeWidth="1.7" /><Path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke={color} strokeWidth="1.6" strokeLinecap="round" /></>}
      {name === "support" && <><Path d="M4 12a8 8 0 1 1 3 6.2L4 20l.8-3.6A7.9 7.9 0 0 1 4 12Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" /><Path d="M9.8 9.5a2.2 2.2 0 1 1 3.6 1.7c-.8.6-1.4 1-1.4 2" stroke={color} strokeWidth="1.6" strokeLinecap="round" /><Circle cx="12" cy="16.5" r=".8" fill={color} /></>}
      {name === "logout" && <><Path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" stroke={color} strokeWidth="1.7" strokeLinecap="round" /><Path d="M13 8l4 4-4 4m4-4H9" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></>}
      {name === "driverMode" && <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1.7" />}
      {name === "driverInfo" && <><Path d="M3 15l1.5-5h15L21 15v4h-2v-2H5v2H3zM5 10l1.5-3h11l1.5 3" stroke={color} strokeWidth="1.7" strokeLinejoin="round" /><Circle cx="7.5" cy="14" r="1" fill={color} /><Circle cx="16.5" cy="14" r="1" fill={color} /></>}
    </Svg>
  );
}

const styles = StyleSheet.create({
  trigger: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", gap: 4, borderWidth: 1, borderColor: "#bfe5e9", backgroundColor: "#fff" },
  hamburgerLine: { width: 18, height: 2, borderRadius: 2, backgroundColor: "#005b66" },
  overlay: { flex: 1, flexDirection: "row", backgroundColor: "#0d2f3488" }, scrim: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  panel: { width: "86%", maxWidth: 360, height: "100%", backgroundColor: "#f3fbfc", paddingHorizontal: 18, paddingTop: 24, paddingBottom: 18, borderRightWidth: 1, borderRightColor: "#d6eef0" },
  topLine: { height: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, brand: { color: "#005b66", fontSize: 17, fontWeight: "900", letterSpacing: 1.5 },
  close: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#def5f7" }, closeText: { color: "#005b66", fontSize: 25, lineHeight: 27 },
  identity: { minHeight: 64, marginTop: 16, marginBottom: 17, flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 2 },
  avatar: { width: 50, height: 50, overflow: "hidden", borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderWidth: 2, borderColor: "#8cdee3" }, avatarImage: { width: 50, height: 50 }, avatarText: { color: "#087f91", fontSize: 20, fontWeight: "800" },
  eyebrow: { color: "#218e97", fontSize: 9, fontWeight: "900", letterSpacing: 1 }, name: { color: "#0d2f34", fontSize: 15, fontWeight: "800" }, phone: { color: "#526e73", fontSize: 12 },
  navScroll: { flex: 1 }, navContent: { paddingTop: 1, paddingBottom: 14, gap: 11 }, sectionLabel: { marginTop: 4, color: "#65868b", fontSize: 9, fontWeight: "900", letterSpacing: 1.15 },
  linkGroup: { padding: 5, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: "#d9edef" }, link: { minHeight: 49, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 8, borderRadius: 13 }, linkActive: { backgroundColor: "#e7f8f9" }, rowPressed: { opacity: 0.75 },
  iconTile: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#e1f5f6" }, iconTileActive: { backgroundColor: "#087f91" },
  itemDivider: { height: 1, marginLeft: 48, marginRight: 9, backgroundColor: "#edf4f5" }, linkLabel: { flex: 1, color: "#0d2f34", fontSize: 13, fontWeight: "600" }, linkLabelActive: { color: "#005b66", fontWeight: "800" }, chevron: { color: "#53bdc7", fontSize: 21 }, chevronActive: { color: "#087f91" },
  footer: { paddingTop: 11, borderTopWidth: 1, borderTopColor: "#cbe9ec", gap: 3 }, footerAction: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 5, borderRadius: 13 }, logoutTile: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#fff0f0" }, logoutText: { flex: 1, color: "#b54141", fontSize: 13, fontWeight: "700" },
  driverCard: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 11, paddingVertical: 10, borderRadius: 17, backgroundColor: "#087f91", borderWidth: 1, borderColor: "#65d9dd" }, driverIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#d6fbf8" }, driverTitle: { color: "#fff", fontSize: 13, fontWeight: "900" }, driverSubtitle: { color: "#d7f5f7", fontSize: 11, fontWeight: "600" }, driverChevron: { color: "#ffd26f", fontSize: 26, fontWeight: "800" },
});
