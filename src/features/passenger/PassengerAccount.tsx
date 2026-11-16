import { useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
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
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPlaceColor, setNewPlaceColor] = useState("#218e97");
  const [placeIndex, setPlaceIndex] = useState(0);
  const [editingPlaceIndex, setEditingPlaceIndex] = useState<number | null>(null);
  const [addingPlace, setAddingPlace] = useState(false);
  const [showDriverRequirements, setShowDriverRequirements] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const onboarding = screen === "emergency";
  const detailHeader = ["profile", "places", "history", "reviews", "contacts", "termsView"].includes(screen);
  const home = () => goPassenger("home", true);
  const back = () => onboarding ? goPassenger("register", true) : home();
  const receivedReviews = p.receivedReviews ?? [];
  const reviewAverage = receivedReviews.length
    ? receivedReviews.reduce((total, review) => total + review.rating, 0) / receivedReviews.length
    : 0;
  const placeResults = newAddress.trim() ? PLACES.filter((place) => !place.outOfZone && place.detail.toLowerCase().includes(newAddress.trim().toLowerCase())) : [];
  const contactFormItems = onboarding ? contacts.slice(0, 2).map((contact, index) => ({ contact, index })) : editingContactIndex !== null && contacts[editingContactIndex] ? [{ contact: contacts[editingContactIndex], index: editingContactIndex }] : p.contacts.length === 0 && contacts[0] ? [{ contact: contacts[0], index: 0 }] : [];
  const canAddContact = contacts.length < 2 && (onboarding || p.contacts.length > 0) && (onboarding || editingContactIndex === null);
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
        ? { ...item, ...selected, name: newName.trim(), detail: selected?.detail ?? item.detail, accentColor: selected?.accentColor ?? item.accentColor }
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
    <Screen title={getPassengerScreenTitle(screen) ?? "Mi cuenta"} back={onboarding || detailHeader ? undefined : back} actionsBesideTitle={detailHeader} squareHeader={screen === "places" || screen === "contacts" || screen === "emergency"}
      right={onboarding ? undefined : detailHeader ? <Pressable accessibilityRole="button" accessibilityLabel="Volver al inicio" onPress={back} style={styles.sectionBack}><Text style={styles.sectionBackText}>‹  Volver</Text></Pressable> : <DrawerTrigger onPress={() => setDrawerOpen(true)} />} bottomActions={onboarding ? <>
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
          {!onboarding && p.contacts.map((contact, index) => <Card key={contact.phone + index} compact><View style={styles.savedContactCard}><View style={styles.savedContactNumber}><Text style={styles.savedContactNumberText}>{index + 1}</Text></View><View style={styles.savedContactCopy}><Text numberOfLines={1} style={styles.savedContactName}>{contact.name}</Text><Text style={styles.savedContactPhone}>+51 {contact.phone}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={"Editar contacto " + (index + 1)} onPress={() => { setContacts(p.contacts.map((item) => ({ ...item }))); setEditingContactIndex(index); setMessage(""); }} style={styles.savedContactEdit}><Text style={styles.savedContactEditText}>Editar</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={"Eliminar contacto " + (index + 1)} onPress={() => setConfirmation({ title: "¿Eliminar este contacto?", message: contact.name + " dejará de ser tu contacto de emergencia.", danger: true, action: () => { setP((prev) => ({ ...prev, contacts: prev.contacts.filter((_, i) => i !== index) })); setContacts((list) => list.filter((_, i) => i !== index)); if (editingContactIndex === index) setEditingContactIndex(null); } })} style={styles.savedContactDelete}><Text style={styles.savedContactDeleteText}>Eliminar</Text></Pressable></View></Card>)}
          {contactFormItems.map(({ contact, index }) => <Card key={index} compact>
            <View style={styles.contactHeaderRow}><Text style={styles.contactTitle}>Contacto {index + 1}</Text>{(index > 0 || p.contacts.some((saved) => saved.name === contact.name && saved.phone === contact.phone)) && <Pressable accessibilityRole="button" accessibilityLabel={"Quitar contacto " + (index + 1)} onPress={() => { setContacts((list) => list.filter((_, i) => i !== index)); setP((prev) => ({ ...prev, contacts: prev.contacts.filter((saved) => saved.name !== contact.name || saved.phone !== contact.phone) })); setEditingContactIndex(null); }} style={styles.removeContactHeader}><Text style={styles.removeContactHeaderText}>−</Text></Pressable>}</View>
            <Field label="Nombre" value={contact.name} onChangeText={(name) => updateContact(index, { name })} placeholder="Nombre de tu contacto" style={styles.contactInput} />
            <Field label="Celular" value={contact.phone} maxLength={9} keyboardType="phone-pad" onChangeText={(value) => updateContact(index, { phone: value.replace(/\D/g, "") })} placeholder="987 654 321" style={styles.contactInput} />
          </Card>)}
          <View style={styles.contactsFooterActions}>
            {canAddContact && <Pressable accessibilityRole="button" accessibilityLabel="Agregar otro contacto de emergencia" onPress={() => { const index = contacts.length; setContacts((list) => [...list, { name: "", phone: "" }]); if (!onboarding) setEditingContactIndex(index); }} style={styles.contactFooterButton}><Text style={styles.contactFooterAddText}>＋ Agregar contacto</Text></Pressable>}
            {contactFormItems.length > 0 && <Pressable accessibilityRole="button" accessibilityState={{ disabled: contacts.length === 0 || !contacts.every((item) => item.name.trim() && /^9\d{8}$/.test(item.phone)) }} disabled={contacts.length === 0 || !contacts.every((item) => item.name.trim() && /^9\d{8}$/.test(item.phone))} onPress={() => { setP((prev) => ({ ...prev, contacts, authenticated: onboarding ? true : prev.authenticated })); if (onboarding) home(); else { setEditingContactIndex(null); setMessage("Contacto guardado."); } }} style={[styles.contactFooterButton, styles.contactFooterSave]}><Text style={styles.contactFooterSaveText}>Guardar contacto</Text></Pressable>}
          </View>
          {!onboarding && editingContactIndex !== null && <Pressable accessibilityRole="button" onPress={() => { setContacts(p.contacts.map((item) => ({ ...item }))); setEditingContactIndex(null); }} style={styles.cancelContactEdit}><Text style={styles.cancelContactEditText}>Cancelar edición</Text></Pressable>}
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
            <View key={place.name} style={[styles.savedPlaceCard, { borderColor: place.accentColor ?? "#218e97" }]}>
              {editingPlaceIndex === p.saved.findIndex((item) => item.name === place.name) ? <>
                <Text style={styles.editEyebrow}>EDITAR DIRECCIÓN</Text>
                <Field label="Nombre del lugar" value={newName} onChangeText={setNewName} />
                <Text style={s.muted}>Elige la dirección</Text>
                <View style={styles.actionRow}>{PLACES.filter((item) => !item.outOfZone).map((item) => { const index = PLACES.indexOf(item); return <Button key={item.name} compact tone={placeIndex === index ? "primary" : "secondary"} onPress={() => setPlaceIndex(index)}>{item.name}</Button>; })}</View>
                <View style={styles.actionRow}><Button compact disabled={!newName.trim()} onPress={savePlaceEdit}>Guardar</Button><Button compact tone="plain" onPress={() => { setEditingPlaceIndex(null); setNewName(""); }}>Cancelar</Button></View>
              </> : <>
                <View style={styles.savedPlaceSummary}><View style={styles.savedPlacePin}><Svg width={25} height={31} viewBox="0 0 24 30"><Path d="M12 28S3.7 18.1 3.7 11.5a8.3 8.3 0 1 1 16.6 0C20.3 18.1 12 28 12 28Z" fill="#218e97" /><Circle cx="12" cy="11.5" r="3" fill="#fff" /></Svg></View><View style={styles.savedPlaceCopy}><Text numberOfLines={1} style={styles.savedPlaceName}>{place.name}</Text><Text numberOfLines={1} style={styles.savedPlaceAddress}>{place.detail}</Text></View><View accessibilityLabel="Color elegido" style={[styles.savedPlaceColor, { backgroundColor: place.accentColor ?? "#218e97" }]} /></View>
                <View style={styles.savedPlaceActions}>
                  <Pressable accessibilityRole="button" onPress={() => { const index = p.saved.findIndex((item) => item.name === place.name); setEditingPlaceIndex(index); setNewName(place.name); const selected = PLACES.findIndex((item) => item.name === place.detail); if (selected >= 0) setPlaceIndex(selected); }} style={styles.savedPlaceEditButton}><Text style={styles.savedPlaceEditText}>Editar</Text></Pressable>
                  <Pressable accessibilityRole="button" onPress={() => setConfirmation({ title: "¿Eliminar lugar guardado?", message: place.name + " dejará de aparecer en tus direcciones.", danger: true, action: () => setP((prev) => ({ ...prev, saved: prev.saved.filter((item) => item.name !== place.name) })) })} style={styles.savedPlaceDeleteButton}><Text style={styles.savedPlaceDeleteText}>Eliminar</Text></Pressable>
                </View>
              </>}
            </View>
          ))}
          {editingPlaceIndex === null && !addingPlace && <Pressable accessibilityRole="button" onPress={() => setAddingPlace(true)} style={styles.addNewPlaceButton}><Text style={styles.addNewPlaceGlyph}>＋</Text><Text style={styles.addNewPlaceText}>Agregar nuevo lugar</Text></Pressable>}
          {editingPlaceIndex === null && addingPlace && <Card compact>
            <View style={styles.placesFormHeader}><View style={styles.placeIcon}><Text style={styles.placeIconText}>＋</Text></View><View style={{ flex: 1, gap: 3 }}><Text style={s.heading}>Guardar un lugar</Text><Text style={s.muted}>Ten tus destinos frecuentes a mano.</Text></View></View>
            <Field label="Nombre de la ubicación" value={newName} onChangeText={setNewName} placeholder="Ej. Casa" />
            <Field label="Dirección" value={newAddress} onChangeText={(value) => { setNewAddress(value); const match = PLACES.findIndex((place) => !place.outOfZone && place.detail.toLowerCase().includes(value.trim().toLowerCase())); if (match >= 0) setPlaceIndex(match); }} placeholder="Escribe una dirección o lugar" />
            {!!newAddress.trim() && <Text style={styles.editEyebrow}>DIRECCIONES</Text>}
            {!!newAddress.trim() && <View style={styles.placeSearchResults}>{placeResults.slice(0, 4).map((place) => {
              const index = PLACES.indexOf(place);
              return <Pressable key={place.name} accessibilityRole="radio" accessibilityState={{ checked: placeIndex === index }} onPress={() => { setPlaceIndex(index); setNewAddress(place.detail); }} style={[styles.placeSearchResult, placeIndex === index && styles.placeSearchResultSelected]}><View style={styles.placeSearchResultCopy}><Text numberOfLines={1} style={styles.placeSearchResultTitle}>{place.detail}</Text></View>{placeIndex === index && <Text style={styles.selectedPlaceCheck}>✓</Text>}</Pressable>;
            })}{newAddress.trim() && placeResults.length === 0 && <Text style={s.muted}>No encontramos coincidencias en esta lista. Prueba con un lugar frecuente.</Text>}</View>}
            <View style={styles.placeColorSection}><Text style={styles.placeColorTitle}>Color de ubicación</Text><View style={styles.placeColorOptions}>{["#218e97", "#f5a524", "#dc5860", "#8c63bd", "#477fca", "#35a853", "#ef6c35", "#e04b9a", "#34495e"].map((color) => <Pressable key={color} accessibilityRole="radio" accessibilityLabel={"Color " + color} accessibilityState={{ checked: newPlaceColor === color }} onPress={() => setNewPlaceColor(color)} style={[styles.placeColorOption, newPlaceColor === color && styles.placeColorOptionSelected]}><View style={[styles.placeColorSwatch, { backgroundColor: color }]} /></Pressable>)}</View></View>
            <View style={styles.placeFormActions}><Pressable accessibilityRole="button" onPress={() => { setNewName(""); setNewAddress(""); setNewPlaceColor("#218e97"); setAddingPlace(false); }} style={styles.placeCancelButton}><Text style={styles.placeCancelText}>Cancelar</Text></Pressable><Pressable accessibilityRole="button" accessibilityState={{ disabled: !newName.trim() || !newAddress.trim() || !placeResults.length }} disabled={!newName.trim() || !newAddress.trim() || !placeResults.length || p.saved.some((place) => place.name.toLowerCase() === newName.trim().toLowerCase())} onPress={() => {
              const place = PLACES[placeIndex];
              setP((prev) => ({ ...prev, saved: [...prev.saved, { ...place, name: newName.trim(), accentColor: newPlaceColor }] }));
              setNewName(""); setNewAddress(""); setNewPlaceColor("#218e97"); setAddingPlace(false);
            }} style={[styles.placeSaveButton, (!newName.trim() || !newAddress.trim() || !placeResults.length || p.saved.some((place) => place.name.toLowerCase() === newName.trim().toLowerCase())) && styles.placeSaveButtonDisabled]}><Text style={styles.placeSaveText}>Guardar</Text></Pressable></View>
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
  actionRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }, placeHeading: { flexDirection: "row", alignItems: "center", gap: 12 }, placeIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#c8f3f5" }, placeIconText: { color: "#087f91", fontSize: 22, fontWeight: "900" }, savedPlaceCard: { gap: 8, padding: 12, borderRadius: 15, borderWidth: 1.5, backgroundColor: "#fff" }, addNewPlaceButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#218e97", backgroundColor: "#f3fbfc" }, addNewPlaceGlyph: { color: "#087f91", fontSize: 22, fontWeight: "800" }, addNewPlaceText: { color: "#087f91", fontSize: 14, fontWeight: "900" }, savedPlaceSummary: { flexDirection: "row", alignItems: "center", gap: 11 }, savedPlacePin: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#c8f3f5" }, savedPlaceCopy: { flex: 1, minWidth: 0, gap: 4 }, savedPlaceName: { color: "#111", fontSize: 14, fontWeight: "900" }, savedPlaceAddress: { color: "#526e73", fontSize: 12, fontWeight: "700" }, savedPlaceColor: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: "#fff", elevation: 2 }, savedPlaceActions: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, marginTop: 3 }, savedPlaceEditButton: { minHeight: 34, minWidth: 68, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#e6f7f8" }, savedPlaceEditText: { color: "#087f91", fontSize: 12, fontWeight: "800" }, savedPlaceDeleteButton: { minHeight: 34, minWidth: 68, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#fff0f1" }, savedPlaceDeleteText: { color: "#b4232d", fontSize: 12, fontWeight: "800" }, editEyebrow: { color: "#128b96", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  dangerSection: { alignItems: "center", gap: 5, paddingTop: 5 }, centeredText: { textAlign: "center" },
  onboardingBack: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 }, onboardingBackText: { color: "#005b66", fontSize: 13, fontWeight: "800" }, sectionBack: { minHeight: 42, minWidth: 78, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, borderRadius: 13, backgroundColor: "#ffffff26", borderWidth: 1, borderColor: "#ffffff4a" }, sectionBackText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  placesFormHeader: { flexDirection: "row", alignItems: "center", gap: 11 }, savedContactCard: { flexDirection: "row", alignItems: "center", gap: 8 }, savedContactNumber: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#c8f3f5" }, savedContactNumberText: { color: "#087f91", fontSize: 13, fontWeight: "900" }, savedContactCopy: { flex: 1, minWidth: 0, gap: 3 }, savedContactName: { color: "#111", fontSize: 13, fontWeight: "900" }, savedContactPhone: { color: "#526e73", fontSize: 11, fontWeight: "700" }, savedContactEdit: { minHeight: 34, justifyContent: "center", paddingHorizontal: 5 }, savedContactEditText: { color: "#087f91", fontSize: 11, fontWeight: "800" }, savedContactDelete: { minHeight: 34, justifyContent: "center", paddingHorizontal: 4 }, savedContactDeleteText: { color: "#b4232d", fontSize: 11, fontWeight: "800" }, contactTitle: { color: "#0d3e45", fontSize: 15, fontWeight: "900" }, removeContactHeader: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#fff0f1" }, removeContactHeaderText: { color: "#c62836", fontSize: 23, lineHeight: 26, fontWeight: "900" }, contactInput: { minHeight: 44, height: 44, paddingVertical: 7, borderRadius: 11 }, removeContactInline: { minHeight: 34, alignSelf: "flex-end", justifyContent: "center", paddingHorizontal: 4 }, removeContactInlineText: { color: "#c62836", fontSize: 12, fontWeight: "900" }, cancelContactEdit: { alignSelf: "center", minHeight: 40, justifyContent: "center", paddingHorizontal: 10 }, cancelContactEditText: { color: "#087f91", fontSize: 12, fontWeight: "800", textDecorationLine: "underline" }, placeSearchResults: { gap: 6 }, placeSearchResult: { minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: "#d6e9eb", backgroundColor: "#fff" }, placeSearchResultSelected: { borderColor: "#087f91", backgroundColor: "#e8f8f9" }, placeSearchResultCopy: { flex: 1, gap: 3 }, placeSearchResultTitle: { color: "#111", fontSize: 12, fontWeight: "800" }, placeSearchResultDetail: { color: "#526e73", fontSize: 11 }, placeColorSection: { gap: 8, alignItems: "flex-start", alignSelf: "stretch" }, placeColorTitle: { alignSelf: "flex-start", color: "#26383a", fontSize: 12, fontWeight: "800" }, placeColorOptions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", alignSelf: "stretch", gap: 9 }, placeColorOption: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 16, borderWidth: 1, borderColor: "#c8dadd" }, placeColorOptionSelected: { borderWidth: 2, borderColor: "#111" }, placeColorSwatch: { width: 24, height: 24, borderRadius: 9 }, placeFormActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }, placeCancelButton: { flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: "#b7dfe3", backgroundColor: "#fff" }, placeCancelText: { color: "#087f91", fontSize: 14, fontWeight: "800" }, placeSaveButton: { flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#087f91" }, placeSaveButtonDisabled: { opacity: 0.5 }, placeSaveText: { color: "#fff", fontSize: 14, fontWeight: "900" }, selectedPlace: { flexDirection: "row", alignItems: "center", gap: 10, padding: 11, borderRadius: 15, backgroundColor: "#eff9fa" }, selectedPlaceLabel: { color: "#448189", fontSize: 8, fontWeight: "900", letterSpacing: 0.8 }, selectedPlaceName: { color: "#0d3e45", fontSize: 13, fontWeight: "900" }, selectedPlaceDetail: { color: "#5a8287", fontSize: 10 }, selectedPlaceCheck: { color: "#148d99", fontSize: 18, fontWeight: "900" },
  profileRatingSummary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: -3 }, profileRatingStars: { color: "#c87900", fontSize: 17, fontWeight: "900" }, profileRatingValue: { color: "#634600", fontSize: 14, fontWeight: "900" }, profileRatingCount: { color: "#526e73", fontSize: 11, fontWeight: "700" },
  profileSectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 }, profileSectionTitle: { color: "#0d3e45", fontSize: 15, fontWeight: "900" }, profileReviewItem: { gap: 4, padding: 10, borderRadius: 13, backgroundColor: "#f4fafb" }, profileReviewTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 7 }, profileReviewDestination: { flex: 1, color: "#16464d", fontSize: 12, fontWeight: "800" }, profileReviewStars: { color: "#c87900", fontSize: 11, fontWeight: "900" }, profileReviewText: { color: "#526e73", fontSize: 12, lineHeight: 17 }, profileEmptyCopy: { color: "#526e73", fontSize: 12, lineHeight: 18 }, preferenceOptions: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, preferenceChip: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, borderRadius: 22, borderWidth: 1, borderColor: "#c4e4e7", backgroundColor: "#fff" }, preferenceChipSelected: { borderColor: "#087f91", backgroundColor: "#e1f7f8" }, preferenceLabel: { color: "#446c72", fontSize: 11, fontWeight: "700" }, preferenceLabelSelected: { color: "#005b66", fontWeight: "900" },
  privacyIntro: { gap: 7, padding: 18, borderRadius: 20, backgroundColor: "#087f91" }, privacyEyebrow: { color: "#baf3f4", fontSize: 10, fontWeight: "900", letterSpacing: 1 }, privacyTitle: { color: "#fff", fontSize: 21, lineHeight: 27, fontWeight: "900" }, privacyCopy: { color: "#e2fbfc", fontSize: 12, lineHeight: 18, fontWeight: "600" },
  skipLink: { alignSelf: "center", minHeight: 44, justifyContent: "center", paddingHorizontal: 12 }, skipLinkText: { color: "#111111", fontSize: 13, fontWeight: "700", textDecorationLine: "underline" },
  emergencyIntro: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 0, borderWidth: 1, borderColor: "#98e0e4", backgroundColor: "#def8f9" }, emergencyIcon: { width: 38, height: 38, borderRadius: 13, overflow: "hidden", textAlign: "center", textAlignVertical: "center", color: "#087f91", backgroundColor: "#fff", fontSize: 20, fontWeight: "900" }, emergencyTitle: { color: "#075c66", fontSize: 14, fontWeight: "900" }, emergencyCopy: { color: "#36777d", fontSize: 11, lineHeight: 15, fontWeight: "600" },
  contactHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, contactsFooterActions: { flexDirection: "row", alignItems: "center", gap: 9 }, contactFooterButton: { flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: "#9bdde2", backgroundColor: "#effbfc" }, contactFooterAddText: { color: "#087f91", fontSize: 13, fontWeight: "800" }, contactFooterSave: { borderColor: "#087f91", backgroundColor: "#087f91" }, contactFooterSaveText: { color: "#fff", fontSize: 13, fontWeight: "900" }, contactHeaderActions: { flexDirection: "row", alignItems: "center", gap: 5 }, contactInlineAction: { minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3, paddingHorizontal: 8, borderRadius: 10, backgroundColor: "#effbfc" }, contactRemoveText: { color: "#b4232d", fontSize: 11, fontWeight: "800" }, addContactGlyph: { color: "#087f91", fontSize: 22, lineHeight: 24, fontWeight: "700" }, addContactText: { color: "#087f91", fontSize: 12, fontWeight: "800" },
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
