import { describe, expect, it } from "vitest";
import { driverReducer, initialDriver, type DriverState } from "./model";
import { PIN_END, PIN_START, makeOffers } from "../passenger/data";

const request = {
  id: 1,
  name: "Pasajero de prueba",
  rating: 4.9,
  from: "Plaza Chaupimarca",
  to: "Hospital Daniel A. Carrión",
  fare: 6,
  km: "0.8 km",
  min: 3,
  pay: "Yape" as const,
  ref: "Frente a la botica, puerta principal",
};

function startTrip(scheme: "comision" | "mensual" = "comision") {
  let state = driverReducer({ ...initialDriver(), account: "activo", registrationStage: "ready", requests: [request], earned: 42, debt: 0 }, { type: "scheme", scheme });
  state = { ...state, debt: 15 };
  state = driverReducer(state, { type: "accept", id: 1, extra: 2 });
  return driverReducer(state, { type: "arrive" });
}
function finish(state: DriverState) {
  state = driverReducer(state, { type: "pin", code: PIN_START });
  state = driverReducer(state, { type: "finish" });
  return driverReducer(state, { type: "pin", code: PIN_END });
}
describe("viajes del conductor nativo", () => {
  it("bloquea nuevas solicitudes para cuentas en revisión u observadas", () => {
    for (const account of ["revision", "observado"] as const) {
      const state = driverReducer(initialDriver(), {
        type: "account",
        account,
      });
      expect(driverReducer(state, { type: "accept", id: 1, extra: 0 })).toBe(
        state,
      );
    }
  });
  it("acepta la contraoferta y elimina la solicitud del radar", () => {
    const state = startTrip();
    expect(state.trip?.fare).toBe(8);
    expect(state.requests.some((req) => req.id === 1)).toBe(false);
    expect(state.phase).toBe("pin");
  });
  it("rechaza asignaciones simultáneas y PIN incorrectos", () => {
    const state = startTrip();
    expect(driverReducer(state, { type: "accept", id: 2, extra: 0 })).toBe(
      state,
    );
    expect(driverReducer(state, { type: "pin", code: "0000" })).toBe(state);
    expect(driverReducer(state, { type: "finish" })).toBe(state);
  });
  it("solo liquida al validar el pago y no duplica la ganancia", () => {
    const state = finish(startTrip());
    expect(state.phase).toBe("done");
    expect(state.earned).toBe(50);
    expect(state.debt).toBe(15.8);
    expect(state.history[0].commission).toBe(0.8);
    expect(driverReducer(state, { type: "pin", code: PIN_END })).toBe(state);
  });
  it("el plan mensual no cobra comisión por viaje", () => {
    const state = finish(startTrip("mensual"));
    expect(state.debt).toBe(15);
    expect(state.history[0].commission).toBe(0);
  });
  it("no admite deuda negativa ni pagos inválidos", () => {
    const state = initialDriver();
    expect(driverReducer(state, { type: "pay", amount: -1 })).toBe(state);
    expect(driverReducer(state, { type: "pay", amount: Infinity })).toBe(state);
    expect(driverReducer(state, { type: "pay", amount: 100 }).debt).toBe(0);
  });
});
describe("ofertas del pasajero", () => {
  it("ofrece solo vehículos con la capacidad solicitada", () => {
    expect(makeOffers(9, 6).every((offer) => offer.seats >= 6)).toBe(true);
    expect(makeOffers(9, 6)).toHaveLength(1);
    expect(makeOffers(9, 4)).toHaveLength(4);
  });
});
