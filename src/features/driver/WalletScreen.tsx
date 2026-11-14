import { useState } from "react";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { Button, Card, Confirm, Notice, Screen, Sheet, openLink, s, type Confirmation } from "../../components/ui";
import { useApp } from "../../store";
import { soles, SUPPORT_PHONE, waLink } from "../passenger/data";
import { fmtDate, firstMonthlyDue } from "./billing";
import { hasOutstandingBalance, MONTHLY_FEE, type Scheme } from "./model";

export default function WalletScreen() {
  const { driver, dispatchDriver } = useApp();
  const [changeOpen, setChangeOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const hasDebt = hasOutstandingBalance(driver);
  const due = driver.monthlyDue ? new Date(`${driver.monthlyDue}T00:00:00`) : firstMonthlyDue(new Date());
  const monthlyOverdue = driver.scheme === "mensual" && !!driver.monthlyDue && hasDebt;
  const balance = driver.debt + (monthlyOverdue ? MONTHLY_FEE : 0);
  const commissionTotal = driver.history.reduce((total, trip) => total + trip.commission, 0);

  function choose(scheme: Scheme) {
    const monthlyDue = scheme === "mensual" ? firstMonthlyDue(new Date()).toISOString().slice(0, 10) : undefined;
    setConfirmation({
      title: "¿Cambiar forma de pago?",
      message: scheme === "comision" ? "Se aplicará una comisión del 10% a cada viaje completado." : `Se aplicará una cuota mensual de ${soles(MONTHLY_FEE)}. Primer vencimiento: ${fmtDate(firstMonthlyDue(new Date()))}.`,
      action: () => { dispatchDriver({ type: "scheme", scheme, monthlyDue }); setChangeOpen(false); },
    });
  }

  return (
    <Screen title="Billetera">
      <View style={styles.balanceCard}>
        <Text style={styles.eyebrow}>GANANCIAS REGISTRADAS</Text>
        <Text accessibilityLabel={`Ganancias registradas: ${soles(driver.earned)}`} style={styles.balanceAmount}>{soles(driver.earned)}</Text>
        <Text style={styles.balanceMeta}>{driver.history.length} {driver.history.length === 1 ? "viaje completado" : "viajes completados"}</Text>
      </View>

      <Card>
        <View style={styles.sectionTop}><Text style={s.heading}>Tu forma de pago</Text><Text style={styles.planTag}>{driver.scheme === "mensual" ? "MENSUAL" : "POR COMISIÓN"}</Text></View>
        {driver.scheme === "mensual" ? <>
          <Text style={styles.monthlyAmount}>{soles(MONTHLY_FEE)}<Text style={styles.monthlySuffix}> / mes</Text></Text>
          <Text style={s.text}>Cuota fija, sin comisión por viaje.</Text>
          <Text style={styles.dueLabel}>{monthlyOverdue ? "Vencido" : "Próximo vencimiento"} · {fmtDate(due)}</Text>
        </> : <>
          <Text style={s.text}>Comisión del 10% por cada viaje completado.</Text>
          <Text style={styles.dueLabel}>Comisiones acumuladas · {soles(commissionTotal)}</Text>
        </>}
        {balance > 0 && <Notice danger>{`Saldo pendiente · ${soles(balance)}. Regularízalo antes de cambiar tu forma de pago.`}</Notice>}
        <Button tone="secondary" disabled={hasDebt} onPress={() => setChangeOpen(true)}>Cambiar forma de pago</Button>
        {hasDebt && <Button compact tone="plain" onPress={() => { void openLink(waLink(SUPPORT_PHONE, `Hola, necesito orientación sobre mi saldo pendiente de ${soles(balance)} en Woki.`)); }}>Consultar con soporte</Button>}
      </Card>

      <View style={styles.metricRow}>
        <Metric label="Viajes" value={String(driver.history.length)} />
        <Metric label="Comisiones" value={soles(commissionTotal)} />
      </View>

      <Text style={s.heading}>Actividad reciente</Text>
      {driver.history.length ? driver.history.map((trip) => <Card key={trip.id} compact>
        <View style={styles.tripTop}><View style={{ flex: 1, gap: 4 }}><Text style={styles.tripTitle}>{trip.to}</Text><Text style={s.muted}>{trip.name} · {trip.at}</Text></View><Text style={styles.tripFare}>{soles(trip.fare)}</Text></View>
        <Text style={s.text}>{trip.from} → {trip.to}</Text>
        <Text style={s.muted}>Pago · {trip.pay}{driver.scheme === "comision" ? ` · Comisión ${soles(trip.commission)}` : " · Plan mensual"}</Text>
      </Card>) : <Card>
        <Text style={s.heading}>Aún no tienes movimientos</Text>
        <Text style={s.muted}>Al completar viajes, verás aquí las tarifas y ganancias registradas.</Text>
        <Button onPress={() => router.push("/conductor")}>Ir al Radar</Button>
      </Card>}

      {changeOpen && !confirmation && <Sheet title="Cambiar forma de pago" close={() => setChangeOpen(false)}>
        <PlanOption active={driver.scheme === "comision"} title="Por comisión" description="10% por cada viaje completado. Sin cuota fija mensual." action={() => choose("comision")} />
        <PlanOption active={driver.scheme === "mensual"} title="Plan mensual" description={`${soles(MONTHLY_FEE)} al mes, sin comisión por viaje. Primer vencimiento ${fmtDate(firstMonthlyDue(new Date()))}.`} action={() => choose("mensual")} />
      </Sheet>}
      <Confirm value={confirmation} close={() => setConfirmation(null)} />
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={s.muted}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

function PlanOption({ active, title, description, action }: { active: boolean; title: string; description: string; action: () => void }) {
  return <Card compact>
    <Text style={styles.planOptionTitle}>{title}{active ? " · Actual" : ""}</Text>
    <Text style={s.muted}>{description}</Text>
    <Button disabled={active} tone={active ? "plain" : "secondary"} onPress={action}>{active ? "Forma actual" : "Elegir esta forma"}</Button>
  </Card>;
}

const styles = {
  balanceCard: { gap: 4, padding: 18, borderRadius: 20, backgroundColor: "#087f91" },
  eyebrow: { color: "#baf3f4", fontSize: 10, fontWeight: "900" as const, letterSpacing: 1 },
  balanceAmount: { color: "#fff", fontSize: 34, lineHeight: 40, fontWeight: "900" as const, fontVariant: ["tabular-nums"] as const },
  balanceMeta: { color: "#e1fbfc", fontSize: 12, fontWeight: "600" as const },
  sectionTop: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, gap: 8 },
  planTag: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 13, color: "#005b66", backgroundColor: "#dff6f7", fontSize: 9, fontWeight: "900" as const, letterSpacing: 0.4 },
  monthlyAmount: { color: "#005b66", fontSize: 27, fontWeight: "900" as const },
  monthlySuffix: { color: "#526e73", fontSize: 12, fontWeight: "700" as const },
  dueLabel: { color: "#087f91", fontSize: 12, fontWeight: "800" as const },
  metricRow: { flexDirection: "row" as const, gap: 10 },
  metric: { flex: 1, gap: 4, padding: 13, borderRadius: 16, borderWidth: 1, borderColor: "#bfe5e9", backgroundColor: "#fff" },
  metricValue: { color: "#005b66", fontSize: 19, fontWeight: "900" as const },
  tripTop: { flexDirection: "row" as const, alignItems: "flex-start" as const, justifyContent: "space-between" as const, gap: 9 },
  tripTitle: { color: "#0d3e45", fontSize: 14, fontWeight: "900" as const },
  tripFare: { color: "#005b66", fontSize: 19, fontWeight: "900" as const },
  planOptionTitle: { color: "#123c42", fontSize: 15, fontWeight: "900" as const },
};
