import { useState } from "react";
import { router } from "expo-router";
import { Text, View } from "react-native";
import {
  Button,
  Card,
  Confirm,
  Field,
  MapPreview,
  Notice,
  Screen,
  openLink,
  s,
  type Confirmation,
} from "../../components/ui";
import { useApp } from "../../store";
import { PIN_END, PIN_START, soles } from "../passenger/data";

export function RadarScreen() {
  const { driver, dispatchDriver } = useApp();
  const [online, setOnline] = useState(true);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const account = driver.account;

  function accept(id: number, extra: number) {
    setConfirmation({
      title: extra ? `¿Enviar una oferta de ${soles(extra)} adicionales?` : "¿Aceptar esta solicitud?",
      message: extra ? `La tarifa propuesta será ${soles((driver.requests.find((request) => request.id === id)?.fare ?? 0) + extra)}.` : "Se asignará este viaje a tu cuenta.",
      action: () => {
        dispatchDriver({ type: "accept", id, extra });
        router.push("/conductor/viaje");
      },
    });
  }

  return (
    <Screen title="Radar de viajes">
      {account !== "activo" ? (
        <>
          <Notice danger>{account === "revision" ? "Tu cuenta está en revisión y todavía no puede recibir solicitudes." : "Tu cuenta necesita atención antes de recibir nuevas solicitudes."}</Notice>
          <Button onPress={() => router.push("/conductor/perfil")}>Revisar mi perfil</Button>
        </>
      ) : (
        <>
          <View style={{ minHeight: 70, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 17, borderWidth: 1, borderColor: "#bfe5e9", backgroundColor: "#fff" }}>
            <View style={{ flex: 1, gap: 2 }}><Text style={s.muted}>Ganancias de hoy</Text><Text style={{ color: "#005b66", fontSize: 23, fontWeight: "900" }}>{soles(driver.earned)}</Text></View>
            <Button compact tone={online ? "secondary" : "primary"} onPress={() => setOnline((value) => !value)}>{online ? "Pausar" : "Conectarme"}</Button>
          </View>
          {driver.phase !== "none" && <Button onPress={() => router.push("/conductor/viaje")}>Ver viaje activo</Button>}
          {!online ? (
            <Card><Text style={s.heading}>Solicitudes pausadas</Text><Text style={s.muted}>Vuelve a activarlas cuando estés listo para recibir viajes.</Text></Card>
          ) : (
            <>
              <MapPreview origin={driver.requests.some((request) => request.demo) ? [30, 74] : undefined} dest={driver.requests.some((request) => request.demo) ? [78, 27] : undefined} />
              <Text style={s.label}>{driver.requests.length ? `${driver.requests.length} SOLICITUDES CERCA` : "SOLICITUDES CERCA"}</Text>
              {driver.requests.length ? driver.requests.map((request) => (
                <Card key={request.id}>
                  {request.demo && <Text style={styles.demoPill}>VIAJE DE DEMOSTRACIÓN · NO ES UNA SOLICITUD REAL</Text>}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}><Text style={s.heading}>{request.name}</Text><Text style={s.price}>{soles(request.fare)}</Text></View>
                  <Text style={{ color: "#a96b00", fontSize: 13, fontWeight: "900" }}>★ {request.rating} <Text style={s.muted}>· {request.km} · {request.min} min</Text></Text>
                  <View style={{ gap: 6, padding: 11, borderRadius: 14, backgroundColor: "#eff9fa" }}><Text style={s.muted}>RECOJO</Text><Text style={s.text}>{request.from}</Text><Text style={s.muted}>DESTINO</Text><Text style={s.text}>{request.to}</Text></View>
                  <Text style={s.muted}>Pago · {request.pay} · {request.ref}</Text>
                  <Button disabled={driver.phase !== "none"} onPress={() => accept(request.id, 0)}>Aceptar tarifa</Button>
                  <View style={{ flexDirection: "row", gap: 8 }}>{[1, 2, 3].map((extra) => <Button key={extra} compact tone="secondary" disabled={driver.phase !== "none"} onPress={() => accept(request.id, extra)}>{`+ ${soles(extra)}`}</Button>)}</View>
                </Card>
              )) : (
                <Card>
                  <Text style={s.heading}>Esperando solicitudes</Text>
                  <Text style={s.muted}>Cuando haya viajes disponibles cerca, aparecerán aquí con su ruta y tarifa.</Text>
                  <Button tone="secondary" onPress={() => dispatchDriver({ type: "demoRequest" })}>Probar el flujo completo</Button>
                </Card>
              )}
              {driver.requests.length > 0 && !driver.requests.some((request) => request.demo) && <Button compact tone="plain" onPress={() => dispatchDriver({ type: "demoRequest" })}>Probar viaje de demostración</Button>}
            </>
          )}
        </>
      )}
      <Confirm value={confirmation} close={() => setConfirmation(null)} />
    </Screen>
  );
}

export function TripScreen() {
  const { driver } = useApp();
  return <TripContent key={driver.trip?.req.id ?? "none"} />;
}

function TripContent() {
  const { driver, dispatchDriver } = useApp();
  const { trip, phase } = driver;
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation>(null);

  if (driver.account !== "activo") return <Screen title="Cuenta no habilitada"><Notice danger>Tu cuenta necesita estar activa para continuar con un viaje.</Notice><Button onPress={() => router.replace("/conductor")}>Ir al Radar</Button></Screen>;

  return (
    <Screen title={phase === "done" ? "Viaje finalizado" : "Mi viaje"}>
      {!!message && <Notice danger>{message}</Notice>}
      {!trip ? (
        <Card>
          <View style={{ width: 50, height: 50, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "#dff6f7" }}><Text style={{ color: "#087f91", fontSize: 26, fontWeight: "900" }}>⌖</Text></View>
          <Text style={s.heading}>No tienes un viaje activo</Text>
          <Text style={s.muted}>Las solicitudes que aceptes desde el Radar aparecerán en esta sección.</Text>
          <Button onPress={() => router.replace("/conductor")}>Ir al Radar</Button>
        </Card>
      ) : (
        <>
          {phase !== "done" && <MapPreview />}
          <Card>
            {trip.req.demo && <Text style={styles.demoPill}>VIAJE DE DEMOSTRACIÓN</Text>}
            <Text style={s.label}>{phase === "pickup" || phase === "pin" ? "PUNTO DE RECOJO" : phase === "ontrip" ? "EN RUTA AL DESTINO" : "VIAJE COMPLETADO"}</Text>
            <Text style={s.heading}>{trip.req.name} · ★ {trip.req.rating}</Text>
            <View style={{ gap: 6, padding: 12, borderRadius: 14, backgroundColor: "#eff9fa" }}><Text style={s.muted}>RECOJO</Text><Text style={s.text}>{trip.req.from}</Text><Text style={s.muted}>DESTINO</Text><Text style={s.text}>{trip.req.to}</Text></View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Text style={s.muted}>Tarifa acordada</Text><Text style={s.price}>{soles(trip.fare)}</Text></View>
            <Text style={s.muted}>Pago · {trip.req.pay}</Text>
            <Text style={s.text}>{trip.req.ref}</Text>
          </Card>
          {phase === "pickup" && <Button onPress={() => { setPin(""); setMessage(""); dispatchDriver({ type: "arrive" }); }}>Llegué al punto de recojo</Button>}
          {(phase === "pin" || phase === "paycode") && <Card>
            <Text style={s.heading}>{phase === "pin" ? "Confirma el inicio del viaje" : "Confirma el pago"}</Text>
            <Text style={s.muted}>{phase === "pin" ? "Pide al pasajero el PIN que aparece en su app." : "Después de recibir el pago, pide al pasajero su código de cierre."}</Text>
            {trip.req.demo && <Notice>{`Código de demostración: ${phase === "pin" ? PIN_START : PIN_END}`}</Notice>}
            <Field label="Código de 4 dígitos" keyboardType="number-pad" maxLength={4} value={pin} onChangeText={(value) => setPin(value.replace(/\D/g, ""))} />
            <Button disabled={pin.length !== 4} onPress={() => {
              const expected = phase === "pin" ? PIN_START : PIN_END;
              if (pin !== expected) setMessage("El código no coincide. Verifícalo con el pasajero e inténtalo otra vez.");
              else { dispatchDriver({ type: "pin", code: pin }); setPin(""); setMessage(""); }
            }}>Confirmar código</Button>
          </Card>}
          {phase === "ontrip" && <>
            <Button tone="danger" onPress={() => { void openLink("tel:105"); }}>SOS · Llamar al 105</Button>
            <Button onPress={() => setConfirmation({ title: "¿Finalizar el viaje?", message: "Confirma que el pasajero llegó a su destino. Después podrás registrar el pago con su código de cierre.", action: () => dispatchDriver({ type: "finish" }) })}>Finalizar viaje</Button>
          </>}
          {phase === "done" && <>
            <Notice>Pago confirmado y ganancia registrada.</Notice>
            <Button onPress={() => { dispatchDriver({ type: "close" }); router.replace("/conductor"); }}>Volver al Radar</Button>
          </>}
        </>
      )}
      <Confirm value={confirmation} close={() => setConfirmation(null)} />
    </Screen>
  );
}

const styles = {
  demoPill: { alignSelf: "flex-start" as const, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, color: "#684800", backgroundColor: "#fff0bd", fontSize: 9, fontWeight: "900" as const, letterSpacing: 0.35 },
};
