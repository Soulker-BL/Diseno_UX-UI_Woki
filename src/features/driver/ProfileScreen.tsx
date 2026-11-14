import { useState } from "react";
import { Image, Text, View } from "react-native";
import { Button, Card, Confirm, Field, Notice, Photo, Screen, Sheet, s, type Confirmation } from "../../components/ui";
import { useApp } from "../../store";
import type { DriverProfile } from "./model";

const personalFields: { key: keyof DriverProfile; label: string; keyboardType?: "phone-pad" | "email-address" | "default" }[] = [
  { key: "phone", label: "Celular", keyboardType: "phone-pad" },
  { key: "email", label: "Correo", keyboardType: "email-address" },
  { key: "address", label: "Dirección" },
  { key: "emergencyName", label: "Contacto de emergencia" },
  { key: "emergencyPhone", label: "Celular de emergencia", keyboardType: "phone-pad" },
];
const documentLabels = { dni: "DNI", licencia: "Licencia de conducir", soat: "SOAT", revisionTecnica: "Revisión técnica", tarjetaPropiedad: "Tarjeta de propiedad" } as const;

export default function ProfileScreen() {
  const { driver, dispatchDriver } = useApp();
  const profile = driver.profile;
  const [draft, setDraft] = useState(profile);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const name = `${profile.firstName} ${profile.lastName} ${profile.maternalName}`.trim();
  const isApproved = Object.values(driver.documents).every((document) => document.status === "approved");

  return (
    <Screen title="Mi perfil">
      {!!message && <Notice>{message}</Notice>}
      <View style={styles.profileHero}>
        <Photo uri={profile.photo} onChange={(photo) => dispatchDriver({ type: "profile", value: { photo } })} />
        <Text style={styles.profileName}>{name || "Conductor Woki"}</Text>
        <View style={styles.ratingLine}><Text style={styles.star}>★</Text><Text style={styles.ratingText}>Aún sin reseñas</Text><Text style={styles.ratingDivider}>·</Text><Text style={styles.ratingText}>{driver.history.length} {driver.history.length === 1 ? "viaje" : "viajes"}</Text></View>
        <View style={[styles.statusPill, { backgroundColor: isApproved ? "#dff6e9" : "#fff0bd" }]}><Text style={{ color: isApproved ? "#176a48" : "#785600", fontSize: 10, fontWeight: "900" }}>{isApproved ? "Cuenta aprobada" : "Documentos pendientes"}</Text></View>
      </View>

      <View style={styles.sectionHeading}><Text style={s.heading}>Datos personales</Text><Button compact tone="plain" onPress={() => { setDraft(profile); setSheetOpen(true); }}>Editar</Button></View>
      <Card compact>
        <DetailRow label="DNI" value={profile.dni} />
        {personalFields.map(({ key, label }) => <DetailRow key={key} label={label} value={String(profile[key] ?? "")} />)}
      </Card>

      <Text style={s.heading}>Documentos</Text>
      <Card compact>
        {Object.entries(documentLabels).map(([key, label]) => {
          const document = driver.documents[key as keyof typeof documentLabels];
          return <View key={key} style={styles.documentRow}><View style={{ flex: 1, gap: 2 }}><Text style={styles.documentName}>{label}</Text><Text numberOfLines={1} style={styles.fileName}>{document.file?.name ?? "Sin archivo adjunto"}</Text></View><Text style={[styles.documentStatus, document.status === "approved" ? styles.approved : document.status === "rejected" ? styles.rejected : styles.pending]}>{document.status === "approved" ? "Aprobado" : document.status === "rejected" ? "Actualizar" : document.status === "uploaded" ? "En revisión" : "Pendiente"}</Text></View>;
        })}
      </Card>

      <Text style={s.heading}>Vehículo registrado</Text>
      <Card compact>
        <View style={styles.vehicleRow}>
          {profile.vehiclePhoto ? <Image accessibilityLabel="Foto del vehículo registrado" source={{ uri: profile.vehiclePhoto }} style={styles.vehiclePhoto} /> : <View style={styles.vehiclePhotoPlaceholder}><Text style={{ color: "#087f91", fontSize: 23, fontWeight: "900" }}>W</Text></View>}
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={styles.vehicleName}>{profile.vehicleModel || "Vehículo pendiente"}</Text>
            <Text style={s.muted}>{[profile.vehicleColor, profile.vehicleYear].filter(Boolean).join(" · ")}</Text>
            <Text style={styles.plate}>{profile.vehiclePlate || "Añade tu placa"}</Text>
          </View>
        </View>
      </Card>

      {sheetOpen && !confirmation && <Sheet title="Editar datos personales" close={() => setSheetOpen(false)}>
        {personalFields.map(({ key, label, keyboardType }) => <Field key={key} label={label} value={String(draft[key] ?? "")} onChangeText={(value) => setDraft((current) => ({ ...current, [key]: value }))} keyboardType={keyboardType ?? "default"} autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"} />)}
        <Button disabled={!/^9\d{8}$/.test(draft.phone) || !/^\S+@\S+\.\S+$/.test(draft.email)} onPress={() => setConfirmation({ title: "¿Guardar cambios?", message: "Se actualizarán tus datos de contacto.", action: () => { dispatchDriver({ type: "profile", value: draft }); setSheetOpen(false); setMessage("Datos actualizados."); } })}>Guardar cambios</Button>
      </Sheet>}
      <Confirm value={confirmation} close={() => setConfirmation(null)} />
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}

const styles = {
  profileHero: { alignItems: "center" as const, gap: 7, paddingTop: 7, paddingBottom: 14 },
  profileName: { color: "#0d2f34", fontSize: 22, lineHeight: 27, fontWeight: "900" as const, textAlign: "center" as const },
  ratingLine: { flexDirection: "row" as const, alignItems: "center" as const, gap: 5 },
  star: { color: "#f5a524", fontSize: 18, fontWeight: "900" as const },
  ratingText: { color: "#526e73", fontSize: 11, fontWeight: "700" as const },
  ratingDivider: { color: "#87aaae", fontWeight: "800" as const },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  sectionHeading: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const },
  detailRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, gap: 10, minHeight: 41, borderBottomWidth: 1, borderBottomColor: "#e3eff0" },
  detailLabel: { color: "#527277", fontSize: 12, fontWeight: "600" as const },
  detailValue: { flex: 1, color: "#0d2f34", fontSize: 12, fontWeight: "800" as const, textAlign: "right" as const },
  documentRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, gap: 9, minHeight: 49, borderBottomWidth: 1, borderBottomColor: "#e3eff0" },
  documentName: { color: "#123c42", fontSize: 12, fontWeight: "800" as const },
  fileName: { color: "#6b8a8e", fontSize: 10 },
  documentStatus: { fontSize: 10, fontWeight: "900" as const },
  approved: { color: "#177749" },
  rejected: { color: "#b4232e" },
  pending: { color: "#8b6500" },
  vehicleName: { color: "#0d3e45", fontSize: 17, fontWeight: "900" as const },
  vehicleRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 },
  vehiclePhoto: { width: 72, height: 72, borderRadius: 16, backgroundColor: "#dff6f7" },
  vehiclePhotoPlaceholder: { width: 72, height: 72, alignItems: "center" as const, justifyContent: "center" as const, borderRadius: 16, backgroundColor: "#dff6f7" },
  plate: { alignSelf: "flex-start" as const, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, borderWidth: 1, borderColor: "#bfe5e9", color: "#005b66", fontSize: 12, fontWeight: "900" as const, letterSpacing: 1 },
};
