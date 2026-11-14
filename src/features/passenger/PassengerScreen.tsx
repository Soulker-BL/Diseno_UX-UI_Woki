import { useRef, useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import {
  Button,
  Card,
  Confirm,
  Field,
  Notice,
  Photo,
  PassengerTheme,
  Screen,
  Sheet,
  Stars,
  openLink,
  s,
  type Confirmation,
  passengerPalette,
} from "../../components/ui";
import { newPassenger, useApp } from "../../store";
import {
  PIN_END,
  PIN_START,
  PLACES,
  makeOffers,
  soles,
  SUPPORT_PHONE,
  waLink,
  type Offer,
  type Place,
} from "./data";
import { PassengerAccount } from "./PassengerAccount";
import { LegalTermsSheet } from "./LegalTermsSheet";
import { PassengerDemoButton } from "./PassengerDemoButton";
import { DrawerTrigger, PassengerDrawer } from "./PassengerDrawer";
import { TERMS } from "./terms";
import {
  getPassengerScreenTitle,
  goPassenger,
  isPassengerAccountScreen,
  isPassengerPublicScreen,
  isPassengerTripScreen,
  requiresPassengerDestination,
  type PassengerScreenName,
} from "./navigation";
import { resumeTrip } from "./flow";
import { usePassengerScreenTimers } from "./usePassengerScreenTimers";
export default function PassengerScreen() {
  const { screen: screenParam } = useLocalSearchParams<{ screen: string }>();
  return (
    <PassengerTheme>
      <PassengerContent
        key={screenParam}
        screen={screenParam as PassengerScreenName}
      />
    </PassengerTheme>
  );
}

function PlaceRow({
  title,
  subtitle,
  trailing,
  label,
  onPress,
}: {
  title: string;
  subtitle: string;
  trailing: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Selecciona el lugar para continuar con tu viaje."
      onPress={onPress}
      style={({ pressed }) => [
        placeRowStyles.row,
        pressed && placeRowStyles.rowPressed,
      ]}
    >
      <View style={placeRowStyles.pin}>
        <Svg width={19} height={23} viewBox="0 0 24 30">
          <Path d="M12 28S3.7 18.1 3.7 11.5a8.3 8.3 0 1 1 16.6 0C20.3 18.1 12 28 12 28Z" fill="#218e97" />
          <Circle cx="12" cy="11.5" r="3" fill="#fff" />
        </Svg>
      </View>
      <View style={placeRowStyles.copy}>
        <Text style={placeRowStyles.title}>{title}</Text>
        <Text style={placeRowStyles.subtitle}>{subtitle}</Text>
      </View>
      <View style={placeRowStyles.trailing}>
        {trailing !== "›" && <Text style={placeRowStyles.action}>{trailing}</Text>}
        <Text style={trailing === "›" ? placeRowStyles.quickArrow : placeRowStyles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

const placeRowStyles = StyleSheet.create({
  row: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    backgroundColor: "#f7fbfc",
    shadowColor: "#0d5961",
    shadowOpacity: 0.055,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  rowPressed: { backgroundColor: "#e9f8f9", shadowOpacity: 0.14, elevation: 4, transform: [{ scale: 0.99 }] },
  pin: {
    width: 40,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: passengerPalette.soft,
  },
  copy: { flex: 1, gap: 3 },
  title: { color: passengerPalette.ink, fontSize: 15, fontWeight: "600" },
  subtitle: { color: passengerPalette.muted, fontSize: 12, lineHeight: 17 },
  trailing: { flexDirection: "row", alignItems: "center", gap: 4 },
  action: { color: passengerPalette.deep, fontSize: 12, fontWeight: "700" },
  quickArrow: { color: "#218e97", fontSize: 27, lineHeight: 30, fontWeight: "500" },
  chevron: { color: passengerPalette.brand, fontSize: 22, lineHeight: 23 },
});

function HeaderOption({
  label,
  onPress,
  danger = false,
  demo = false,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
  demo?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        headerOptionStyles.button,
        danger && headerOptionStyles.dangerButton,
        demo && headerOptionStyles.demoButton,
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text style={[headerOptionStyles.label, danger && headerOptionStyles.dangerLabel, demo && headerOptionStyles.demoLabel]}>{label}</Text>
    </Pressable>
  );
}

const headerOptionStyles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: passengerPalette.border,
    backgroundColor: passengerPalette.soft,
  },
  dangerButton: { borderColor: passengerPalette.danger, backgroundColor: passengerPalette.danger },
  demoButton: { borderColor: "#f5a524", backgroundColor: "#ffd26f" },
  label: { color: passengerPalette.deep, fontSize: 11, fontWeight: "800" },
  dangerLabel: { color: "#fff" },
  demoLabel: { color: "#493000" },
  group: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 7 },
});

function PassengerContent({ screen }: { screen: PassengerScreenName }) {
  const { passenger: p, setPassenger: setP } = useApp();
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const otpInputs = useRef<({ focus: () => void } | null)[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [profile, setProfile] = useState<Offer | null>(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [read, setRead] = useState(false);
  const [identityStage, setIdentityStage] = useState<"dni" | "verify" | "photo">("dni");
  const [showTerms, setShowTerms] = useState(false);
  const [identityMessage, setIdentityMessage] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [detailDescription, setDetailDescription] = useState("");
  const [travelOptions, setTravelOptions] = useState<string[]>([]);
  const [priceDraft, setPriceDraft] = useState(p.price.toFixed(2));
  const patch = (value: Partial<typeof p>) =>
    setP((prev) => ({ ...prev, ...value }));
  const user = (value: Partial<typeof p.user>) =>
    setP((prev) => ({ ...prev, user: { ...prev.user, ...value } }));
  const { otpSeconds, resetOtpTimer } = usePassengerScreenTimers(screen);

  if (!isPassengerPublicScreen(screen) && !p.authenticated)
    return <Redirect href="/pasajero/welcome" />;
  const resume = resumeTrip(p.phase, !!p.driver, screen);
  if (resume)
    return (
      <Redirect
        href={{ pathname: "/pasajero/[screen]", params: { screen: resume } }}
      />
    );
  if (requiresPassengerDestination(screen) && !p.dest)
    return <Redirect href="/pasajero/home" />;
  if (
    ["enroute", "arrived", "ontrip", "payment", "finished"].includes(screen) &&
    !p.driver
  )
    return <Redirect href="/pasajero/home" />;
  if (isPassengerAccountScreen(screen))
    return <PassengerAccount key={screen} screen={screen} />;
  if (!getPassengerScreenTitle(screen)) return <Redirect href="/pasajero/home" />;

  function pick(place: Place) {
    setPriceDraft(place.price.toFixed(2));
    patch({ dest: place, price: place.price });
    goPassenger("confirm");
  }
  function advanceDemo() {
    if (screen === "phone") {
      setP((current) => ({ ...current, user: { ...current.user, phone: "987654321" } }));
      goPassenger("otp", true);
      return;
    }
    if (screen === "otp") {
      router.replace("/rol");
      return;
    }
    if (screen === "register") {
      if (identityStage === "dni") {
        user({ dni: "00000000", first: "Erick", last: "B.", lastMaterno: "L." });
        setIdentityMessage("");
        setIdentityStage("verify");
      } else if (identityStage === "verify") {
        setIdentityStage("photo");
      } else {
        goPassenger("emergency", true);
      }
      return;
    }
    const demoDestination = p.dest && !p.dest.outOfZone
      ? p.dest
      : PLACES.find((place) => place.name === "Terminal Terrestre")!;
    const demoDriver = offers[0];
    switch (screen) {
      case "home":
      case "search":
        patch({ dest: demoDestination, price: demoDestination.price });
        goPassenger("confirm", true);
        break;
      case "confirm":
        patch({ dest: demoDestination, price: p.dest ? p.price : demoDestination.price });
        goPassenger("searching", true);
        break;
      case "searching":
      case "noOffers":
        goPassenger("offers", true);
        break;
      case "offers":
        if (demoDriver) {
          patch({ driver: demoDriver, phase: "enroute" });
          goPassenger("enroute", true);
        }
        break;
      case "enroute":
        patch({ phase: "arrived" });
        goPassenger("arrived", true);
        break;
      case "arrived":
        patch({ phase: "ontrip" });
        goPassenger("ontrip", true);
        break;
      case "ontrip":
        patch({ phase: "payment" });
        goPassenger("payment", true);
        break;
      case "payment":
        patch({ phase: "finished" });
        goPassenger("finished", true);
        break;
      case "finished":
        reset();
        break;
      case "review":
        patch({ driver: null, phase: null });
        goPassenger("confirm", true);
        break;
      default:
        break;
    }
  }
  function reset() {
    patch({
      dest: null,
      driver: null,
      phase: null,
      reference: "",
      notes: "",
      pax: 1,
    });
    goPassenger("home", true);
  }
  function log(status: "Finalizado" | "En revisión", review?: { rating: number; text: string }) {
    if (!p.dest || !p.driver) return;
    const trip = {
      date: new Date().toLocaleString("es-PE"),
      from: "Mi ubicación",
      to: p.dest.name,
      price: p.driver.price,
      driver: p.driver.name,
      status,
      ...(review ? { rating: review.rating, review: review.text } : {}),
    };
    setP((prev) => ({ ...prev, trips: [trip, ...prev.trips] }));
  }
  const back = () => {
    if (p.phase) return setDrawerOpen(true);
    if (screen === "phone") return router.replace("/inicio");
    if (screen === "otp") return goPassenger("phone", true);
    if (screen === "register") return goPassenger("otp", true);
    if (screen === "terms") return goPassenger("register", true);
    if (p.authenticated) return goPassenger("home", true);
    router.replace("/rol");
  };
  const offers = makeOffers(p.price, p.pax).slice(0, 3);
  const destinationPool = [...p.saved, ...PLACES.filter((place) => !p.saved.some((saved) => saved.name === place.name))];
  const searchResults = destinationPool.filter((place) =>
    `${place.name} ${place.detail}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const isSearchingHome = !!search.trim();
  const homeResults = (isSearchingHome ? searchResults : destinationPool).slice(0, isSearchingHome ? 5 : 8);
  const mapBackground = ["home", "search", "confirm", "searching", "offers", "noOffers", "enroute", "arrived", "ontrip", "review"].includes(screen);
  if (screen === "welcome") return <Redirect href="/inicio" />;
  if (screen === "role") return <Redirect href="/rol" />;
  if (screen === "menu") return <Redirect href={p.authenticated ? "/pasajero/home" : "/rol"} />;
  const screenTitle = screen === "register"
    ? identityStage === "verify" ? "Confirma tu identidad" : identityStage === "photo" ? "Tu foto de perfil" : "Ingresa tu DNI"
    : getPassengerScreenTitle(screen) ?? "Woki";
  return (
    <Screen
      title={screenTitle}
      destinationTitle={screen === "home"}
      softTitle={mapBackground}
      actionsBesideTitle={screen === "payment" || screen === "review"}
      back={screen === "home" || p.phase || screen === "offers" ? undefined : back}
      mapBackground={mapBackground}
      mapOrigin={p.origin}
      mapDest={p.dest?.pos}
      onMapOriginChange={(origin) => patch({ origin })}
      left={screen === "home" && p.authenticated ? <DrawerTrigger onPress={() => setDrawerOpen(true)} /> : undefined}
      stickyContent={screen === "offers" && p.dest && p.price > p.dest.price ? <Notice>{`Tu oferta de ${soles(p.price)} está visible para los conductores.`}</Notice> : undefined}
      panelActions={screen === "offers" ? (
        <View style={passengerFlowStyles.offersPanelActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={back} style={passengerFlowStyles.offersBackButton}><Text style={passengerFlowStyles.offersBackGlyph}>‹</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancelar búsqueda" onPress={reset} style={({ pressed }) => [passengerFlowStyles.cancelSearchButton, pressed && { opacity: 0.75 }]}><Text style={passengerFlowStyles.cancelSearchText}>Cancelar búsqueda</Text></Pressable>
        </View>
      ) : undefined}
      right={
        <View style={headerOptionStyles.group}>
          {(isPassengerTripScreen(screen) || ["phone", "otp", "register"].includes(screen)) && <PassengerDemoButton onPress={advanceDemo} />}
          {["searching", "noOffers"].includes(screen) && (
            <HeaderOption label="Cancelar" danger onPress={reset} />
          )}
          {p.authenticated && !isPassengerPublicScreen(screen) && screen !== "home" && (
            <DrawerTrigger onPress={() => setDrawerOpen(true)} />
          )}
        </View>
      }
    >
      {["phone", "otp", "register"].includes(screen) && (
        <AuthProgress screen={screen} />
      )}
      {screen === "phone" && (
        <>
          <Text style={s.text}>Introduce tu número de teléfono. Te enviaremos un código para verificarlo.</Text>
          <Field
            label="Celular (+51)"
            keyboardType="phone-pad"
            maxLength={9}
            value={p.user.phone}
            onChangeText={(v) => user({ phone: v.replace(/\D/g, "") })}
            placeholder="987654321"
          />
          <Notice>Modo demostración: no se envían SMS. Usa Demo o introduce un código de 6 dígitos.</Notice>
          <Button
            disabled={!/^9\d{8}$/.test(p.user.phone)}
            onPress={() => {
              resetOtpTimer();
              goPassenger("otp");
            }}
          >
            Enviar código
          </Button>
        </>
      )}
      {screen === "otp" && (
        <>
          <Text style={s.text}>Introduce el código de 6 dígitos para <Text style={{ fontWeight: "800" }}>+51 {p.user.phone}</Text>.</Text>
          <View style={passengerFlowStyles.otpGroup} accessibilityLabel="Código de verificación de seis dígitos">
            {Array.from({ length: 6 }, (_, index) => (
              <TextInput
                key={index}
                ref={(node) => { otpInputs.current[index] = node; }}
                accessibilityLabel={"Dígito " + (index + 1) + " de 6"}
                accessibilityHint="Escribe el dígito del código recibido por mensaje."
                keyboardType="number-pad"
                autoComplete={index === 0 ? "sms-otp" : "off"}
                textContentType={index === 0 ? "oneTimeCode" : undefined}
                maxLength={6}
                value={code[index] ?? ""}
                onChangeText={(raw) => {
                  const incoming = raw.replace(/\D/g, "");
                  if (incoming.length > 1) {
                    const nextCode = incoming.slice(0, 6);
                    setCode(nextCode);
                    otpInputs.current[Math.min(nextCode.length, 5)]?.focus();
                    return;
                  }
                  const digit = incoming.slice(0, 1);
                  const digits = code.split("");
                  digits[index] = digit;
                  const nextCode = digits.join("").slice(0, 6);
                  setCode(nextCode);
                  if (digit && index < 5) otpInputs.current[index + 1]?.focus();
                }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace" && !code[index] && index > 0) otpInputs.current[index - 1]?.focus();
                }}
                style={passengerFlowStyles.otpDigit}
              />
            ))}
          </View>
          <Button
            disabled={code.length !== 6}
            onPress={() => router.replace("/rol")}
          >
            Verificar
          </Button>
          <Button
            tone="secondary"
            disabled={otpSeconds > 0}
            onPress={() => {
              resetOtpTimer();
            }}
          >
            {otpSeconds ? `Reenviar en ${otpSeconds} s` : "Reenviar código"}
          </Button>
        </>
      )}
      {screen === "register" && (
        <>
          {identityStage === "dni" && (
            <>
              <Text style={s.text}>Ingresa tu DNI para consultar tus datos de identidad.</Text>
              <Field label="DNI" keyboardType="number-pad" maxLength={8} value={p.user.dni} onChangeText={(value) => user({ dni: value.replace(/\D/g, "").slice(0, 8) })} placeholder="8 dígitos" />
              <Pressable accessibilityRole="button" onPress={() => setShowTerms(true)} style={passengerFlowStyles.legalInline}>
                <Text style={passengerFlowStyles.legalInlineText}>Términos y condiciones · Privacidad</Text>
              </Pressable>
              {!!identityMessage && <Notice>{identityMessage}</Notice>}
              <Button disabled={p.user.dni.length !== 8} onPress={() => setIdentityMessage("La consulta real a RENIEC todavía no está conectada. Usa Demo para ver el siguiente paso.")}>Consultar DNI</Button>
            </>
          )}
          {identityStage === "verify" && (
            <>
              <Notice>Datos de demostración. No se realizó una consulta a RENIEC.</Notice>
              <Card>
                <Text style={s.heading}>¿Usted es Erick B. L.?</Text>
                <Text style={s.muted}>Verifica que las iniciales coincidan con tu identidad.</Text>
                <Button onPress={() => setIdentityStage("photo")}>Sí, soy yo</Button>
                <Button tone="secondary" onPress={() => setIdentityStage("dni")}>No, revisar DNI</Button>
              </Card>
            </>
          )}
          {identityStage === "photo" && (
            <>
              <Card>
                <Text style={s.heading}>Agrega una foto de perfil</Text>
                <Text style={s.muted}>El conductor podrá reconocerte al llegar al punto de recojo.</Text>
                <Photo uri={p.user.photo} onChange={(photo) => user({ photo })} />
              </Card>
              <Pressable accessibilityRole="button" onPress={() => setShowTerms(true)} style={passengerFlowStyles.legalInline}>
                <Text style={passengerFlowStyles.legalInlineText}>Términos y condiciones · Privacidad</Text>
              </Pressable>
              <Button onPress={() => goPassenger("emergency")}>Continuar</Button>
            </>
          )}
        </>
      )}
      {screen === "terms" && (
        <>
          <Text style={s.muted}>
            Revisa los términos antes de continuar.
          </Text>
          {TERMS.map(([title, text]) => (
            <Card key={title}>
              <Text style={s.heading}>{title}</Text>
              <Text style={s.text}>{text}</Text>
            </Card>
          ))}
          <Button tone="secondary" onPress={() => setRead(true)}>
            {read ? "Lectura confirmada" : "He leído los términos"}
          </Button>
          <Button
            disabled={!read}
            onPress={() => {
              goPassenger("emergency");
            }}
          >
            Acepto los términos
          </Button>
        </>
      )}
      {screen === "home" && (
        <>
          <View style={passengerFlowStyles.destinationSearch}>
            <Svg width={20} height={20} viewBox="0 0 24 24"><Circle cx="10.8" cy="10.8" r="6.6" fill="none" stroke="#218e97" strokeWidth="2" /><Path d="m16 16 4.3 4.3" fill="none" stroke="#218e97" strokeWidth="2" strokeLinecap="round" /></Svg>
            <TextInput accessibilityLabel="Busca una dirección o lugar" value={search} onChangeText={setSearch} placeholder="Busca una dirección o lugar" placeholderTextColor="#7c9ca1" returnKeyType="search" style={passengerFlowStyles.destinationSearchInput} />
            {!!search && <Pressable accessibilityRole="button" accessibilityLabel="Borrar búsqueda" onPress={() => setSearch("")} style={passengerFlowStyles.clearSearch}><Text style={passengerFlowStyles.clearSearchText}>×</Text></Pressable>}
          </View>
          <Text style={passengerFlowStyles.sectionHeading}>{isSearchingHome ? "Resultados" : "Lugares frecuentes"}</Text>
          {homeResults.map((place, index) => (
            <PlaceRow
              key={place.name + "-" + index}
              title={place.name}
              subtitle={place.detail + " · " + place.km + " km · " + place.min + " min"}
              trailing={place.outOfZone ? "Cobertura" : soles(place.price)}
              label={"Elegir destino " + place.name + ", " + place.detail}
              onPress={() => pick(place)}
            />
          ))}
          {homeResults.length === 0 && <Text style={s.muted}>No encontramos ese lugar. Prueba con otro nombre o dirección.</Text>}
          {p.debt && (
            <Button tone="danger" onPress={() => goPassenger("debt")}>
              Regularizar deuda
            </Button>
          )}
        </>
      )}
      {screen === "search" && (
        <>
          <Field
            label="Buscar dirección o lugar"
            value={search}
            onChangeText={setSearch}
            placeholder="Ej. Terminal"
          />
          {searchResults.map((place, index) => (
              <PlaceRow
                key={`${place.name}-${index}`}
                title={place.name}
                subtitle={`${place.detail} · ${place.km} km · ${place.min} min`}
                trailing={place.outOfZone ? "Cobertura" : soles(place.price)}
                label={
                  place.outOfZone
                    ? `Ver cobertura para ${place.name}`
                    : `Elegir ${place.name} por ${soles(place.price)}`
                }
                onPress={() => pick(place)}
              />
            ))}
          {searchResults.length === 0 && (
            <Text style={s.muted}>
              No encontramos ese lugar. Prueba con otro nombre o dirección.
            </Text>
          )}
        </>
      )}
      {screen === "confirm" && p.dest && (
        <>
          <View style={passengerFlowStyles.tripDestination}>
            <View style={passengerFlowStyles.routeTimeline}><View style={passengerFlowStyles.routeOriginDot} /><View style={passengerFlowStyles.routeLine} /><View style={passengerFlowStyles.routeEndPin}><Text style={passengerFlowStyles.routeEndPinGlyph}>•</Text></View></View>
              <View style={{ flex: 1, gap: 12 }}>
              <View><Text style={passengerFlowStyles.miniLabel}>RECOJO</Text><Text style={passengerFlowStyles.destinationText}>Jr. Lima, Chaupimarca</Text></View>
              <View><Text style={passengerFlowStyles.miniLabel}>DESTINO</Text><Text style={passengerFlowStyles.destinationText}>{p.dest.name}</Text><Text style={passengerFlowStyles.destinationMeta}>{p.dest.detail} · {p.dest.km} km · {p.dest.min} min</Text></View>
            </View>
          </View>
          {p.dest.outOfZone ? (
            <Notice danger>
              Este destino está fuera de nuestra zona de cobertura.
            </Notice>
          ) : (
            <>
              <View style={passengerFlowStyles.fareCard}>
                <View style={passengerFlowStyles.fareHeader}><Text style={passengerFlowStyles.fareLabel}>TU OFERTA</Text><View style={passengerFlowStyles.recommendedBadge}><Text style={passengerFlowStyles.recommendedText}>Mínimo {soles(p.dest.price)}</Text></View></View>
                <View style={passengerFlowStyles.fareControls}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Bajar oferta un sol"
                    accessibilityState={{ disabled: p.price <= p.dest.price }}
                    disabled={p.price <= p.dest.price}
                    onPress={() => { const amount = Math.max(p.dest!.price, p.price - 1); setPriceDraft(amount.toFixed(2)); patch({ price: amount }); }}
                    style={({ pressed }) => [passengerFlowStyles.fareStep, passengerFlowStyles.fareStepOnBrand, p.price <= p.dest!.price && passengerFlowStyles.fareStepDisabled, pressed && p.price > p.dest!.price && { opacity: 0.75 }]}
                  ><Svg width={20} height={20} viewBox="0 0 18 18"><Path d="M3.5 9h11" stroke={p.price <= p.dest.price ? "#8aaeb2" : "#005b66"} strokeWidth={2.5} strokeLinecap="round" /></Svg></Pressable>
                  <View style={passengerFlowStyles.fareValue}>
                    <View style={passengerFlowStyles.fareInputRow}>
                      <Text style={passengerFlowStyles.currency}>S/</Text>
                      <TextInput
                        accessibilityLabel="Tu oferta en soles"
                        keyboardType="decimal-pad"
                        maxLength={7}
                        value={priceDraft}
                        selectTextOnFocus
                        onChangeText={(raw) => {
                          const clean = raw.replace(",", ".").replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                          setPriceDraft(clean);
                          const amount = Number.parseFloat(clean);
                          if (clean && Number.isFinite(amount) && amount >= p.dest!.price) patch({ price: amount });
                        }}
                        onBlur={() => {
                          const amount = Number.parseFloat(priceDraft);
                          const normalized = Number.isFinite(amount) && amount >= p.dest!.price ? amount : p.dest!.price;
                          const rounded = Number(normalized.toFixed(2));
                          setPriceDraft(rounded.toFixed(2));
                          patch({ price: rounded });
                        }}
                        style={passengerFlowStyles.fareInput}
                      />
                    </View>
                    <Text style={[passengerFlowStyles.fareHint, p.price > p.dest.price && passengerFlowStyles.fareHintRaised]}>{p.price > p.dest.price ? "Más ofertas de conductores" : "Precio recomendado"}</Text>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel="Aumentar oferta un sol" onPress={() => { const amount = p.price + 1; setPriceDraft(amount.toFixed(2)); patch({ price: amount }); }} style={({ pressed }) => [passengerFlowStyles.fareStep, passengerFlowStyles.fareStepIncrease, pressed && { opacity: 0.75 }]}><Svg width={20} height={20} viewBox="0 0 18 18"><Path d="M9 3.5v11M3.5 9h11" stroke="#153b42" strokeWidth={2.5} strokeLinecap="round" /></Svg></Pressable>
                </View>
              </View>
              <Field
                label="Referencia de recojo (obligatoria)"
                value={p.reference}
                onChangeText={(reference) => patch({ reference })}
              />
              <View style={passengerFlowStyles.confirmActions}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Forma de pago: ${p.pay}`} onPress={() => setPaymentOpen(true)} style={({ pressed }) => [passengerFlowStyles.confirmAction, pressed && { opacity: 0.72 }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24"><Rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="#087f91" strokeWidth="1.8" /><Circle cx="12" cy="12" r="2.7" fill="none" stroke="#087f91" strokeWidth="1.7" /><Path d="M6.5 9h1m9 6h1" stroke="#087f91" strokeWidth="1.7" strokeLinecap="round" /></Svg>
                  <Text numberOfLines={1} style={passengerFlowStyles.confirmActionText}>{p.pay}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Editar detalles del viaje" onPress={() => setDetailsOpen(true)} style={({ pressed }) => [passengerFlowStyles.confirmAction, pressed && { opacity: 0.72 }]}>
                  <Svg width={20} height={20} viewBox="0 0 24 24"><Rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="#087f91" strokeWidth="1.8" /><Path d="M8.5 8h7m-7 4h7m-7 4h4" stroke="#087f91" strokeWidth="1.7" strokeLinecap="round" /></Svg>
                  <Text style={passengerFlowStyles.confirmActionText}>Detalles</Text>
                </Pressable>
              </View>
              <Button disabled={!p.reference.trim() || !!p.debt} onPress={() => goPassenger("searching")}>Buscar</Button>
            </>
          )}
          {p.debt && (
            <Button tone="danger" onPress={() => goPassenger("debt")}>
              Paga tu deuda para solicitar un viaje
            </Button>
          )}
        </>
      )}
      {screen === "searching" && (
        <>
          <View style={passengerFlowStyles.searchingCard}>
            <View style={passengerFlowStyles.searchingPulse}><View style={passengerFlowStyles.searchingDot} /></View>
            <View style={{ flex: 1, gap: 4 }}><Text style={passengerFlowStyles.searchingTitle}>Buscando tu Woki</Text><Text style={passengerFlowStyles.searchingCopy}>Estamos conectándote con conductores cercanos.</Text></View>
            <Text style={passengerFlowStyles.searchingFare}>{soles(p.price)}</Text>
          </View>
        </>
      )}
      {screen === "offers" && (
        <>
          {offers.slice(0, 3).map((offer) => (
            <Card key={offer.id} compact>
              <View style={passengerFlowStyles.compactOfferTop}>
                <View style={passengerFlowStyles.compactAvatar}><Text style={passengerFlowStyles.driverInitial}>{offer.name.slice(0, 1)}</Text></View>
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}><Text numberOfLines={1} style={passengerFlowStyles.compactDriverName}>{offer.name}</Text><Text style={passengerFlowStyles.compactTripMeta}>{offer.trips} viajes · <Text style={passengerFlowStyles.compactRating}>★ {offer.rating}</Text></Text></View>
                <View style={passengerFlowStyles.compactPrice}><Text style={passengerFlowStyles.compactPriceLabel}>{offer.price === p.price ? "TU TARIFA" : "CONTRAOFERTA"}</Text><Text style={passengerFlowStyles.compactPriceValue}>{soles(offer.price)}</Text></View>
              </View>
              <View style={passengerFlowStyles.compactVehicle}><Text numberOfLines={1} style={passengerFlowStyles.compactCar}>{offer.car}</Text><Text numberOfLines={1} style={passengerFlowStyles.compactVehicleMeta}>{offer.color} · {offer.plate}</Text></View>
              <View style={passengerFlowStyles.compactOfferBottom}>
                <Text style={passengerFlowStyles.compactEta}>Llega en {offer.eta} min · {offer.seats} asientos</Text>
                <View style={passengerFlowStyles.compactOfferActions}>
                  <Button compact tone="plain" onPress={() => setProfile(offer)}>Ver perfil</Button>
                  <Button
                    compact
                    onPress={() =>
                  setConfirmation({
                    title: "¿Elegir este conductor?",
                    message: "",
                    summary: { eyebrow: "RESUMEN DE VIAJE", title: offer.name, detail: `${offer.car} · ${offer.plate} · llega en ${offer.eta} min`, price: soles(offer.price) },
                    hideClose: true,
                    action: () => {
                      patch({ driver: offer, phase: "enroute" });
                      goPassenger("enroute", true);
                    },
                  })
                    }
                  >Elegir</Button>
                </View>
              </View>
            </Card>
          ))}
        </>
      )}
      {screen === "noOffers" && (
        <>
          <Text style={s.text}>
            Prueba con un precio mayor o vuelve a buscar.
          </Text>
          <Button
            onPress={() => {
              patch({ price: p.price + 1 });
              goPassenger("searching", true);
            }}
          >
            Aumentar S/ 1 y buscar
          </Button>
          <Button
            tone="secondary"
            onPress={() => goPassenger("searching", true)}
          >
            Reintentar
          </Button>
        </>
      )}
      {["enroute", "arrived", "ontrip", "payment", "finished"].includes(
        screen,
      ) &&
        p.driver &&
        p.dest && (
          <>
            {screen !== "finished" && <Card>
              <View style={passengerFlowStyles.tripStatusRow}>
                <Text style={passengerFlowStyles.tripStatus}>{screen === "payment" ? "VIAJE FINALIZADO" : screen === "ontrip" ? "VIAJE EN CURSO" : screen === "arrived" ? "TU TAXI YA LLEGÓ" : "VIAJE CONFIRMADO"}</Text>
                <View style={passengerFlowStyles.rating}><Text style={passengerFlowStyles.ratingText}>★ {p.driver.rating}</Text></View>
              </View>
              <View style={passengerFlowStyles.driverSummary}>
                <View style={passengerFlowStyles.driverAvatar}><Text style={passengerFlowStyles.driverInitial}>{p.driver.name.slice(0, 1)}</Text></View>
                <View style={{ flex: 1, gap: 3 }}><Text style={passengerFlowStyles.summaryDriverName}>{p.driver.name}</Text><Text style={passengerFlowStyles.summaryDriverMeta}>Conductor Woki · {p.driver.trips} viajes</Text></View>
              </View>
              <View style={passengerFlowStyles.vehicleGrid}>
                <View style={passengerFlowStyles.vehicleInfo}><Text style={passengerFlowStyles.plateLabel}>TU TAXI</Text><Text numberOfLines={1} style={passengerFlowStyles.tripVehicleName}>{p.driver.car}</Text><Text style={passengerFlowStyles.vehicleColor}>{p.driver.color}</Text></View>
                <View style={passengerFlowStyles.plateBox}><Text style={passengerFlowStyles.plateLabel}>PLACA</Text><Text style={passengerFlowStyles.plateText}>{p.driver.plate}</Text></View>
              </View>
            </Card>}
            {screen !== "finished" && screen !== "payment" && <View style={passengerFlowStyles.tripPriceCard}><View><Text style={passengerFlowStyles.tripPriceLabel}>PRECIO DEL VIAJE</Text><Text style={passengerFlowStyles.tripPriceMeta}>Pago al conductor · {p.pay}</Text></View><Text style={passengerFlowStyles.tripPriceValue}>{soles(p.driver.price)}</Text></View>}
            {["enroute", "arrived"].includes(screen) && (
              <>
                <Text style={s.text}>
                  Verifica el auto y dicta el código al subir.
                </Text>
                <View style={passengerFlowStyles.pinCard}><Text style={passengerFlowStyles.miniLabel}>CÓDIGO PARA INICIAR EL VIAJE</Text><Text accessibilityLabel={`Código ${PIN_START.split("").join(" ")}`} style={passengerFlowStyles.tripPin}>{PIN_START}</Text><Text style={passengerFlowStyles.pinHint}>Compártelo solo cuando estés dentro del auto.</Text></View>
                <View style={passengerFlowStyles.contactActions}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Escribir por WhatsApp al conductor" onPress={() => { if (p.driver) void openLink(waLink(p.driver.phone, "Hola, soy tu pasajero de Woki.")); }} style={({ pressed }) => [passengerFlowStyles.contactAction, passengerFlowStyles.whatsAppAction, pressed && { opacity: 0.75 }]}><Text style={passengerFlowStyles.whatsAppActionText}>WhatsApp</Text></Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Llamar al conductor al ${p.driver.phone}`} onPress={() => { if (p.driver) void openLink(`tel:+51${p.driver.phone}`); }} style={({ pressed }) => [passengerFlowStyles.contactAction, passengerFlowStyles.callAction, pressed && { opacity: 0.75 }]}><Text style={passengerFlowStyles.callActionText}>Llamar</Text></Pressable>
                </View>
                <Button
                  tone="danger"
                  onPress={() =>
                    setConfirmation({
                      title: "¿El conductor o el auto no coinciden?",
                      message: "El viaje quedará en revisión.",
                      danger: true,
                      action: () => {
                        log("En revisión");
                        patch({
                          report: "El conductor o vehículo no coincide",
                          driver: null,
                          phase: null,
                        });
                        goPassenger("review", true);
                      },
                    })
                  }
                >
                  Reportar que no coincide
                </Button>
              </>
            )}
            {screen === "ontrip" && (
              <>
                <Button
                  tone="danger"
                  onPress={() =>
                    setConfirmation({
                      title: "Emergencia",
                      message:
                        "Se abrirá la aplicación de teléfono para llamar al 105.",
                      danger: true,
                      action: () => {
                        void openLink("tel:105");
                      },
                    })
                  }
                >
                  SOS · Llamar al 105
                </Button>
                {p.contacts.map((contact) => (
                  <Button
                    key={contact.phone}
                    tone="secondary"
                    onPress={() => {
                      void openLink(waLink(contact.phone, "Estoy en un viaje de Woki. ¿Puedes contactarme?"));
                    }}
                  >{`Enviar mensaje a ${contact.name}`}</Button>
                ))}
                <Button
                  tone="secondary"
                  onPress={() => goPassenger("contacts")}
                >
                  Contactos de emergencia
                </Button>
              </>
            )}
            {screen === "payment" && (
              <>
                <View style={passengerFlowStyles.paymentReceipt}>
                  <View style={{ flex: 1, gap: 4 }}><Text style={passengerFlowStyles.totalLabel}>TOTAL DEL VIAJE</Text><Text style={passengerFlowStyles.receiptMethod}>Paga al conductor · {p.pay}</Text></View>
                  <Text style={passengerFlowStyles.receiptAmount}>{soles(p.driver.price)}</Text>
                </View>
                <View style={passengerFlowStyles.pinCard}><Text style={passengerFlowStyles.miniLabel}>CÓDIGO DE FINALIZACIÓN</Text><Text style={passengerFlowStyles.tripPin}>{PIN_END}</Text><Text style={passengerFlowStyles.pinHint}>Díselo al conductor después de pagar.</Text></View>
                <Button onPress={() => setConfirmation({ title: "¿Confirmas que pagaste?", message: "Al continuar, podrás calificar el viaje y volver al inicio.", action: () => { patch({ phase: "finished" }); goPassenger("finished", true); } })}>Confirmar pago</Button>
                <Button
                  tone="danger"
                  onPress={() =>
                    setConfirmation({
                      title: "¿No realizaste el pago?",
                      message: "El pago quedará pendiente y no podrás pedir otro viaje hasta regularizarlo.",
                      action: () => {
                        log("En revisión");
                        patch({
                          debt: { amount: p.driver!.price, trip: p.dest!.name },
                          driver: null,
                          phase: null,
                        });
                        goPassenger("debt", true);
                      },
                    })
                  }
                >
                  No pude pagar
                </Button>
              </>
            )}
            {screen === "finished" && (
              <>
                <View style={passengerFlowStyles.finishedHero}><View style={passengerFlowStyles.finishedMark}><Svg width={37} height={42} viewBox="0 0 40 46"><Path d="M20 43S5 27.4 5 16A15 15 0 1 1 35 16c0 11.4-15 27-15 27Z" fill="#ffbd32"/><Circle cx="20" cy="16" r="9" fill="#fff"/><Path d="m15.5 16 3 3 6-6" fill="none" stroke="#087f91" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></Svg></View><View style={{ flex: 1, gap: 3 }}><Text style={passengerFlowStyles.finishedEyebrow}>VIAJE COMPLETADO</Text><Text style={passengerFlowStyles.finishedTitle}>¡Llegaste a tu destino!</Text><Text style={passengerFlowStyles.finishedCopy}>{p.dest.name} · {soles(p.driver.price)}</Text></View></View>
                <View style={passengerFlowStyles.travelReport}><Text style={passengerFlowStyles.reportEyebrow}>RESUMEN DE TU VIAJE</Text><Text style={passengerFlowStyles.reportDriver}>{p.driver.name}</Text><Text style={passengerFlowStyles.reportDetails}>{p.driver.car} {p.driver.color} · placa {p.driver.plate}</Text><Text style={passengerFlowStyles.reportDetails}>Desde Jr. Lima, Chaupimarca hasta {p.dest.name}</Text></View>
                <Text style={s.heading}>¿Cómo estuvo tu viaje?</Text>
                <Stars value={stars} onChange={setStars} />
                <Field
                  label="Comentario o reporte (opcional)"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                />
                <Button
                  disabled={!stars}
                  onPress={() => {
                    log("Finalizado", { rating: stars, text: comment.trim() });
                    reset();
                  }}
                >
                  Enviar calificación y finalizar
                </Button>
              </>
            )}
          </>
        )}
      {screen === "review" && (
        <>
          <Notice danger>{p.report || "El viaje quedó en revisión."}</Notice>
          <Button
            onPress={() => {
              patch({ driver: null });
              goPassenger("confirm", true);
            }}
          >
            Buscar otro conductor
          </Button>
          <Button tone="secondary" onPress={reset}>
            Volver al inicio
          </Button>
        </>
      )}
      {profile && (
        <Sheet title={profile.name} close={() => setProfile(null)}>
          <View style={passengerFlowStyles.driverProfileHero}>
            <View style={passengerFlowStyles.driverProfileAvatar}><Text style={passengerFlowStyles.driverProfileInitial}>{profile.name.slice(0, 1)}</Text></View>
            <View style={{ flex: 1, gap: 5 }}><Text style={passengerFlowStyles.driverProfileName}>{profile.name}</Text><Text style={passengerFlowStyles.driverProfileRating}>★ {profile.rating.toFixed(1)} <Text style={passengerFlowStyles.driverProfileRatingMeta}>· {profile.trips} viajes</Text></Text></View>
            <View style={passengerFlowStyles.verifiedPill}><Text style={passengerFlowStyles.verifiedText}>✓ Verificado</Text></View>
          </View>
          <View style={passengerFlowStyles.driverProfileVehicle}><Text style={passengerFlowStyles.driverProfileVehicleLabel}>VEHÍCULO</Text><Text style={passengerFlowStyles.driverProfileVehicleName}>{profile.car}</Text><Text style={passengerFlowStyles.driverProfileVehicleMeta}>{profile.color} · {profile.plate}</Text></View>
          <Text style={passengerFlowStyles.reviewsHeading}>Opiniones de pasajeros</Text>
          {profile.reviews.map((review) => <View key={review.name} style={passengerFlowStyles.reviewCard}><View style={passengerFlowStyles.reviewHead}><Text style={passengerFlowStyles.reviewName}>{review.name}</Text><Text style={passengerFlowStyles.reviewStars}>{"★".repeat(review.stars)}</Text></View><Text style={passengerFlowStyles.reviewText}>{review.text}</Text></View>)}
        </Sheet>
      )}
      {drawerOpen && (
        <PassengerDrawer
          close={() => setDrawerOpen(false)}
          onNavigate={(target) => { setDrawerOpen(false); goPassenger(target); }}
          activeScreen={screen}
          name={`${p.user.first} ${p.user.last} ${p.user.lastMaterno}`.trim()}
          phone={p.user.phone}
          photo={p.user.photo}
          logout={() => { setDrawerOpen(false); setP(newPassenger()); router.replace("/rol"); }}
          support={() => { setDrawerOpen(false); void openLink(waLink(SUPPORT_PHONE, "Hola, necesito ayuda con Woki.")); }}
        />
      )}
      {paymentOpen && <Sheet title="Forma de pago" close={() => setPaymentOpen(false)}>
        <Text style={s.muted}>Pagarás directamente al conductor al finalizar el viaje.</Text>
        {(["Efectivo", "Yape", "Plin"] as const).map((method) => <PaymentMethod key={method} method={method} selected={p.pay === method} onPress={() => { patch({ pay: method }); setPaymentOpen(false); }} />)}
      </Sheet>}
      {detailsOpen && <Sheet title="Detalles del viaje" close={() => setDetailsOpen(false)}>
        <Text style={s.muted}>Cuéntale al conductor qué necesitas para el recojo.</Text>
        <Field label="Descripción (opcional)" value={detailDescription} onChangeText={setDetailDescription} placeholder="Ej. Llevo una maleta grande" multiline numberOfLines={3} maxLength={140} />
        <View style={passengerFlowStyles.travelOptions}>
          {["Con mascota", "Necesito apoyo de movilidad", "Mucho equipaje"].map((option) => {
            const selected = travelOptions.includes(option);
            return <Pressable key={option} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => setTravelOptions((current) => selected ? current.filter((item) => item !== option) : [...current, option])} style={[passengerFlowStyles.travelOption, selected && passengerFlowStyles.travelOptionSelected]}>
              <Text style={[passengerFlowStyles.travelOptionText, selected && passengerFlowStyles.travelOptionTextSelected]}>{option}</Text>
            </Pressable>;
          })}
        </View>
        <Button onPress={() => { patch({ notes: [detailDescription.trim(), ...travelOptions].filter(Boolean).join(" · ") }); setDetailsOpen(false); }}>Guardar detalles</Button>
      </Sheet>}
      <LegalTermsSheet visible={showTerms} close={() => setShowTerms(false)} />
      <Confirm value={confirmation} close={() => setConfirmation(null)} />
    </Screen>
  );
}

function PaymentMethod({ method, selected, onPress }: { method: "Efectivo" | "Yape" | "Plin"; selected: boolean; onPress: () => void }) {
  const cash = method === "Efectivo";

  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={`Pagar con ${method}`} onPress={onPress} style={[passengerFlowStyles.paymentCard, selected && (cash ? passengerFlowStyles.paymentSelected : method === "Yape" ? passengerFlowStyles.paymentYapeSelected : passengerFlowStyles.paymentPlinSelected)]}>
      <View style={[passengerFlowStyles.paymentIcon, cash ? passengerFlowStyles.cashIcon : method === "Yape" ? passengerFlowStyles.yapeIcon : passengerFlowStyles.plinIcon]}>
        {cash ? (
          <Svg width={23} height={18} viewBox="0 0 24 18">
            <Rect x="1" y="2" width="22" height="14" rx="3" fill="none" stroke="#087f91" strokeWidth="1.8" />
            <Circle cx="12" cy="9" r="3" fill="none" stroke="#087f91" strokeWidth="1.5" />
            <Path d="M4 6h2M18 12h2" stroke="#087f91" strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
        ) : (
          <Text style={[passengerFlowStyles.paymentBrandGlyph, method === "Yape" ? passengerFlowStyles.yapeGlyph : passengerFlowStyles.plinGlyph]}>{method === "Yape" ? "Y" : "P"}</Text>
        )}
      </View>
      <View style={{ flex: 1, gap: 3 }}><Text style={passengerFlowStyles.paymentName}>{method}</Text><Text style={passengerFlowStyles.paymentSub}>{cash ? "Al finalizar" : "Transferencia"}</Text></View>
      <View style={[passengerFlowStyles.radio, selected && passengerFlowStyles.radioSelected]}>{selected && <View style={passengerFlowStyles.radioDot} />}</View>
    </Pressable>
  );
}

function AuthProgress({ screen }: { screen: string }) {
  const steps = ["phone", "otp", "register"];
  const current = Math.max(0, steps.indexOf(screen));
  const labels = ["Celular", "Código", "Identidad"];
  return (
    <View style={passengerFlowStyles.progressWrap} accessibilityLabel={`Paso ${current + 1} de ${steps.length}: ${labels[current]}`}>
      <View style={passengerFlowStyles.progressTop}><Text style={passengerFlowStyles.progressStep}>PASO 0{current + 1} / 03</Text><Text style={passengerFlowStyles.progressLabel}>{labels[current]}</Text></View>
      <View style={passengerFlowStyles.progressTrack}><View style={[passengerFlowStyles.progressFill, { width: `${((current + 1) / steps.length) * 100}%` }]} /></View>
    </View>
  );
}

const passengerFlowStyles = StyleSheet.create({
  progressWrap: { gap: 9, marginBottom: 3 },
  progressTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressStep: { color: "#218e97", fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  progressLabel: { color: "#526e73", fontSize: 11, fontWeight: "600" },
  progressTrack: { height: 4, overflow: "hidden", borderRadius: 4, backgroundColor: "#dcebec" },
  progressFill: { height: 4, borderRadius: 4, backgroundColor: "#218e97" },
  helper: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 13, backgroundColor: "#e5f7f9" },
  helperDot: { width: 20, height: 20, overflow: "hidden", textAlign: "center", textAlignVertical: "center", borderRadius: 10, color: "#fff", backgroundColor: "#218e97", fontSize: 12, fontWeight: "800" },
  helperText: { flex: 1, color: "#526e73", fontSize: 12, lineHeight: 17 },
  legalInline: { alignSelf: "center", paddingVertical: 5 }, legalInlineText: { color: "#111", fontSize: 11, textDecorationLine: "underline" },
  otpGroup: { flexDirection: "row", justifyContent: "space-between", gap: 7, marginVertical: 8 }, otpDigit: { flex: 1, maxWidth: 52, height: 58, borderRadius: 14, borderWidth: 1.5, borderColor: "#9edce1", backgroundColor: "#fff", color: "#111", fontSize: 24, fontWeight: "900", textAlign: "center" },
  fixedActions: { flexDirection: "row", gap: 8, marginBottom: 8 }, fixedAction: { flex: 1, minHeight: 42, justifyContent: "center", alignItems: "center", borderRadius: 13, borderWidth: 1, borderColor: "#a9dfe3", backgroundColor: "#f5fcfc" }, fixedActionText: { color: "#111", fontSize: 12, fontWeight: "800" }, fixedSearchRow: { flexDirection: "row", gap: 10, alignItems: "center" }, fixedFare: { minWidth: 92, gap: 1 }, fixedFareLabel: { color: "#111", fontSize: 9, fontWeight: "900", letterSpacing: 0.8 }, fixedFareValue: { color: "#111", fontSize: 19, fontWeight: "900" }, travelOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, travelOption: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18, borderWidth: 1, borderColor: "#bfe5e9", backgroundColor: "#fff" }, travelOptionSelected: { borderColor: "#087f91", backgroundColor: "#dff7f8" }, travelOptionText: { color: "#111", fontSize: 12, fontWeight: "700" }, travelOptionTextSelected: { color: "#005b66", fontWeight: "900" },
  pickupCard: { position: "relative", marginTop: 9, flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderRadius: 17, backgroundColor: "#def5f7", borderWidth: 1, borderColor: "#bfe5e9" },
  pickupConnector: { position: "absolute", left: 31, bottom: "100%", width: 2, height: 12, backgroundColor: "#5bc5ce" },
  destinationSearch: { minHeight: 55, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 15, borderRadius: 28, backgroundColor: "#fff", shadowColor: "#0d5961", shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  destinationSearchInput: { flex: 1, minWidth: 0, height: 52, padding: 0, color: "#0d2f34", fontSize: 14, fontWeight: "600" },
  clearSearch: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#e9f6f7" }, clearSearchText: { marginTop: -2, color: "#4e7880", fontSize: 20, lineHeight: 24 },
  pickupIcon: { width: 39, height: 39, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#def5f7" },
  pickupIconText: { color: "#087f91", fontSize: 23, fontWeight: "800" },
  pickupLabel: { color: "#526e73", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  pickupName: { color: "#0d2f34", fontSize: 14, fontWeight: "800" },
  pickupDetail: { color: "#526e73", fontSize: 11 },
  sectionTitle: { marginTop: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionHeading: { color: "#0d2f34", fontSize: 15, fontWeight: "800" },
  sectionCount: { minWidth: 24, paddingHorizontal: 7, paddingVertical: 3, textAlign: "center", overflow: "hidden", borderRadius: 10, backgroundColor: "#def5f7", color: "#087f91", fontSize: 10, fontWeight: "800" },





  tripDestination: { flexDirection: "row", gap: 14, padding: 15, borderRadius: 18, borderWidth: 1, borderColor: "#cbe9ec", backgroundColor: "#fff" },
  routeTimeline: { width: 16, alignItems: "center", paddingTop: 5, paddingBottom: 10 },
  routeOriginDot: { width: 9, height: 9, borderRadius: 5, borderWidth: 2, borderColor: "#218e97", backgroundColor: "#fff" },
  routeLine: { width: 1, flex: 1, minHeight: 24, marginVertical: 4, backgroundColor: "#cbe9ec" },
  routeEndPin: { width: 12, height: 12, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: "#f5a524" },
  routeEndPinGlyph: { color: "#fff", fontSize: 10, lineHeight: 11, fontWeight: "900" },
  miniLabel: { color: "#36777d", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  destinationText: { marginTop: 2, color: "#0d2f34", fontSize: 15, lineHeight: 20, fontWeight: "800" },
  destinationMeta: { marginTop: 3, color: "#526e73", fontSize: 12 },
  fareCard: { gap: 13, padding: 16, borderRadius: 20, borderWidth: 1.5, borderColor: "#58cbd3", backgroundColor: "#e7f8f9", shadowColor: "#087f91", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  fareHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fareLabel: { color: "#111", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  recommendedBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 11, backgroundColor: "#d6fbf8" },
  recommendedText: { color: "#005b66", fontSize: 10, fontWeight: "900" },
  fareControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  fareValue: { flex: 1, minWidth: 0, alignItems: "center", gap: 2 }, fareInputRow: { width: 138, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  fareStep: { width: 48, height: 48, borderRadius: 16, borderWidth: 2, borderColor: "#72d1d8", flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  fareStepOnBrand: { borderColor: "#6ad5de", backgroundColor: "#f4ffff" },
  fareStepIncrease: { borderColor: "#ffd26f", backgroundColor: "#ffd26f" },
  fareStepDisabled: { borderColor: "#dcebed", backgroundColor: "#f5fbfc" },
  fareAmount: { color: "#111", fontSize: 33, fontWeight: "900", letterSpacing: -0.6 }, currency: { color: "#111", fontSize: 18, fontWeight: "900" }, fareInput: { width: 110, padding: 0, color: "#111", fontSize: 30, fontWeight: "900", letterSpacing: -0.5, textAlign: "center" },
  fareHint: { color: "#111", fontSize: 11, lineHeight: 15, textAlign: "center", fontWeight: "800" }, fareHintRaised: { color: "#087f91" },
  paymentSection: { gap: 10 }, paymentOptions: { flexDirection: "row", gap: 10 },
  paymentCard: { flex: 1, minWidth: 0, minHeight: 78, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 10, borderWidth: 1.5, borderColor: "#cbe9ec", borderRadius: 16, backgroundColor: "#fff" },
  paymentSelected: { borderColor: "#138f9b", backgroundColor: "#effbfc" }, paymentYapeSelected: { borderColor: "#7423b6", backgroundColor: "#fbf6ff" }, paymentPlinSelected: { borderColor: "#087f91", backgroundColor: "#f0fbfc" },
  paymentIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 12 }, cashIcon: { backgroundColor: "#def5f7" }, yapeIcon: { backgroundColor: "#faedfb" }, plinIcon: { backgroundColor: "#dff7f0" }, paymentBrandGlyph: { fontSize: 17, fontWeight: "900" }, yapeGlyph: { color: "#7423b6" }, plinGlyph: { color: "#087f91" },
  paymentName: { color: "#173b36", fontSize: 12, fontWeight: "800" }, paymentSub: { color: "#74877f", fontSize: 9 },
  radio: { width: 15, height: 15, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1.4, borderColor: "#b8c9c2" }, radioSelected: { borderColor: "#218e97" }, radioDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#218e97" },
  searchingCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: "#b6edf0" },
  searchingPulse: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#c9f4f6" }, searchingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#16a3ae" },
  searchingTitle: { color: "#0d2f34", fontSize: 14, fontWeight: "800" }, searchingCopy: { color: "#526e73", fontSize: 11, lineHeight: 16 }, searchingFare: { color: "#005b66", fontSize: 16, fontWeight: "900" },
  offerTop: { flexDirection: "row", alignItems: "center", gap: 11 }, driverAvatar: { width: 45, height: 45, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "#def5f7" }, driverInitial: { color: "#005b66", fontSize: 18, fontWeight: "900" },
  compactOfferTop: { flexDirection: "row", alignItems: "center", gap: 9 }, compactAvatar: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#c9f4f6" }, compactDriverName: { color: "#0d3e45", fontSize: 14, fontWeight: "900" }, compactTripMeta: { color: "#65858a", fontSize: 10, fontWeight: "600" }, compactRating: { color: "#c87900", fontSize: 10, fontWeight: "900" },
  compactPrice: { alignItems: "flex-end", gap: 2, paddingLeft: 7 }, compactPriceLabel: { color: "#3a858b", fontSize: 8, fontWeight: "900", letterSpacing: 0.5 }, compactPriceValue: { color: "#005b66", fontSize: 17, fontWeight: "900" }, compactVehicle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: "#eff9fa" }, compactCar: { flex: 1, color: "#005b66", fontSize: 12, fontWeight: "900" }, compactVehicleMeta: { color: "#477a80", fontSize: 10, fontWeight: "700" }, compactOfferBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 5 }, compactEta: { flexShrink: 1, color: "#36777d", fontSize: 10, fontWeight: "700" }, compactOfferActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 12, backgroundColor: "#ffd34e", borderWidth: 1, borderColor: "#ffad16" }, ratingText: { color: "#764500", fontSize: 12, fontWeight: "900" }, etaRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, backgroundColor: "#d9f7f8" }, etaText: { color: "#005b66", fontSize: 11, fontWeight: "800" }, offerPrice: { color: "#005b66", fontSize: 23, fontWeight: "900" },
  offerHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingHorizontal: 2 }, offerHeadingTitle: { color: "#0d2f34", fontSize: 18, fontWeight: "900" }, offerHeadingMeta: { color: "#087f91", fontSize: 11, fontWeight: "800" },
  offersPanelActions: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, offersBackButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 15, borderWidth: 1, borderColor: "#bfe5e9", backgroundColor: "#fff", shadowColor: "#005b66", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 }, offersBackGlyph: { color: "#005b66", fontSize: 32, lineHeight: 36, marginTop: -3 }, cancelSearchButton: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 7, borderRadius: 12, borderWidth: 1.5, borderColor: "#d92d3c", backgroundColor: "#fff0f1" }, cancelSearchGlyph: { color: "#bf2934", fontSize: 17, lineHeight: 18, fontWeight: "800" }, cancelSearchText: { color: "#a9202c", fontSize: 12, fontWeight: "900" },
  confirmActions: { flexDirection: "row", gap: 10 }, confirmAction: { flex: 1, minWidth: 0, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 11, borderRadius: 15, borderWidth: 1, borderColor: "#bfe5e9", backgroundColor: "#f7fcfc" }, confirmActionText: { flexShrink: 1, color: "#111", fontSize: 13, fontWeight: "800" },
  driverProfileHero: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, backgroundColor: "#e9f8f8", borderWidth: 1, borderColor: "#c7ebed" }, driverProfileAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#078d9a", alignItems: "center", justifyContent: "center" }, driverProfileInitial: { color: "#fff", fontSize: 23, fontWeight: "900" }, driverProfileName: { color: "#123c42", fontSize: 16, fontWeight: "900" }, driverProfileRating: { color: "#ee9e00", fontSize: 14, fontWeight: "900" }, driverProfileRatingMeta: { color: "#64868a", fontSize: 11, fontWeight: "700" }, verifiedPill: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 20, backgroundColor: "#d7f3e6" }, verifiedText: { color: "#198254", fontSize: 9, fontWeight: "900" }, driverProfileVehicle: { marginTop: 12, padding: 13, borderRadius: 16, borderWidth: 1, borderColor: "#dcebed", backgroundColor: "#fff" }, driverProfileVehicleLabel: { color: "#61868a", fontSize: 9, fontWeight: "900", letterSpacing: 0.8 }, driverProfileVehicleName: { marginTop: 4, color: "#153f45", fontSize: 15, fontWeight: "900" }, driverProfileVehicleMeta: { marginTop: 3, color: "#638489", fontSize: 12, fontWeight: "700" }, reviewsHeading: { marginTop: 16, marginBottom: 8, color: "#143d43", fontSize: 14, fontWeight: "900" }, reviewCard: { marginBottom: 8, padding: 12, borderRadius: 15, backgroundColor: "#f7fbfb", borderWidth: 1, borderColor: "#e1eff0", gap: 6 }, reviewHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, reviewName: { color: "#1a4146", fontSize: 12, fontWeight: "900" }, reviewStars: { color: "#f3a900", fontSize: 12, fontWeight: "900" }, reviewText: { color: "#527277", fontSize: 12, lineHeight: 17 },
  vehicleGrid: { flexDirection: "row", gap: 9 }, vehicleInfo: { flex: 1, minWidth: 0, justifyContent: "center", gap: 3, padding: 12, borderRadius: 14, backgroundColor: "#def5f7" }, vehicleName: { color: "#005b66", fontSize: 16, fontWeight: "900" }, vehicleColor: { color: "#526e73", fontSize: 11, fontWeight: "600" }, plateBox: { minWidth: 112, alignItems: "center", justifyContent: "center", gap: 4, padding: 10, borderRadius: 14, borderWidth: 1.5, borderColor: "#bfe5e9", backgroundColor: "#fff" },
  offerFare: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 13, paddingVertical: 9, borderRadius: 14, backgroundColor: "#e9f9fa" }, fareArrow: { color: "#218e97", fontSize: 28, fontWeight: "700" },
  vehiclePlate: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 12, backgroundColor: "#f5fbfc" }, plateLabel: { color: "#526e73", fontSize: 8, fontWeight: "900", letterSpacing: 1 }, plateText: { color: "#0d2f34", fontSize: 12, fontWeight: "900", letterSpacing: 1 }, tripFare: { marginLeft: "auto", color: "#005b66", fontSize: 17, fontWeight: "900" },
  pinCard: { alignItems: "center", gap: 7, paddingHorizontal: 16, paddingVertical: 19, borderRadius: 20, borderWidth: 1, borderColor: "#a4e7e9", backgroundColor: "#d9f8f9" }, tripPin: { color: "#005b66", fontSize: 42, lineHeight: 50, fontWeight: "900", letterSpacing: 10, paddingLeft: 10 }, pinHint: { color: "#315f64", fontSize: 11, textAlign: "center" },
  contactActions: { flexDirection: "row", gap: 10 }, contactAction: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 13 }, whatsAppAction: { backgroundColor: "#20b66f" }, callAction: { backgroundColor: "#e5f7f8", borderWidth: 1, borderColor: "#bfe5e9" }, whatsAppActionText: { color: "#fff", fontSize: 13, fontWeight: "900" }, callActionText: { color: "#005b66", fontSize: 13, fontWeight: "900" },
  tripStatusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, tripStatus: { alignSelf: "flex-start", overflow: "hidden", paddingHorizontal: 11, paddingVertical: 7, borderRadius: 11, backgroundColor: "#bff3f5", color: "#006f7b", fontSize: 11, fontWeight: "900", letterSpacing: 0.6 }, driverSummary: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 1 }, summaryDriverName: { color: "#0d3e45", fontSize: 18, fontWeight: "900" }, summaryDriverMeta: { color: "#34747a", fontSize: 12, fontWeight: "600" }, tripVehicleName: { color: "#005b66", fontSize: 19, fontWeight: "900" },
  tripPriceCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: 17, paddingVertical: 15, borderRadius: 18, backgroundColor: "#b9f0f2", borderWidth: 1, borderColor: "#66d4dc" }, tripPriceLabel: { color: "#006b77", fontSize: 11, fontWeight: "900", letterSpacing: 0.7 }, tripPriceMeta: { marginTop: 4, color: "#31777d", fontSize: 11, fontWeight: "600" }, tripPriceValue: { color: "#004f5c", fontSize: 25, fontWeight: "900" },
  paymentReceipt: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingHorizontal: 4, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "#8bdde2" }, totalLabel: { color: "#006b77", fontSize: 12, fontWeight: "900", letterSpacing: 1 }, receiptAmount: { color: "#005b66", fontSize: 32, lineHeight: 38, fontWeight: "900" }, receiptMethod: { color: "#508187", fontSize: 11, fontWeight: "700" },
  finishedHero: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 20, backgroundColor: "#d9f7f8", borderWidth: 1, borderColor: "#9ce2e6" }, finishedMark: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 19, backgroundColor: "#fff" }, finishedEyebrow: { color: "#158b96", fontSize: 9, fontWeight: "900", letterSpacing: 1.1 }, finishedTitle: { color: "#005b66", fontSize: 18, lineHeight: 22, fontWeight: "900" }, finishedCopy: { color: "#34747a", fontSize: 12, fontWeight: "700" },
  travelReport: { gap: 5, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#8bdde2", backgroundColor: "#effcfc" }, reportEyebrow: { color: "#108a95", fontSize: 10, fontWeight: "900", letterSpacing: 1 }, reportDriver: { color: "#0d3e45", fontSize: 18, fontWeight: "900" }, reportDetails: { color: "#34747a", fontSize: 12, lineHeight: 17, fontWeight: "600" },
});
