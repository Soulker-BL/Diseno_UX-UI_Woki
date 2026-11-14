# Taxi App · Pasajero y Conductor

Aplicación móvil en React Native + Expo SDK 58 + TypeScript. Usa componentes nativos (`View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, `Modal`) y Expo Router. No usa WebView, HTML, Vite ni las carpetas de código de `frontend` en ejecución.

## Ejecutar en un teléfono

```sh
cd App
npm install
npm start
```

Escanea el QR con una versión de Expo Go compatible con SDK 58 y conecta el teléfono y la computadora a la misma red. También puedes ejecutar `npm run android` con un emulador Android instalado. En Windows, iOS se puede revisar en un iPhone con Expo Go; el simulador de iOS requiere macOS.

Vista previa del mismo código con React Native Web:

```sh
npm run web
```

Esta vista previa es una herramienta para revisar la app móvil. El panel de administración del Operador vive exclusivamente en `../web`.

## Flujos migrados

- **Pasajero:** bienvenida, celular, OTP simulado, elección de modo, registro con foto, términos y contactos de emergencia. Búsqueda de destinos, ajuste del recojo en un mapa simulado, precio negociable, capacidad del vehículo, efectivo/Yape, ofertas y contraofertas, conductor no disponible, seguimiento simulado, PIN, pago, calificación, reportes, deuda, historial, lugares guardados, perfil y eliminación de la cuenta de demostración.
- **Conductor:** radar, conexión, simulación de estado de cuenta, aceptación y contraofertas, viaje con PIN de inicio y fin, chat simulado, llamada, SOS, ganancias e historial, comisión del 10% o plan mensual, comprobantes con aprobación/rechazo simulados, perfil, documentos y registro de vehículos.
- **Archivos:** las fotos usan `expo-image-picker`; documentos y comprobantes usan `expo-document-picker`. Los archivos permanecen locales, no se suben a un servidor.

El Pasajero conserva su acceso inicial. El Conductor accede directamente desde el selector principal. OTP: cualquier código numérico de 6 dígitos. PIN de inicio: `4821`. PIN de pago: `3590`, unificado entre ambos modos móviles.

## Estructura

- `src/app`: rutas y pestañas de Expo Router.
- `src/components/ui.tsx`: componentes nativos compartidos, mapas y selectores de archivos.
- `src/features/passenger`: pantallas, datos, términos y navegación del Pasajero.
- `src/features/driver`: radar, viaje, billetera, perfil y reglas de facturación.
- `src/store.tsx`: estado local de las simulaciones.

## Verificar

```sh
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo-doctor
npx expo export --platform all
```

`expo export` comprueba y genera los bundles de Android, iOS y la vista previa web; no genera un APK/IPA firmado. Para distribuir la app, habrá que configurar un proyecto de EAS y credenciales de compilación.

## Alcance actual

Todavía no hay backend, autenticación real, GPS, mapas reales, procesamiento de pagos ni sincronización entre Pasajero, Conductor y Operador. Los datos son de demostración y viven en memoria; se reinician al recargar o cerrar el proceso. Los botones de teléfono y WhatsApp abren la aplicación correspondiente del dispositivo.

Se conservan las tarifas de los prototipos: el plan mensual de Conductor es S/ 120, mientras que los datos originales del Operador usan S/ 50. Esta diferencia debe resolverse al definir las reglas del futuro backend compartido.

Referencias de configuración: [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/) y [Expo Router](https://docs.expo.dev/router/installation/).
