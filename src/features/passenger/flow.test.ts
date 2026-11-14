import { describe, expect, it } from "vitest";
import { resumeTrip } from "./flow";

describe("continuidad del viaje del pasajero", () => {
  it("impide pedir un segundo viaje o volver a una fase anterior", () => {
    for (const screen of ["home", "search", "confirm", "offers", "enroute"]) {
      expect(resumeTrip("ontrip", true, screen)).toBe("ontrip");
    }
  });
  it("permite ver el viaje actual y editar los contactos de emergencia", () => {
    expect(resumeTrip("ontrip", true, "ontrip")).toBeNull();
    expect(resumeTrip("ontrip", true, "contacts")).toBeNull();
    expect(resumeTrip("ontrip", true, "menu")).toBeNull();
  });
  it("no redirige cuando todavía no hay un viaje asignado", () => {
    expect(resumeTrip(null, false, "home")).toBeNull();
    expect(resumeTrip("enroute", false, "home")).toBeNull();
  });
});
