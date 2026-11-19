# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Landing page (`landing/`)

Next.js 16 + Tailwind v4, proyecto npm APARTE (no workspace): `metro.config.js`
la excluye (`resolver.blockList`) y `tsconfig.json` tiene `"exclude": ["landing"]`.
Misma estructura que las landings de meld-app y my-wallet-app. La lista de espera
vive en joblan (`?app=mensualy`). Si cambia el diseño del dashboard, el catálogo o
lo que la app guarda/envía, revisar `landing/` (réplica del teléfono, logos,
política de privacidad). Detalle en `landing/README.md`.
