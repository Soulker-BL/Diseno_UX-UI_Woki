/** Último día del mes de la fecha dada (offset meses). */
export function endOfMonth(d: Date, offset = 0): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1 + offset, 0);
}

/** Días que se considera "muy cerca" del fin de mes para el primer cobro. */
export const GRACE_DAYS = 7;

/**
 * Primer pago mensual: siempre a fin de mes. Si la cuenta se crea a 7 días
 * o menos del fin de mes, el primer pago pasa al fin del mes siguiente.
 */
export function firstMonthlyDue(created: Date): Date {
  const start = new Date(
    created.getFullYear(),
    created.getMonth(),
    created.getDate(),
  );
  const end = endOfMonth(start);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return days <= GRACE_DAYS ? endOfMonth(start, 1) : end;
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
