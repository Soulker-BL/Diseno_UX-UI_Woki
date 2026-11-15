---
version: alpha
name: WOKI Passenger
description: A WOKI brand splash and landing-inspired role entry followed by consistent passenger and driver experiences.
colors:
  brand: "#218e97"
  deep: "#005b66"
  aqua: "#65d9dd"
  mist: "#73b6bd"
  paper: "#f5fbfc"
  map: "#eaf7f8"
  map-road: "#c8e9ed"
  ink: "#0d2f34"
typography:
  sans:
    fontFamily: "system-ui, sans-serif"
  mono:
    fontFamily: "ui-monospace, monospace"
rounded:
  sm: "12px"
  md: "17px"
  lg: "23px"
spacing:
  compact: "8px"
  control-gap: "14px"
  card-padding: "16px"
  screen-gutter: "20px"
components:
  button:
    height: "54px"
    radius: "15px"
  card:
    radius: "18px"
    border: "1px solid #bfe5e9"
  input:
    height: "54px"
    radius: "14px"
  role-card:
    radius: "19px"
    min-height: "92px"
---

# WOKI Passenger Design System

## Overview

### Creative North Star

Use the landing page and brand manual as identity references, not as a screen template. The app opens with the landing-matched Woki logo, tagline, and passing taxi animation, then a welcome screen with phone sign-in. The passenger flow verifies a phone, asks for a role, gathers a DNI and profile photo, and offers an emergency contact before opening the map. Keep the map as the primary surface and place booking and trip controls in a focused sheet above it.

### Product context and register

- **Audience and primary job:** People in Cerro de Pasco who want to request a taxi, negotiate a fare, and follow their trip.
- **Target market(s) and evidence:** Cerro de Pasco, Peru; the local landing page and current app data identify the city and destinations.
- **Locale(s) and language policy:** Spanish (Peru), with soles formatted by the existing app.
- **Usage scene:** Mobile use, often outdoors and time-sensitive; keep the role choice, next action, fare, and pickup details easy to scan.
- **Register:** Product interface with the landing page's confident brand expression.
- **Memorable signature:** The Woki location-pin “i”, animated taxi on a moving road, and the deep-to-cyan landing gradient.
- **Restraint:** Keep the splash logo-only and role choice concise. Keep booking sheets focused, compact, and readable over the map.
- **Anti-references:** Generic ride-hailing dashboards, unrelated stock imagery, and oversized demo controls. Keep a small, consistent Demo action in each passenger flow step.
- **Token ownership/runtime mapping:** `src/components/ui.tsx` owns the Woki palette and shared controls. `PassengerTheme` applies the same Woki surfaces to passenger and driver routes. `SplashScreen.tsx` mirrors the landing entrance with the Woki mark, “Tu taxi urbano, más cerca” tagline, gradient, and moving taxi on a full-width road. `WelcomeScreen.tsx` keeps the role choice focused without a duplicate route illustration.

## Colors

Use the manual and local Woki landing values: brand cyan `#218e97`, deep teal `#005b66`, aqua `#65d9dd`, mist `#73b6bd`, paper `#f5fbfc`, ink `#0d2f34`, pale cyan `#def5f7`, and warm pin yellow `#f5a524`. The entry surface uses a deep-to-cyan gradient with white type; passenger task screens use bright, light-cyan surfaces and white cards. Cyan carries the route and primary action; yellow marks destinations and selected ratings.

`passengerPalette` in `src/components/ui.tsx` is the runtime owner for shared Woki controls across passenger and driver routes. The splash and role selection use the landing page's deep-to-cyan gradient and the white Woki mark; both role choices share equal white cards with cyan icon surfaces. Ride screens use an illustrated map behind focused sheets.

## Typography

The brand manual and landing use Open Sans. The mobile project currently has no bundled Open Sans font that covers Android, iOS, and web; use the platform sans-serif fallback until a cross-platform font asset is added. Use bold display text sparingly, short sentence-case labels, and clear numeric pricing.

## Layout

The start screen presents the brand and phone sign-in. The role screen uses two equal choices after the OTP step. After passenger account setup, the map fills the viewport and a bottom sheet carries destination search, a vertical list of saved or suggested places, fare, payment, trip details, offers, and trip status. Driver registration collects identity and vehicle details, uploads required documents, shows review status, then asks for a commission or monthly plan before opening the work tabs. Driver routes share the passenger palette, cards, buttons, and status surfaces while keeping radar, active trip, wallet, and profile tasks distinct. Real driver screens do not present sample passengers, earnings, documents, vehicles, or reviews as live data; demo journeys are labeled and separated from the normal flow. Auth forms use a three-step indicator for phone, OTP, and identity. The DNI and identity lookup are demo-only until an approved RENIEC integration exists; never claim a real match. The emergency contact is optional. Auth and account forms use a 20 px gutter and keyboard-safe scrolling. Values map to React Native density-independent units.

## Elevation & Depth

Map surfaces and raised bottom sheets provide the main depth. Passenger task screens use fine teal-gray borders, restrained shadows, and light surfaces. Avoid layering cards inside cards unless the task has a distinct sub-panel.

## Shapes

Use rounded cards and controls from the landing's 14–28 px radius family. Role choices use 19 px corners; fields use 14 px; buttons use 15 px corners. Use the Woki pin shape for the logo and small location markers.

## Components

### Foundational visual states

Use high-contrast deep-teal actions, pale-teal secondary surfaces, visible disabled states, and a clear pressed response. Notices keep their existing semantic warning/error treatment. Keep the Demo action in the top bar and label sample identity or simulated service behavior in context.

### Buttons and actions

The splash presents the Woki mark, landing tagline, and the same 1.9-second taxi pass on a full-width road; it exits after the landing splash's 3.15-second intro. Role selection presents “Pasajero” first and “Conductor” second with equal visual weight. The passenger path enters DNI identity confirmation and a profile-photo step after phone verification. The driver choice starts a guided profile and document review, a clearly labeled approval demonstration, then payment-plan selection and the driver tabs. Keep primary actions explicit and role navigation clear.

### Navigation and data display

Keep route titles and back navigation. Authenticated passenger screens share a top-right hamburger that opens the side account drawer. Do not repeat the WOKI-city eyebrow on booking and ride screens; let the map and location data carry the context.

### Forms and overlays

Continue to use the existing React Native fields, validation, confirmation, and bottom-sheet components. Driver registration review must show an estimated wait, provide distinct approve and SOAT correction demos, and prevent the driver tabs from opening until documents are approved and a payment plan is selected. Do not allow payment-plan changes while an outstanding balance exists.

### Iconography

Use the location-pin “i” logo from the brand manual, simple outline passenger/car symbols, and compact route markers. Keep visible labels alongside icon actions.

### Motion

Use restrained pressed feedback. Any future route or car motion should respect reduced motion and communicate progress, not decorate every screen.

### Content and data visualization

Keep Spanish copy direct and local. Use account data when available, show helpful empty states when it is not, and use the existing soles formatter for monetary values.

## Do's and Don'ts

- **Do:** Reuse the landing page's exact Woki mark, color family, route language, and local city identity.
- **Do:** Keep role selection before passenger sign-in and registration.
- **Don't:** Present fabricated account details, trip offers, review scores, or money as live data.


## Passenger demo behavior

- Each passenger onboarding and ride step has a visible “Demo” action that advances with sample values. Keep it clearly labeled as a demonstration.
- SMS delivery and RENIEC lookup are not connected. Tell the user when a screen uses demonstration behavior.
- Destination suggestions currently filter the local place catalog; they are not live map geocoding.
- On the passenger home map, a centered pickup pin stays fixed while the map pans; the selected point is local demo data, not a geocoded address.
- Frequent places do not show fares. Saved places can carry a passenger-selected accent color.
- Group Yape and Plin under one digital wallet choice while preserving the selected provider in the existing payment value.
- Show at most three driver offers, with car color, plate, distance, seats, and fare. Do not show arrival time or an unverified verification claim in offers.
- On fare confirmation, keep payment, trip details, total offer, and “Buscar” in a fixed footer above the map. The payment selector opens with two selectable cards: Efectivo and Yape / Plin / Otros; the digital card then offers the individual provider choices. “Detalles” edits a freeform description and saves it explicitly.
- The hamburger remains reachable when the map sheet is collapsed. Account detail pages use a right-aligned return action instead of a hamburger.
- Keep emergency contact signup to one optional contact and let the passenger skip it with a text action.
