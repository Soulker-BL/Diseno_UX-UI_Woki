import { useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Button,
  Card,
  Confirm,
  Field,
  Notice,
  Photo,
  Screen,
  openLink,
  s,
  type Confirmation,
} from "../../components/ui";
import { newPassenger, useApp, type Contact, type TravelPreference } from "../../store";
import { PLACES, SUPPORT_PHONE, soles, waLink } from "./data";
import { getPassengerScreenTitle, goPassenger, type PassengerScreenName } from "./navigation";
import { TERMS } from "./terms";
import { DrawerTrigger, PassengerDrawer } from "./PassengerDrawer";
import { PassengerDemoButton } from "./PassengerDemoButton";

export function PassengerAccount({ screen }: { screen: PassengerScreenName }) {
  const { passenger: p, setPassenger: setP } = useApp();
  const [phone, setPhone] = useState(p.user.phone);
  const [email, setEmail] = useState(p.user.email);
  const [contacts, setContacts] = useState<Contact[]>(
    p.contacts.length ? p.contacts : [{ name: "", phone: "" }],
  );
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [newName, setNewName] = useState("");
  const [placeIndex, setPlaceIndex] = useState(0);
  const [editingPlaceIndex, setEditingPlaceIndex] = useState<number | null>(null);
  const [showDriverRequirements, setShowDriverRequirements] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const onboarding = screen === "emergency";
  const home = () => goPassenger("home", true);
  const back = () => onboarding ? goPassenger("register", true) : home();
  const receivedReviews = p.receivedReviews ?? [];
  const reviewAverage = receivedReviews.length
    ? receivedReviews.reduce((total, review) => total + review.rating, 0) / receivedReviews.length
    : 0;
  function updateContact(index: number, value: Partial<Contact>) {
    setContacts((list) =>
      list.map((contact, i) =>
        i === index ? { ...contact, ...value } : contact,
      ),
    );
  }
  function savePlaceEdit() {
    if (editingPlaceIndex === null) return;
    const selected = PLACES[placeIndex];
    setP((prev) => ({
      ...prev,
      saved: prev.saved.map((item, index) => index === editingPlaceIndex
        ? { ...item, ...selected, name: newName.trim(), detail: selected?.detail ?? item.detail }
        : item),
    }));
    setEditingPlaceIndex(null);
    setNewName("");
  }
  const logout = () => {
    setP(newPassenger());
    router.replace("/");
  };
  return (
    <Screen title={getPassengerScreenTitle(screen) ?? "Mi cuenta"} back={onboarding ? undefined : back} right={onboarding ? undefined : <DrawerTrigger onPress={() => setDrawerOpen(true)} />} bottomActions={onboarding ? <>
      <Pressable accessibilityRole="button" onPress={back} style={styles.onboardingBack}><Text style={styles.onboardingBackText}>‹  Volver</Text></Pressable>
      <PassengerDemoButton onPress={() => { setP((prev) => ({ ...prev, authenticated: true })); home(); }} />
    </> : undefined}>
      {!!message && <Notice>{message}</Notice>}
      {screen === "menu" && (
        <>
          <Card>
            <Text style={s.heading}>
              {p.user.first} {p.user.last}
            </Text>
            <Text style={s.muted}>Pasajero · +51 {p.user.phone}</Text>
          </Card>
          <Text style={styles.menuSectionTitle}>TU ESPACIO WOKI</Text>
          <View style={styles.menuGrid}>
            {([
              ["profile", "Mi perfil", "◉", "Tus datos"],
              ["places", "Mis lugares", "⌖", "Direcciones guardadas"],
              ["history", "Historial", "◷", "Tus viajes"],
              ["reviews", "Reseñas recibidas", "★", "Opiniones de conductores"],
              ["contacts", "Emergencia", "✚", "Contactos de confianza"],
              ["termsView", "Privacidad", "▤", "Términos y datos"],
            ] as const).map(([target, label, icon, subtitle]) => <Pressable key={target} accessibilityRole="button" onPress={() => goPassenger(target)} style={({ pressed }) => [styles.menuTile, pressed && { opacity: 0.78, transform: [{ scale: 0.98 }] }]}>
              <View style={styles.menuTileTop}><Text style={styles.menuTileIcon}>{icon}</Text><Text style={styles.menuTileArrow}>›</Text></View>
              <Text style={styles.menuTileTitle}>{label}</Text><Text style={styles.menuTileMeta}>{subtitle}</Text>
            </Pressable>)}
          </View>
          <Button compact tone="secondary" onPress={() => goPassenger("driverInfo")}>Quiero ser conductor</Button>
          {p.debt && (
            <Button
              tone="danger"
              onPress={() => goPassenger("debt")}
            >{`Deuda: ${soles(p.debt.amount)}`}</Button>
          )}
          <Text style={s.muted}>Soporte: {SUPPORT_PHONE}</Text>
          <Button
            tone="secondary"
            onPress={() => {
              void openLink(
                waLink(SUPPORT_PHONE, "Hola, necesito ayuda con Woki."),
              );
            }}
          >
            Ayuda por WhatsApp
          </Button>
          <Button tone="plain" onPress={logout}>
            Cerrar sesión
          </Button>
          <Button
            compact
            tone="linkDanger"
            disabled={!!p.debt}
            onPress={() =>
              setConfirmation({
                title: "¿Eliminar cuenta de este dispositivo?",
                message: "Se cerrará la sesión y se eliminarán los datos guardados en este dispositivo.",
                danger: true,
                hideClose: true,
                action: logout,
              })
            }
          >
            Eliminar mi cuenta
          </Button>
          {p.debt && (
            <Text style={s.muted}>
              Regulariza la deuda antes de eliminar la cuenta.
            </Text>
          )}
          <Button tone="plain" onPress={() => router.replace("/")}>
            Cambiar rol
          </Button>
        </>
      )}
      {screen === "profile" && (
        <>
          <Card>
            <Photo
              uri={p.user.photo}
              onChange={(photo) =>
                setP((prev) => ({ ...prev, user: { ...prev.user, photo } }))
              }
            />
            <Text style={[s.heading, { textAlign: "center" }]}>
              {p.user.first} {p.user.last} {p.user.lastMaterno}
            </Text>
            <View style={styles.profileRatingSummary}>
              <Text accessibilityLabel={receivedReviews.length ? `${reviewAverage.toFixed(1)} estrellas recibidas de conductores` : "Aún no tienes calificaciones de conductores"} style={styles.profileRatingStars}>★</Text>
              <Text style={styles.profileRatingValue}>{receivedReviews.length ? reviewAverage.toFixed(1) : "—"}</Text>
              <Text style={styles.profileRatingCount}>{receivedReviews.length} {receivedReviews.length === 1 ? "reseña recibida" : "reseñas recibidas"}</Text>
            </View>
            <View style={{ gap: 8 }}>
              <Text style={s.muted}>DNI</Text>
              <Text style={s.text}>{p.user.dni}</Text>
            </View>
            <Text style={s.muted}>Nombres y apellidos no editables.</Text>
          </Card>
          <Card compact>
            <View style={styles.profileSectionHeader}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.profileSectionTitle}>Reseñas recibidas</Text>
                <Text style={s.muted}>Opiniones que los conductores dejaron sobre ti.</Text>
              </View>
            </View>
            {receivedReviews.length === 0 ? (
              <Text style={styles.profileEmptyCopy}>Aún no tienes reseñas de conductores.</Text>
            ) : (
              <>
                {receivedReviews.slice(0, 2).map((review, index) => (
                  <View key={`${review.date}-${review.driver}-${index}`} style={styles.profileReviewItem}>
                    <View style={styles.profileReviewTop}><Text numberOfLines={1} style={styles.profileReviewDestination}>{review.driver}</Text><Text accessibilityLabel={`${review.rating} de 5 estrellas`} style={styles.profileReviewStars}>{"★".repeat(review.rating)}</Text></View>
                    <Text style={styles.profileReviewText}>{review.comment}</Text>
                  </View>
                ))}
              </>
            )}
          </Card>
          <Card compact>
            <Text style={styles.profileSectionTitle}>Cómo te gusta viajar</Text>
            <Text style={s.muted}>Elige la opción que mejor te describe.</Text>
            <View style={styles.preferenceOptions}>
              {(["En silencio", "Me gusta conversar", "Me adapto"] as const satisfies readonly TravelPreference[]).map((preference) => {
                const selected = (p.user.travelPreference ?? "Me adapto") === preference;
                return <Pressable key={preference} accessibilityRole="radio" accessibilityLabel={preference} accessibilityState={{ checked: selected }} onPress={() => setP((prev) => ({ ...prev, user: { ...prev.user, travelPreference: preference } }))} style={[styles.preferenceChip, selected && styles.preferenceChipSelected]}><Text style={[styles.preferenceLabel, selected && styles.preferenceLabelSelected]}>{preference}</Text></Pressable>;
              })}
            </View>
          </Card>
          <Field
            label="Celular (+51)"
            value={phone}
            keyboardType="phone-pad"
            maxLength={9}
            onChangeText={(v) => setPhone(v.replace(/\D/g, ""))}
          />
          <Field
            label="Correo"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            disabled={!/^9\d{8}$/.test(phone)}
            onPress={() => {
              setP((prev) => ({
                ...prev,
                user: { ...prev.user, phone, email },
              }));
              setMessage("Datos actualizados.");
            }}
          >
            Guardar cambios
          </Button>
          <View style={styles.dangerSection}>
            <Text style={[s.muted, styles.centeredText]}>Al continuar, se cerrará tu sesión y se eliminarán los datos guardados en este dispositivo.</Text>
            <Button
              compact
              centered
              tone="linkDanger"
              disabled={!!p.debt}
              onPress={() => setConfirmation({
                title: "¿Eliminar cuenta de este dispositivo?",
                message: "Se cerrará la sesión y se eliminarán los datos guardados en este dispositivo.",
                danger: true,
                hideClose: true,
                action: logout,
              })}
            >
              Eliminar cuenta
            </Button>
            {p.debt && <Text style={s.muted}>Regulariza tu deuda antes de eliminar la cuenta.</Text>}
          </View>
        </>
      )}
      {(screen === "contacts" || screen === "emergency") && (
        <>
          <View style={styles.emergencyIntro}><Text style={styles.emergencyIcon}>✚</Text><View style={{ flex: 1, gap: 3 }}><Text style={styles.emergencyTitle}>Viaja con una red de apoyo</Text><Text style={styles.emergencyCopy}>Comparte tu ubicación con una persona de confianza si algo no parece estar bien durante el viaje.</Text></View></View>
          {contacts.slice(0, 2).map((contact, index) => (
            <Card key={index} compact>
              <Text style={s.heading}>Contacto {index + 1}</Text>
              <Field
                label={`Nombre del contacto ${index + 1}`}
                value={contact.name}
                onChangeText={(name) => updateContact(index, { name })}
                style={{ height: 46, minHeight: 46, paddingVertical: 8 }}
              />
              <Field
                label={`Celular del contacto ${index + 1}`}
                value={contact.phone}
                maxLength={9}
                keyboardType="phone-pad"
                onChangeText={(v) =>
                  updateContact(index, { phone: v.replace(/\D/g, "") })
                }
                style={{ height: 46, minHeight: 46, paddingVertical: 8 }}
              />
              {!onboarding && <Button compact tone="plain" onPress={() => setContacts((list) => list.filter((_, i) => i !== index))}>Quitar contacto</Button>}
            </Card>
          ))}
          {contacts.length < 2 && (
            <Pressable accessibilityRole="button" accessibilityLabel="Agregar otro contacto de emergencia" onPress={() => setContacts((list) => [...list, { name: "", phone: "" }])} style={styles.addContactButton}>
              <Text style={styles.addContactGlyph}>+</Text><Text style={styles.addContactText}>Agregar otro contacto</Text>
            </Pressable>
          )}
          <Button
            compact
            centered
            disabled={
              contacts.length === 0 || !contacts.every((c) => c.name.trim() && /^9\d{8}$/.test(c.phone))
            }
            onPress={() => {
              setP((prev) => ({ ...prev, contacts, authenticated: onboarding ? true : prev.authenticated }));
              home();
            }}
          >
            Guardar contacto
          </Button>
          {onboarding && (
            <Pressable accessibilityRole="button" onPress={() => { setP((prev) => ({ ...prev, authenticated: true })); home(); }} style={styles.skipLink}><Text style={styles.skipLinkText}>Omitir por ahora</Text></Pressable>
          )}
        </>
      )}
      {screen === "driverInfo" && (
        <>
          <View style={styles.driverHero}>
            <Text style={styles.driverEyebrow}>{showDriverRequirements ? "SIGUIENTE PASO" : "CRECE CON WOKI"}</Text>
            <Text style={styles.driverHeadline}>{showDriverRequirements ? "Prepara tu registro" : "Tu ciudad. Tus rutas. Tu ritmo."}</Text>
            <Text style={styles.driverLead}>{showDriverRequirements ? "Revisa lo que necesitas para comenzar." : "Conecta con pasajeros de Cerro de Pasco desde una app hecha para viajes locales."}</Text>
          </View>
          {!showDriverRequirements ? <>
            <Text style={s.heading}>Una forma más clara de trabajar</Text>
            <View style={styles.driverBenefit}><View style={styles.driverBenefitIconWrap}><Text style={styles.driverBenefitIcon}>↗</Text></View><View style={{ flex: 1, gap: 3 }}><Text style={styles.driverBenefitTitle}>Mira viajes cerca de ti</Text><Text style={s.muted}>Revisa recojo, destino, tiempo y forma de pago antes de decidir.</Text></View></View>
            <View style={styles.driverBenefit}><View style={styles.driverBenefitIconWrap}><Text style={styles.driverBenefitIcon}>S/</Text></View><View style={{ flex: 1, gap: 3 }}><Text style={styles.driverBenefitTitle}>Elige tu tarifa</Text><Text style={s.muted}>Acepta una propuesta o envía una contraoferta desde la app.</Text></View></View>
            <View style={styles.driverBenefit}><View style={styles.driverBenefitIconWrap}><Text style={styles.driverBenefitIcon}>✓</Text></View><View style={{ flex: 1, gap: 3 }}><Text style={styles.driverBenefitTitle}>Sigue tu actividad</Text><Text style={s.muted}>Consulta tus viajes y ganancias en tu perfil de conductor.</Text></View></View>
            <Button onPress={() => setShowDriverRequirements(true)}>Continuar</Button>
          </> : <>
            <View style={styles.driverRequirements}><Text style={styles.driverRequirementsTitle}>¿Qué necesitas para empezar?</Text>{["Licencia de conducir vigente", "SOAT y revisión técnica", "Tarjeta de propiedad del vehículo", "Datos y fotos del auto"].map((item) => <View key={item} style={styles.driverRequirementRow}><Text style={styles.driverRequirementCheck}>✓</Text><Text style={styles.driverRequirementText}>{item}</Text></View>)}</View>
            <View style={styles.actionRow}><Button compact tone="secondary" onPress={() => setShowDriverRequirements(false)}>Volver</Button><Button onPress={() => router.push("/conductor/perfil")}>Empezar registro</Button></View>
            <Text style={styles.driverFootnote}>El perfil te guiará para completar tus datos y enviar los documentos del vehículo a revisión.</Text>
          </>}
        </>
      )}
      {screen === "places" && (
        <>
          {p.saved.map((place) => (
            <Card key={place.name}>
              {editingPlaceIndex === p.saved.findIndex((item) => item.name === place.name) ? <>
                <Text style={styles.editEyebrow}>EDITAR DIRECCIÓN</Text>
                <Field label="Nombre del lugar" value={newName} onChangeText={setNewName} />
                <Text style={s.muted}>Elige la dirección</Text>
                <View style={styles.actionRow}>{PLACES.filter((item) => !item.outOfZone).map((item) => { const index = PLACES.indexOf(item); return <Button key={item.name} compact tone={placeIndex === index ? "primary" : "secondary"} onPress={() => setPlaceIndex(index)}>{item.name}</Button>; })}</View>
                <View style={styles.actionRow}><Button compact disabled={!newName.trim()} onPress={savePlaceEdit}>Guardar</Button><Button compact tone="plain" onPress={() => { setEditingPlaceIndex(null); setNewName(""); }}>Cancelar</Button></View>
              </> : <>
                <View style={styles.placeHeading}><View style={styles.placeIcon}><Text style={styles.placeIconText}>⌖</Text></View><View style={{ flex: 1, gap: 4 }}><Text style={s.heading}>{place.name}</Text><Text style={s.muted}>{place.detail}</Text></View></View>
                <View style={styles.actionRow}>
                  <Button compact tone="secondary" onPress={() => { const index = p.saved.findIndex((item) => item.name === place.name); setEditingPlaceIndex(index); setNewName(place.name); const selected = PLACES.findIndex((item) => item.name === place.detail); if (selected >= 0) setPlaceIndex(selected); }}>Editar</Button>
                  <Button compact tone="plain" onPress={() => setConfirmation({ title: "¿Eliminar lugar guardado?", message: `${place.name} dejará de aparecer en tus direcciones.`, danger: true, action: () => setP((prev) => ({ ...prev, saved: prev.saved.filter((item) => item.name !== place.name) })) })}>Eliminar</Button>
                </View>
              </>}
            </Card>
          ))}
          {editingPlaceIndex === null && <Card>
            <View style={styles.placesFormHeader}><View style={styles.placeIcon}><Text style={styles.placeIconText}>＋</Text></View><View style={{ flex: 1, gap: 3 }}><Text style={s.heading}>Guardar un lugar</Text><Text style={s.muted}>Ten tus destinos frecuentes a mano.</Text></View></View>
            <Field
              label="Nombre corto"
              value={newName}
              onChangeText={setNewName}
              placeholder="Ej. Casa"
            />
            <Text style={styles.editEyebrow}>ELIGE UNA DIRECCIÓN</Text>
            <View style={styles.actionRow}>{PLACES.filter((place) => !place.outOfZone).map((place) => {
              const index = PLACES.indexOf(place);
              return <Button compact key={place.name} tone={placeIndex === index ? "primary" : "secondary"} onPress={() => setPlaceIndex(index)}>{place.name}</Button>;
            })}</View>
            <View style={styles.selectedPlace}><View style={styles.placeIcon}><Text style={styles.placeIconText}>⌖</Text></View><View style={{ flex: 1, gap: 2 }}><Text style={styles.selectedPlaceLabel}>DESTINO SELECCIONADO</Text><Text style={styles.selectedPlaceName}>{PLACES[placeIndex]?.name}</Text><Text style={styles.selectedPlaceDetail}>{PLACES[placeIndex]?.detail}</Text></View><Text style={styles.selectedPlaceCheck}>✓</Text></View>
            <Button
              disabled={
                !newName.trim() ||
                p.saved.some(
                  (place) =>
                    place.name.toLowerCase() === newName.trim().toLowerCase(),
                )
              }
              onPress={() => {
                const place = PLACES[placeIndex];
                setP((prev) => ({
                  ...prev,
                  saved: [
                    ...prev.saved,
                    { ...place, detail: place.name, name: newName.trim() },
                  ],
                }));
                setNewName("");
              }}
            >
              Guardar lugar
            </Button>
          </Card>}
        </>
      )}
      {screen === "history" && (
        <>
          {!p.trips.length && <Text style={s.text}>Aún no tienes viajes.</Text>}
          {p.trips.map((trip, index) => (
            <Card key={`${trip.date}-${index}`}>
              <Text style={s.heading}>{trip.to}</Text>
              <Text style={s.text}>
                {trip.from} → {trip.to}
              </Text>
              <Text style={s.muted}>
                {trip.date} · {trip.driver}
              </Text>
              <View style={s.row}>
                <Text style={s.price}>{soles(trip.price)}</Text>
                <Text style={s.badge}>{trip.status}</Text>
              </View>
              <Button
                compact
                tone="plain"
                onPress={() => {
                  void openLink(
                    waLink(
                      SUPPORT_PHONE,
                      `Hola, tengo un problema con mi viaje a ${trip.to}, ${trip.date}.`,
                    ),
                  );
                }}
              >
                Reportar a soporte
              </Button>
              <Button compact tone="danger" onPress={() => setConfirmation({ title: "¿Eliminar este viaje del historial?", message: `Se quitará el viaje a ${trip.to} de este dispositivo.`, danger: true, action: () => setP((prev) => ({ ...prev, trips: prev.trips.filter((_, tripIndex) => tripIndex !== index) })) })}>Eliminar del historial</Button>
            </Card>
          ))}
        </>
      )}
      {screen === "reviews" && (
        <>
          {receivedReviews.length === 0 ? (
            <Card>
              <Text style={s.heading}>Aún no tienes reseñas de conductores</Text>
              <Text style={s.text}>Cuando un conductor comparta su opinión de un viaje, aparecerá aquí.</Text>
            </Card>
          ) : (
            <>
              <Text style={s.muted}>Opiniones que recibiste de los conductores.</Text>
              {receivedReviews.map((review, index) => (
                <Card key={`${review.date}-${review.driver}-${index}`}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <Text numberOfLines={1} style={s.heading}>{review.driver}</Text>
                    <Text accessibilityLabel={`${review.rating} de 5 estrellas`} style={styles.profileReviewStars}>{"★".repeat(review.rating)}</Text>
                  </View>
                  <Text style={s.muted}>{review.date}</Text>
                  <Text style={s.text}>{review.comment}</Text>
                </Card>
              ))}
            </>
          )}
        </>
      )}
      {screen === "termsView" &&
        <>
          <View style={styles.privacyIntro}><Text style={styles.privacyEyebrow}>WOKI · INFORMACIÓN CLARA</Text><Text style={styles.privacyTitle}>Tu seguridad y privacidad importan.</Text><Text style={styles.privacyCopy}>Revisa cómo funciona el servicio y cómo se cuidan tus datos.</Text></View>
          {TERMS.map(([title, text]) => (
          <Card key={title}>
            <Text style={s.heading}>{title}</Text>
            <Text style={s.text}>{text}</Text>
          </Card>
          ))}
        </>}
      {screen === "driverMode" && (
        <>
          <Text style={s.text}>
            Completa y revisa tus documentos desde el perfil del Conductor.
          </Text>
          <Button onPress={() => router.push("/conductor/perfil")}>
            Abrir modo conductor
          </Button>
        </>
      )}
      {screen === "debt" &&
        (p.debt ? (
          <>
            <Notice danger>
              Tu cuenta está bloqueada para nuevas solicitudes hasta regularizar
              este viaje.
            </Notice>
            <Card>
              <Text style={s.heading}>{p.debt.trip}</Text>
              <Text style={s.price}>{soles(p.debt.amount)}</Text>
            </Card>
            <Text style={s.muted}>
              Comunícate con soporte para revisar este pago pendiente.
            </Text>
            <Button
              onPress={() => {
                void openLink(
                  waLink(
                    SUPPORT_PHONE,
                    `Hola, necesito ayuda para revisar el pago pendiente de ${p.debt!.trip}.`,
                  ),
                );
              }}
            >
              Contactar a soporte
            </Button>
          </>
        ) : (
          <Notice>No tienes deudas pendientes.</Notice>
        ))}
      <Confirm value={confirmation} close={() => setConfirmation(null)} />
      {drawerOpen && (
        <PassengerDrawer
          close={() => setDrawerOpen(false)}
          onNavigate={(target) => { setDrawerOpen(false); goPassenger(target); }}
          activeScreen={screen}
          name={`${p.user.first} ${p.user.last} ${p.user.lastMaterno}`.trim()}
          phone={p.user.phone}
          photo={p.user.photo}
          logout={logout}
          support={() => { setDrawerOpen(false); void openLink(waLink(SUPPORT_PHONE, "Hola, necesito ayuda con Woki.")); }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  menuSectionTitle: { color: "#178893", fontSize: 10, fontWeight: "900", letterSpacing: 1 }, menuGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, menuTile: { width: "47%", minHeight: 112, justifyContent: "space-between", padding: 13, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccecef" }, menuTileTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, menuTileIcon: { width: 34, height: 34, overflow: "hidden", borderRadius: 12, textAlign: "center", textAlignVertical: "center", color: "#087f91", backgroundColor: "#d8f7f8", fontSize: 19, fontWeight: "900" }, menuTileArrow: { color: "#39aeb8", fontSize: 22, fontWeight: "700" }, menuTileTitle: { color: "#0d3e45", fontSize: 14, fontWeight: "900" }, menuTileMeta: { color: "#528086", fontSize: 10, lineHeight: 14, fontWeight: "600" },
  actionRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }, placeHeading: { flexDirection: "row", alignItems: "center", gap: 12 }, placeIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#c8f3f5" }, placeIconText: { color: "#087f91", fontSize: 22, fontWeight: "900" }, editEyebrow: { color: "#128b96", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  dangerSection: { alignItems: "center", gap: 5, paddingTop: 5 }, centeredText: { textAlign: "center" },
  onboardingBack: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 }, onboardingBackText: { color: "#005b66", fontSize: 13, fontWeight: "800" },
  placesFormHeader: { flexDirection: "row", alignItems: "center", gap: 11 }, selectedPlace: { flexDirection: "row", alignItems: "center", gap: 10, padding: 11, borderRadius: 15, backgroundColor: "#eff9fa" }, selectedPlaceLabel: { color: "#448189", fontSize: 8, fontWeight: "900", letterSpacing: 0.8 }, selectedPlaceName: { color: "#0d3e45", fontSize: 13, fontWeight: "900" }, selectedPlaceDetail: { color: "#5a8287", fontSize: 10 }, selectedPlaceCheck: { color: "#148d99", fontSize: 18, fontWeight: "900" },
  profileRatingSummary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: -3 }, profileRatingStars: { color: "#c87900", fontSize: 17, fontWeight: "900" }, profileRatingValue: { color: "#634600", fontSize: 14, fontWeight: "900" }, profileRatingCount: { color: "#526e73", fontSize: 11, fontWeight: "700" },
  profileSectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 }, profileSectionTitle: { color: "#0d3e45", fontSize: 15, fontWeight: "900" }, profileReviewItem: { gap: 4, padding: 10, borderRadius: 13, backgroundColor: "#f4fafb" }, profileReviewTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 7 }, profileReviewDestination: { flex: 1, color: "#16464d", fontSize: 12, fontWeight: "800" }, profileReviewStars: { color: "#c87900", fontSize: 11, fontWeight: "900" }, profileReviewText: { color: "#526e73", fontSize: 12, lineHeight: 17 }, profileEmptyCopy: { color: "#526e73", fontSize: 12, lineHeight: 18 }, preferenceOptions: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, preferenceChip: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, borderRadius: 22, borderWidth: 1, borderColor: "#c4e4e7", backgroundColor: "#fff" }, preferenceChipSelected: { borderColor: "#087f91", backgroundColor: "#e1f7f8" }, preferenceLabel: { color: "#446c72", fontSize: 11, fontWeight: "700" }, preferenceLabelSelected: { color: "#005b66", fontWeight: "900" },
  privacyIntro: { gap: 7, padding: 18, borderRadius: 20, backgroundColor: "#087f91" }, privacyEyebrow: { color: "#baf3f4", fontSize: 10, fontWeight: "900", letterSpacing: 1 }, privacyTitle: { color: "#fff", fontSize: 21, lineHeight: 27, fontWeight: "900" }, privacyCopy: { color: "#e2fbfc", fontSize: 12, lineHeight: 18, fontWeight: "600" },
  skipLink: { alignSelf: "center", minHeight: 44, justifyContent: "center", paddingHorizontal: 12 }, skipLinkText: { color: "#111111", fontSize: 13, fontWeight: "700", textDecorationLine: "underline" },
  emergencyIntro: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 17, borderWidth: 1, borderColor: "#98e0e4", backgroundColor: "#def8f9" }, emergencyIcon: { width: 38, height: 38, borderRadius: 13, overflow: "hidden", textAlign: "center", textAlignVertical: "center", color: "#087f91", backgroundColor: "#fff", fontSize: 20, fontWeight: "900" }, emergencyTitle: { color: "#075c66", fontSize: 14, fontWeight: "900" }, emergencyCopy: { color: "#36777d", fontSize: 11, lineHeight: 15, fontWeight: "600" },
  addContactButton: { minHeight: 42, alignSelf: "center", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: "#9bdde2", backgroundColor: "#effbfc" }, addContactGlyph: { color: "#087f91", fontSize: 22, lineHeight: 24, fontWeight: "700" }, addContactText: { color: "#087f91", fontSize: 12, fontWeight: "800" },
  driverHero: { gap: 9, overflow: "hidden", padding: 20, borderRadius: 23, backgroundColor: "#087f91", borderWidth: 1, borderColor: "#65d9dd" },
  driverEyebrow: { color: "#ffd26f", fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  driverHeadline: { color: "#fff", fontSize: 27, lineHeight: 32, fontWeight: "900", letterSpacing: -0.5 },
  driverLead: { color: "#e1fbfc", fontSize: 13, lineHeight: 19, fontWeight: "600" },
  driverBenefit: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 17, borderWidth: 1, borderColor: "#bfe5e9", backgroundColor: "#fff" },
  driverBenefitIconWrap: { width: 38, height: 38, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#c9f4f6" }, driverBenefitIcon: { color: "#005b66", fontSize: 16, fontWeight: "900", textAlign: "center" },
  driverBenefitTitle: { color: "#005b66", fontSize: 14, fontWeight: "900" },
  driverRequirements: { gap: 12, padding: 16, borderRadius: 18, backgroundColor: "#fff0bd", borderWidth: 1, borderColor: "#ffd56b" },
  driverRequirementsTitle: { color: "#684800", fontSize: 15, fontWeight: "900" },
  driverRequirementRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  driverRequirementCheck: { width: 22, height: 22, textAlign: "center", textAlignVertical: "center", overflow: "hidden", borderRadius: 11, color: "#fff", backgroundColor: "#087f91", fontSize: 13, fontWeight: "900" },
  driverRequirementText: { flex: 1, color: "#493e24", fontSize: 12, fontWeight: "700" },
  driverFootnote: { color: "#526e73", fontSize: 11, lineHeight: 16, textAlign: "center" },
});
