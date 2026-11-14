import { PIN_START, PIN_END } from "../passenger/data";
export type Request = {
  id: number;
  name: string;
  rating: number;
  from: string;
  to: string;
  fare: number;
  km: string;
  min: number;
  pay: "Efectivo" | "Yape";
  ref: string;
  demo?: boolean;
};
export type Phase = "none" | "pickup" | "pin" | "ontrip" | "paycode" | "done";
export type Scheme = "comision" | "mensual";
export type TripRecord = {
  id: string;
  name: string;
  from: string;
  to: string;
  fare: number;
  pay: string;
  at: string;
  commission: number;
};
export const MONTHLY_FEE = 120;
export type Account = "activo" | "revision" | "observado";
export type DriverDocumentKey = "dni" | "licencia" | "soat" | "revisionTecnica" | "tarjetaPropiedad";
export type DriverRegistrationStage = "personal" | "documents" | "review" | "plan" | "ready";
export type DriverDocument = { file: { name: string; uri: string } | null; status: "missing" | "uploaded" | "approved" | "rejected" };
export type DriverProfile = {
  firstName: string;
  lastName: string;
  maternalName: string;
  dni: string;
  phone: string;
  email: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
  photo: string | null;
  vehiclePhoto: string | null;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehiclePlate: string;
};
const emptyProfile = (): DriverProfile => ({
  firstName: "", lastName: "", maternalName: "", dni: "", phone: "", email: "", address: "", emergencyName: "", emergencyPhone: "", photo: null, vehiclePhoto: null,
  vehicleModel: "", vehicleYear: "", vehicleColor: "", vehiclePlate: "",
});
const emptyDocuments = (): Record<DriverDocumentKey, DriverDocument> => ({
  dni: { file: null, status: "missing" },
  licencia: { file: null, status: "missing" },
  soat: { file: null, status: "missing" },
  revisionTecnica: { file: null, status: "missing" },
  tarjetaPropiedad: { file: null, status: "missing" },
});
export type DriverState = {
  account: Account;
  registrationStage: DriverRegistrationStage;
  profile: DriverProfile;
  documents: Record<DriverDocumentKey, DriverDocument>;
  monthlyDue: string | null;
  requests: Request[];
  trip: { req: Request; fare: number } | null;
  phase: Phase;
  debt: number;
  earned: number;
  scheme: Scheme | null;
  history: TripRecord[];
};
export const initialDriver = (): DriverState => ({
  account: "revision",
  registrationStage: "personal",
  profile: emptyProfile(),
  documents: emptyDocuments(),
  monthlyDue: null,
  requests: [],
  trip: null,
  phase: "none",
  debt: 0,
  earned: 0,
  scheme: null,
  history: [],
});
export function hasOutstandingBalance(state: DriverState, now = new Date()) {
  if (state.debt > 0) return true;
  if (state.scheme !== "mensual" || !state.monthlyDue) return false;
  const due = new Date(`${state.monthlyDue}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Number.isFinite(due.getTime()) && today > due;
}
export type DriverAction =
  | { type: "account"; account: Account }
  | { type: "profile"; value: Partial<DriverProfile> }
  | { type: "registrationStage"; stage: DriverRegistrationStage }
  | { type: "document"; key: DriverDocumentKey; file: { name: string; uri: string } }
  | { type: "submitDocuments" }
  | { type: "demoApproveDocuments" }
  | { type: "demoRejectSoat" }
  | { type: "demoRequest" }
  | { type: "accept"; id: number; extra: number }
  | { type: "arrive" }
  | { type: "pin"; code: string }
  | { type: "finish" }
  | { type: "close" }
  | { type: "scheme"; scheme: Scheme | null; monthlyDue?: string }
  | { type: "pay"; amount: number };
export function driverReducer(
  state: DriverState,
  action: DriverAction,
): DriverState {
  switch (action.type) {
    case "account":
      return { ...state, account: action.account };
    case "profile":
      return { ...state, profile: { ...state.profile, ...action.value } };
    case "registrationStage":
      return { ...state, registrationStage: action.stage };
    case "document":
      return { ...state, documents: { ...state.documents, [action.key]: { file: action.file, status: "uploaded" } } };
    case "submitDocuments":
      if (Object.values(state.documents).some((document) => !document.file)) return state;
      return { ...state, registrationStage: "review", account: "revision", documents: Object.fromEntries(Object.entries(state.documents).map(([key, document]) => [key, { ...document, status: "uploaded" }])) as DriverState["documents"] };
    case "demoApproveDocuments":
      return state.registrationStage === "review"
        ? { ...state, registrationStage: "plan", documents: Object.fromEntries(Object.entries(state.documents).map(([key, document]) => [key, { ...document, status: "approved" }])) as DriverState["documents"] }
        : state;
    case "demoRejectSoat":
      return state.registrationStage === "review"
        ? { ...state, registrationStage: "documents", account: "observado", documents: { ...state.documents, soat: { ...state.documents.soat, status: "rejected" } } }
        : state;
    case "demoRequest": {
      if (state.account !== "activo" || state.requests.some((request) => request.demo)) return state;
      const request: Request = { id: Date.now(), name: "Pasajero demo", rating: 4.9, from: "Plaza Chaupimarca", to: "Hospital Daniel A. Carrión", fare: 6, km: "0.8 km", min: 3, pay: "Yape", ref: "Frente a la botica, puerta azul", demo: true };
      return { ...state, requests: [...state.requests, request] };
    }
    case "accept": {
      if (
        state.account !== "activo" ||
        state.phase !== "none" ||
        !Number.isFinite(action.extra) ||
        action.extra < 0
      )
        return state;
      const req = state.requests.find((r) => r.id === action.id);
      return req
        ? {
            ...state,
            trip: { req, fare: req.fare + action.extra },
            requests: state.requests.filter((r) => r.id !== req.id),
            phase: "pickup",
          }
        : state;
    }
    case "arrive":
      return state.phase === "pickup" ? { ...state, phase: "pin" } : state;
    case "finish":
      return state.phase === "ontrip" ? { ...state, phase: "paycode" } : state;
    case "pin": {
      if (state.phase === "pin" && action.code === PIN_START)
        return { ...state, phase: "ontrip" };
      if (state.phase !== "paycode" || action.code !== PIN_END || !state.trip)
        return state;
      const { req, fare } = state.trip;
      const commission =
        state.scheme === "mensual" ? 0 : +(fare * 0.1).toFixed(2);
      return {
        ...state,
        phase: "done",
        earned: state.earned + fare,
        debt: +(state.debt + commission).toFixed(2),
        history: [
          {
            id: `${req.id}-${Date.now()}`,
            name: req.name,
            from: req.from,
            to: req.to,
            fare,
            pay: req.pay,
            commission,
            at: new Date().toLocaleString("es-PE"),
          },
          ...state.history,
        ],
      };
    }
    case "close":
      return state.phase === "done"
        ? { ...state, trip: null, phase: "none" }
        : state;
    case "scheme":
      if (hasOutstandingBalance(state) && action.scheme !== state.scheme) return state;
      return {
        ...state,
        scheme: action.scheme,
        monthlyDue: action.scheme === "mensual" ? action.monthlyDue ?? state.monthlyDue : null,
        ...(state.registrationStage === "plan" && action.scheme
          ? { registrationStage: "ready" as const, account: "activo" as const }
          : {}),
      };
    case "pay":
      return Number.isFinite(action.amount) && action.amount > 0
        ? {
            ...state,
            debt: Math.max(0, +(state.debt - action.amount).toFixed(2)),
          }
        : state;
  }
}
