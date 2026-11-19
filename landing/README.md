# Mensualy — landing

Landing page de Mensualy (Next.js 16, App Router, Tailwind v4), con el mismo
diseño y estructura que las de Meld (`../../meld-app/landing`) y MyWallet
(`../../my-wallet-app/landing`). Proyecto npm aparte de la app de Expo: tiene
su propio `package.json`/`node_modules`, y la raíz lo ignora (`tsconfig.json`
→ `exclude`, `metro.config.js` → `resolver.blockList`).

```bash
cd landing
npm install
npm run dev          # http://localhost:3000 → redirige a /es o /en
npm run build && npm start
npm run lint
```

`PageProps`/`LayoutProps` son tipos globales que genera Next: `tsc --noEmit`
falla hasta que corre un `next dev` o `next build` por primera vez.

- **Identidad**: paleta = `DASH` de la app (`src/features/dashboard/dashboardTheme.ts`),
  en `src/app/globals.css` (`@theme`). Plus Jakarta Sans (la de la app),
  JetBrains Mono para etiquetas y Caveat para las notas a mano. El ícono
  (`public/img/mensualy-mark.png`) es `assets/brand-mark.png` de la app.
- **Idiomas**: textos en `src/i18n/es.ts` (el tipo sale de ahí) y `en.ts`.
  `src/proxy.ts` redirige `/` al idioma del navegador; solo existen `/es` y `/en`.
- **Contenido "de la app"** (teléfono, notificaciones, catálogo):
  `src/content/app.ts`. No se traduce: la app hoy está en español y en COP.
  Servicios, colores y monogramas salen de `services.catalog.ts`; los logos son
  copia de `assets/logos/` (si se agrega uno a la app, copiarlo a
  `public/img/logos/`). Los datos de ejemplo están armados para que cada
  sección cuente lo mismo (HBO Max = "poco uso", Streaming = 3 servicios y
  categoría principal, ChatGPT = 34% del total). Si se cambia un monto,
  revisar esos ejemplos en `savings.cards`.
- **Demo interactiva (portada)**: `src/demo/`. Un solo estado (`useDemo.ts`,
  reducer, solo en memoria: al recargar vuelve a `DEMO_SUBS`) que leen el
  teléfono (`DemoPhone.tsx`), el narrador de la izquierda (`Narrator.tsx`) y el
  resumen en vivo de la derecha (`DemoSection.tsx`). Cada pantalla de
  `src/demo/phone/` es una réplica de la app con sus medidas, colores y textos,
  dibujada a 390 px lógicos y escalada por `PhoneFrame`:
  `Dashboard.tsx` (dashboard + `FloatingDock`), `NewSheet.tsx`
  (`NewSubscriptionSheet`, sin gasto compartido ni cambio de moneda),
  `DetailSheet.tsx` (`SubscriptionDetailSheet` + `CancelConfirmSheet`) y
  `Banner.tsx` (la notificación de `rescheduleAllReminders`; tocarla abre el
  detalle, como en la app). `suggestions.ts` copia las reglas de "Sugerencias de
  ahorro" del dashboard (sin "subió de precio", que necesita historial). Si
  cambia el diseño o las reglas en la app, actualizar la réplica. "Editar
  suscripción" se muestra pero no responde. En pantallas chicas el narrador
  queda debajo del teléfono, así que sus acciones suben la vista al teléfono.
- **Lista de espera**: vive en **joblan** (`joblanstudio.com/<idioma>?app=mensualy#avisame`,
  `src/components/WaitlistCta.tsx`), el estudio donde están todas las apps.
  Mensualy comparte el segmento "General" de Resend y se distingue por su topic
  (ver `joblan-web/src/lib/newsletter/resend.ts`). Esta landing no guarda nada.
- **Política de privacidad**: `src/legal/docs.ts` → `/[lang]/privacy`. Refleja
  el producto actual (sin cuentas, sin red, SQLite local). Si la app empieza a
  enviar datos o pide un permiso nuevo, actualizarla antes de publicar.
- **Animaciones**: `Reveal.tsx` (entrada al aparecer), `CountUp.tsx`,
  `StackedCards.tsx` (copiado de Meld) y clases de `globals.css` (`float-card`,
  `marquee`, `notif-hop`, `bell-ring`…). Todas mueven solo `transform`/`opacity`
  y se apagan con "reducir movimiento".

## Gotcha: animaciones con `@keyframes`

Tailwind v4 elimina del CSS final los `@keyframes` declarados dentro de
`@theme` que ninguna clase suya usa. Los que se usan desde clases propias o
estilos en línea van FUERA de `@theme`, en `globals.css` normal.

## Estado

- Fase 1 (hecha): diseño completo en español e inglés, política de privacidad.
- Fase 2 (hecha): demo interactiva (agregar, servicio local, detalle, marcar
  usada, cancelar, aviso de cobro, descartar sugerencias), narrador y resumen en vivo.
- Fase 3: capturas reales, imagen Open Graph y deploy en Vercel (repo de GitHub
  pendiente de crear).
