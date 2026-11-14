import {
  createContext,
  useContext,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  START,
  type Offer,
  type Place,
  type Trip,
} from "./features/passenger/data";
import {
  driverReducer,
  initialDriver,
  type DriverAction,
  type DriverState,
} from "./features/driver/model";

export type TravelPreference = "En silencio" | "Me gusta conversar" | "Me adapto";
export type User = {
  first: string;
  last: string;
  lastMaterno: string;
  dni: string;
  phone: string;
  email: string;
  photo: string | null;
  travelPreference: TravelPreference;
};
export type Contact = { name: string; phone: string };
export type PassengerReceivedReview = {
  driver: string;
  rating: number;
  comment: string;
  date: string;
};
export type PassengerPhase =
  | "enroute"
  | "arrived"
  | "ontrip"
  | "payment"
  | "finished";
export type Passenger = {
  authenticated: boolean;
  user: User;
  origin: [number, number];
  dest: Place | null;
  price: number;
  pax: number;
  pay: "Efectivo" | "Yape" | "Plin";
  reference: string;
  notes: string;
  driver: Offer | null;
  phase: PassengerPhase | null;
  contacts: Contact[];
  saved: Place[];
  trips: Trip[];
  receivedReviews: PassengerReceivedReview[];
  debt: { amount: number; trip: string } | null;
  report: string;
};
export const newPassenger = (): Passenger => ({
  authenticated: false,
  user: { first: "", last: "", lastMaterno: "", dni: "", phone: "", email: "", photo: null, travelPreference: "Me adapto" },
  origin: START,
  dest: null,
  price: 0,
  pax: 1,
  pay: "Efectivo",
  reference: "",
  notes: "",
  driver: null,
  phase: null,
  contacts: [],
  saved: [],
  trips: [],
  receivedReviews: [],
  debt: null,
  report: "",
});
type Store = {
  passenger: Passenger;
  setPassenger: Dispatch<SetStateAction<Passenger>>;
  driver: DriverState;
  dispatchDriver: Dispatch<DriverAction>;
  reset: () => void;
};
const Context = createContext<Store | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [passenger, setPassenger] = useState(newPassenger);
  const [driver, dispatchDriver] = useReducer(
    driverReducer,
    undefined,
    initialDriver,
  );
  const reset = () => setPassenger(newPassenger());
  return (
    <Context.Provider
      value={{ passenger, setPassenger, driver, dispatchDriver, reset }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("AppProvider requerido");
  return value;
}
