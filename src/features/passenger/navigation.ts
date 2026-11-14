import { router } from "expo-router";

export type PassengerScreenName =
  | "welcome"
  | "phone"
  | "otp"
  | "role"
  | "register"
  | "terms"
  | "emergency"
  | "home"
  | "search"
  | "confirm"
  | "searching"
  | "offers"
  | "noOffers"
  | "enroute"
  | "arrived"
  | "ontrip"
  | "payment"
  | "finished"
  | "review"
  | "debt"
  | "menu"
  | "profile"
  | "places"
  | "history"
  | "reviews"
  | "contacts"
  | "termsView"
  | "driverMode"
  | "driverInfo";

export const PASSENGER_SCREEN_TITLES: Partial<Record<PassengerScreenName, string>> = {
  welcome: "WOKI",
  phone: "Ingresa tu celular",
  otp: "Verifica tu celular",
  role: "¿Cómo usarás la app?",
  register: "Crea tu cuenta",
  terms: "Términos y privacidad",
  emergency: "Contactos de emergencia",
  home: "¿A dónde vamos?",
  search: "Elige tu destino",
  confirm: "Confirma tu viaje",
  searching: "Buscando tu conductor",
  offers: "Ofertas para tu viaje",
  noOffers: "Sin ofertas por ahora",
  enroute: "Tu conductor está en camino",
  arrived: "¡Tu conductor llegó!",
  ontrip: "Viaje en curso",
  payment: "Hora de pagar",
  finished: "¡Llegaste!",
  review: "Viaje en revisión",
  menu: "Mi cuenta",
  profile: "Mi perfil",
  places: "Mis lugares",
  history: "Historial de viajes",
  reviews: "Reseñas recibidas",
  contacts: "Contactos de emergencia",
  termsView: "Términos y privacidad",
  driverMode: "Modo conductor",
  driverInfo: "Conduce con Woki",
  debt: "Pago pendiente",
};

export const PASSENGER_PUBLIC_SCREENS: ReadonlySet<PassengerScreenName> = new Set([
  "welcome", "phone", "otp", "role", "register", "terms", "emergency",
]);

export const PASSENGER_ACCOUNT_SCREENS: ReadonlySet<PassengerScreenName> = new Set([
  "profile", "places", "history", "reviews", "contacts", "emergency",
  "termsView", "driverMode", "driverInfo", "debt",
]);

export const PASSENGER_TRIP_SCREENS: ReadonlySet<PassengerScreenName> = new Set([
  "home", "search", "confirm", "searching", "offers", "noOffers",
  "enroute", "arrived", "ontrip", "payment", "finished", "review",
]);

/** Screens that can only render after a destination has been selected. */
export const PASSENGER_DESTINATION_SCREENS: ReadonlySet<PassengerScreenName> = new Set([
  "search", "confirm", "searching", "offers", "noOffers", "enroute",
  "arrived", "ontrip", "payment", "finished",
]);

export const isPassengerPublicScreen = (screen: PassengerScreenName) =>
  PASSENGER_PUBLIC_SCREENS.has(screen);
export const isPassengerAccountScreen = (screen: PassengerScreenName) =>
  PASSENGER_ACCOUNT_SCREENS.has(screen);
export const isPassengerTripScreen = (screen: string) =>
  PASSENGER_TRIP_SCREENS.has(screen as PassengerScreenName);
export const requiresPassengerDestination = (screen: PassengerScreenName) =>
  PASSENGER_DESTINATION_SCREENS.has(screen);
export const getPassengerScreenTitle = (screen: PassengerScreenName) =>
  PASSENGER_SCREEN_TITLES[screen];

export function goPassenger(screen: PassengerScreenName, replace = false) {
  const route = { pathname: "/pasajero/[screen]" as const, params: { screen } };
  if (replace) router.replace(route);
  else router.push(route);
}
