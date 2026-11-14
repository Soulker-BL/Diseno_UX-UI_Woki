import { useState } from "react";
import { Text, View } from "react-native";
import { Button, Card, Field, Notice, Photo, Screen, Upload, s, type Attachment } from "../../components/ui";
import { useApp } from "../../store";
import { fmtDate, firstMonthlyDue } from "./billing";
import { MONTHLY_FEE, type DriverDocumentKey, type DriverProfile, type Scheme } from "./model";
import { soles } from "../passenger/data";

const documentRows: { key: DriverDocumentKey; label: string }[] = [
  { key: "dni", label: "DNI" },
  { key: "licencia", label: "Licencia de conducir" },
  { key: "soat", label: "SOAT" },
  { key: "revisionTecnica", label: "Revisión técnica" },
  { key: "tarjetaPropiedad", label: "Tarjeta de propiedad" },
];

export default function DriverOnboardingScreen() {
  const { driver, dispatchDriver } = useApp();
  const [profile, setProfile] = useState<DriverProfile>(driver.profile);
  const stage = driver.registrationStage;

  const personalComplete = profile.firstName.trim().length > 1 && profile.lastName.trim().length > 1 && /^\d{8}$/.test(profile.dni) && /^9\d{8}$/.test(profile.phone) && /^\S+@\S+\.\S+$/.test(profile.email) && !!profile.photo && profile.vehicleModel.trim().length > 1 && profile.vehicleColor.trim().length > 1 && /^\d{4}$/.test(profile.vehicleYear) && /^[A-Z0-9-]{5,8}$/.test(profile.vehiclePlate);
  const docsComplete = Object.values(driver.documents).every((document) => !!document.file);
  const saveDocument = (key: DriverDocumentKey, file: Attachment) => dispatchDriver({ type: "document", key, file });

  function selectPlan(scheme: Scheme) {
    const due = scheme === "mensual" ? firstMonthlyDue(new Date()).toISOString().slice(0, 10) : undefined;
    dispatchDriver({ type: "scheme", scheme, monthlyDue: due });
  }

  if (stage === "personal") return (
    <Screen title="Registro de conductor">
      <View style={styles.hero}><Text style={styles.eyebrow}>TU PERFIL WOKI</Text><Text style={styles.heroTitle}>Cuéntanos de ti</Text><Text style={styles.heroText}>Completa tus datos y los del vehículo para iniciar la revisión.</Text></View>
      <Card>
        <Photo uri={profile.photo} onChange={(photo) => setProfile((current) => ({ ...current, photo }))} />
        <Text style={s.muted}>Usa una foto clara para identificarte durante tus viajes.</Text>
        <Field label="Nombres" value={profile.firstName} onChangeText={(firstName) => setProfile((current) => ({ ...current, firstName }))} autoCapitalize="words" />
        <Field label="Apellido paterno" value={profile.lastName} onChangeText={(lastName) => setProfile((current) => ({ ...current, lastName }))} autoCapitalize="words" />
        <Field label="Apellido materno" value={profile.maternalName} onChangeText={(maternalName) => setProfile((current) => ({ ...current, maternalName }))} autoCapitalize="words" />
        <Field label="DNI (8 dígitos)" value={profile.dni} onChangeText={(dni) => setProfile((current) => ({ ...current, dni: dni.replace(/\D/g, "").slice(0, 8) }))} keyboardType="number-pad" maxLength={8} />
        <Field label="Celular (+51)" value={profile.phone} onChangeText={(phone) => setProfile((current) => ({ ...current, phone: phone.replace(/\D/g, "").slice(0, 9) }))} keyboardType="phone-pad" maxLength={9} />
        <Field label="Correo" value={profile.email} onChangeText={(email) => setProfile((current) => ({ ...current, email }))} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Dirección" value={profile.address} onChangeText={(address) => setProfile((current) => ({ ...current, address }))} />
      </Card>
      <Card>
        <Text style={s.heading}>Tu vehículo</Text>
        <Field label="Marca y modelo" value={profile.vehicleModel} onChangeText={(vehicleModel) => setProfile((current) => ({ ...current, vehicleModel }))} autoCapitalize="words" />
        <View style={{ flexDirection: "row", gap: 9 }}>
          <View style={{ flex: 1 }}><Field label="Placa" value={profile.vehiclePlate} onChangeText={(vehiclePlate) => setProfile((current) => ({ ...current, vehiclePlate: vehiclePlate.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 8) }))} autoCapitalize="characters" /></View>
          <View style={{ flex: 1 }}><Field label="Color" value={profile.vehicleColor} onChangeText={(vehicleColor) => setProfile((current) => ({ ...current, vehicleColor }))} /></View>
        </View>
        <Field label="Año" value={profile.vehicleYear} onChangeText={(vehicleYear) => setProfile((current) => ({ ...current, vehicleYear: vehicleYear.replace(/\D/g, "").slice(0, 4) }))} keyboardType="number-pad" maxLength={4} />
        <Text style={s.muted}>Foto del vehículo</Text>
        <Photo label="foto de tu vehículo" uri={profile.vehiclePhoto} onChange={(vehiclePhoto) => setProfile((current) => ({ ...current, vehiclePhoto }))} />
        <Field label="Contacto de emergencia (opcional)" value={profile.emergencyName} onChangeText={(emergencyName) => setProfile((current) => ({ ...current, emergencyName }))} />
        <Field label="Celular de emergencia (opcional)" value={profile.emergencyPhone} onChangeText={(emergencyPhone) => setProfile((current) => ({ ...current, emergencyPhone: emergencyPhone.replace(/\D/g, "").slice(0, 9) }))} keyboardType="phone-pad" maxLength={9} />
      </Card>
      <Button disabled={!personalComplete} onPress={() => { dispatchDriver({ type: "profile", value: profile }); dispatchDriver({ type: "registrationStage", stage: "documents" }); }}>Continuar a documentos</Button>
      <Text style={s.muted}>Necesitamos nombre, DNI, celular, correo, foto, datos y foto del vehículo.</Text>
    </Screen>
  );

  if (stage === "documents") return (
    <Screen title="Documentos para revisión" back={() => dispatchDriver({ type: "registrationStage", stage: "personal" })}>
      <View style={styles.hero}><Text style={styles.eyebrow}>UN PASO MÁS</Text><Text style={styles.heroTitle}>Sube tus documentos</Text><Text style={styles.heroText}>Adjunta una foto legible o un PDF de cada documento.</Text></View>
      {driver.documents.soat.status === "rejected" && <Notice danger>El SOAT necesita actualizarse. Adjunta una versión vigente para volver a revisión.</Notice>}
      <Card>
        {documentRows.map(({ key, label }) => {
          const document = driver.documents[key];
          const statusColor = document.status === "approved" ? "#177749" : document.status === "rejected" ? "#b4232e" : document.file ? "#087f91" : "#647c80";
          const statusText = document.status === "approved" ? "Aprobado" : document.status === "rejected" ? "Actualizar" : document.file ? "Adjuntado" : "Pendiente";
          return <View key={key} style={styles.documentRow}><View style={{ flex: 1, gap: 3 }}><Text style={styles.documentName}>{label}</Text><Text numberOfLines={1} style={s.muted}>{document.file?.name ?? "Archivo JPG, PNG o PDF"}</Text></View><Text style={[styles.documentStatus, { color: statusColor }]}>{statusText}</Text><Upload label={label} value={document.file ?? undefined} onChange={(file) => saveDocument(key, file)} /></View>;
        })}
      </Card>
      <Notice>Revisaremos tus documentos. Al enviarlos, verás el estado y los siguientes pasos en esta pantalla.</Notice>
      <Button disabled={!docsComplete} onPress={() => dispatchDriver({ type: "submitDocuments" })}>Enviar a revisión</Button>
    </Screen>
  );

  if (stage === "review") return (
    <Screen title="Revisión de documentos">
      <View style={styles.reviewHero}><View style={styles.reviewIcon}><Text style={{ color: "#005b66", fontSize: 27, fontWeight: "900" }}>✓</Text></View><Text style={styles.heroTitle}>Estamos revisando tu registro</Text><Text style={styles.heroText}>El tiempo estimado es de hasta 24 horas. Te avisaremos cuando haya una actualización.</Text></View>
      <Card>
        <Text style={s.heading}>Documentos enviados</Text>
        {documentRows.map(({ key, label }) => <View key={key} style={styles.reviewRow}><Text style={s.text}>{label}</Text><Text style={styles.uploadedPill}>En revisión</Text></View>)}
      </Card>
      <Card>
        <Text style={s.heading}>Recorrido de demostración</Text>
        <Text style={s.muted}>Puedes probar los dos resultados de revisión antes de usar tu cuenta.</Text>
        <Button tone="secondary" onPress={() => dispatchDriver({ type: "demoRejectSoat" })}>Demo · Observar el SOAT</Button>
        <Button onPress={() => dispatchDriver({ type: "demoApproveDocuments" })}>Demo · Aprobar documentos</Button>
      </Card>
    </Screen>
  );

  if (stage === "plan") {
    const due = firstMonthlyDue(new Date());
    return (
      <Screen title="Elige tu forma de pago">
        <View style={styles.hero}><Text style={styles.eyebrow}>REGISTRO APROBADO</Text><Text style={styles.heroTitle}>¿Cómo prefieres pagar?</Text><Text style={styles.heroText}>Elige el esquema que mejor se acomode a tu manera de trabajar.</Text></View>
        <Card>
          <Text style={s.heading}>Por comisión</Text>
          <Text style={s.text}>Se descuenta el 10% de cada viaje completado. Si no trabajas, no se genera comisión.</Text>
          <Button tone="secondary" onPress={() => selectPlan("comision")}>Elegir comisión</Button>
        </Card>
        <Card>
          <Text style={s.heading}>Plan mensual</Text>
          <Text style={styles.monthlyPrice}>{soles(MONTHLY_FEE)}<Text style={styles.monthlySuffix}> / mes</Text></Text>
          <Text style={s.text}>Una cuota fija al mes, sin comisión por viaje.</Text>
          <Text style={styles.dueText}>Primer vencimiento · {fmtDate(due)}</Text>
          <Button onPress={() => selectPlan("mensual")}>Elegir plan mensual</Button>
        </Card>
        <Text style={s.muted}>Podrás cambiar tu forma de pago desde Billetera cuando no tengas saldo pendiente.</Text>
      </Screen>
    );
  }
  return null;
}

const styles = {
  hero: { gap: 5, padding: 17, borderRadius: 19, backgroundColor: "#087f91" },
  eyebrow: { color: "#baf3f4", fontSize: 10, fontWeight: "900" as const, letterSpacing: 1 },
  heroTitle: { color: "#fff", fontSize: 22, lineHeight: 27, fontWeight: "900" as const },
  heroText: { color: "#e1fbfc", fontSize: 12, lineHeight: 18, fontWeight: "600" as const },
  documentRow: { gap: 8, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#e0eef0" },
  documentName: { color: "#0d3e45", fontSize: 14, fontWeight: "800" as const },
  documentStatus: { fontSize: 10, fontWeight: "900" as const },
  reviewHero: { gap: 9, alignItems: "center" as const, padding: 22, borderRadius: 21, backgroundColor: "#dff6f7" },
  reviewIcon: { width: 54, height: 54, alignItems: "center" as const, justifyContent: "center" as const, borderRadius: 27, backgroundColor: "#fff" },
  reviewRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, gap: 8 },
  uploadedPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: "#dff6f7", color: "#087f91", fontSize: 10, fontWeight: "800" as const },
  monthlyPrice: { color: "#005b66", fontSize: 29, fontWeight: "900" as const },
  monthlySuffix: { color: "#526e73", fontSize: 13, fontWeight: "700" as const },
  dueText: { color: "#087f91", fontSize: 12, fontWeight: "900" as const },
};
