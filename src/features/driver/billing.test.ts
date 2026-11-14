import { describe, expect, it } from "vitest";
import { firstMonthlyDue } from "./billing";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const ymd = (x: Date) => [x.getFullYear(), x.getMonth() + 1, x.getDate()];

describe("primer pago mensual", () => {
  it("cuenta creada a mitad de mes paga el fin de ese mes", () => {
    expect(ymd(firstMonthlyDue(d(2026, 10, 10)))).toEqual([2026, 10, 31]);
  });
  it("cuenta creada una semana antes del fin de mes pasa al siguiente fin de mes", () => {
    expect(ymd(firstMonthlyDue(d(2026, 10, 24)))).toEqual([2026, 11, 30]);
  });
  it("cuenta creada 8 días antes del fin de mes paga ese mismo mes", () => {
    expect(ymd(firstMonthlyDue(d(2026, 10, 23)))).toEqual([2026, 10, 31]);
  });
  it("diciembre tardío pasa a fin de enero", () => {
    expect(ymd(firstMonthlyDue(d(2026, 12, 28)))).toEqual([2027, 1, 31]);
  });
});
