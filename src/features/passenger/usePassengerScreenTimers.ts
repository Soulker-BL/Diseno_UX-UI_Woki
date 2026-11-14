import { useEffect, useState } from "react";
import { goPassenger, type PassengerScreenName } from "./navigation";

/** Owns screen-scoped timers and cleans them up when the passenger changes route. */
export function usePassengerScreenTimers(screen: PassengerScreenName) {
  const [otpSeconds, setOtpSeconds] = useState(30);

  useEffect(() => {
    if (screen !== "searching") return;
    const timer = setTimeout(() => goPassenger("offers", true), 6000);
    return () => clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== "otp") return;
    const timer = setInterval(() => setOtpSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [screen]);

  return {
    otpSeconds,
    resetOtpTimer: () => setOtpSeconds(30),
  };
}
