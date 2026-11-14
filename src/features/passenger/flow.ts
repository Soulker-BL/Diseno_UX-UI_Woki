import type { PassengerPhase } from "../../store";
import { isPassengerTripScreen } from "./navigation";

/** An assigned trip must be resumed before another request can be started. */
export function resumeTrip(
  phase: PassengerPhase | null,
  assigned: boolean,
  screen: string,
): PassengerPhase | null {
  return phase && assigned && isPassengerTripScreen(screen) && screen !== phase
    ? phase
    : null;
}
