// Textos del sitio. El tipo `Dictionary` sale de este objeto: `en.ts` tiene
// que tener exactamente las mismas claves. Lo que se ve "dentro de la app"
// (teléfono, notificaciones, nombres de servicios) NO va acá: vive en
// `src/content/app.ts` y no se traduce, porque la app hoy existe en español.

export const es = {
  meta: {
    title: 'Mensualy — tus suscripciones, cada mes sin sorpresas',
    description:
      'Mira cuánto pagas al mes y al año en suscripciones, recibe un aviso antes de cada cobro y descubre cuáles ya no usas. Sin cuentas, sin nube y sin tocar tus pagos.',
  },
  nav: {
    language: 'Idioma',
    label: 'Secciones',
    demo: 'Pruébala',
    features: 'Funciones',
    privacy: 'Privacidad',
    notify: 'Avísame',
  },
  legal: {
    back: 'Volver',
  },
  waitlist: {
    label: 'Avísame cuando Mensualy llegue a Google Play',
    submit: 'Avísame',
  },
  hero: {
    iconAlt: 'Ícono de Mensualy',
    eyebrow: 'Control de suscripciones',
    title1: 'Cada mes,',
    title2: 'sin sorpresas.',
    subtitle:
      'Todas tus suscripciones en un solo lugar: lo que pagas al mes y al año, un aviso antes de cada cobro y señales claras de cuáles ya no usas.',
    finePrint: 'Próximamente en Android · iOS en camino · Gratis',
    privacyLink: 'Tus datos no salen de tu teléfono',
  },
  demo: {
    narratorNote: 'lo que está pasando',
    liveNote: 'se actualiza en vivo',
    tryTitle: 'Prueba esto',
    actions: { add: 'Agregar una suscripción', banner: 'Simular aviso de cobro', zombie: 'Revisar la suscripción zombie', reset: 'Reiniciar demo' },
    live: {
      title: 'Tu resumen',
      month: 'Al mes',
      year: 'Al año',
      active: 'Activas',
      next: 'Próximo cobro',
      nextIn: 'en {days} días',
      nextToday: 'hoy',
      possible: 'Si cancelas lo que casi no usas',
      possibleNote: 'Suscripciones zombie y de poco uso, al año.',
      none: 'Nada por ahora',
    },
    ev: {
      intro: {
        eyebrow: 'Pruébala aquí',
        title: 'Es la app de verdad, con datos de ejemplo.',
        body: 'Toca una renovación o una sugerencia para ver su detalle, usa + para agregar una suscripción o simula el aviso de cobro. Nada se guarda: al recargar vuelve a empezar.',
      },
      addOpen: {
        eyebrow: 'Agregar',
        title: 'Nueva suscripción',
        body: 'Busca un servicio del catálogo, o escribe uno que no exista (como “Gimnasio del barrio”) para agregarlo con sus iniciales. Pon el monto, la fecha de cobro y cuándo quieres el aviso.',
      },
      added: { eyebrow: 'Listo', title: 'Agregaste {name}', body: 'Mira cómo cambian el total del mes y del año. Si el cobro está cerca, ya aparece en “Próxima renovación”.' },
      addedLocal: { eyebrow: 'Servicio local', title: 'Agregaste {name}', body: 'No estaba en el catálogo, así que quedó con sus iniciales. Igual suma a tu gasto y te avisa antes del cobro.' },
      detail: { eyebrow: 'Detalle', title: '{name}', body: 'Lo que pagas al mes y al año, cuándo es el próximo cobro, cuánto falta y con cuánta anticipación te avisa.' },
      used: { eyebrow: 'Actividad', title: 'Marcada como usada', body: 'Así Mensualy sabe que la sigues usando y deja de sugerirla como zombie.' },
      cancelAsk: { eyebrow: 'Cancelar', title: '¿La cancelas?', body: 'Mensualy no entra a Netflix o Spotify por ti: deja de contarla en tu gasto y tú la cancelas en el servicio cuando quieras.' },
      cancelled: { eyebrow: 'Cancelada', title: 'Cancelaste {name}', body: 'Tu gasto bajó al instante. En la app queda en el historial y se reactiva con un toque.' },
      banner: { eyebrow: 'Recordatorio', title: 'Así te avisa', body: 'Esta es la notificación que llega antes del cobro de {name}. Tócala en el teléfono: abre directo su detalle.' },
      bannerTap: { eyebrow: 'Desde la notificación', title: 'Directo al detalle', body: 'Un toque y estás en la suscripción, a tiempo para revisarla o cancelarla antes de que te cobren.' },
      dismissed: { eyebrow: 'Sugerencias', title: 'Sugerencia descartada', body: 'No te la vuelve a mostrar por ahora. Las sugerencias te avisan, nunca deciden por ti.' },
    },
  },
  catalog: {
    eyebrow: 'Agregar',
    titleA: 'Más de',
    chip: '50',
    titleB: 'servicios, o el tuyo.',
    subtitle:
      'Busca Netflix, Spotify o ChatGPT y Mensualy completa el nombre, el logo y la categoría. ¿Pagas algo que no está, como el gimnasio del barrio? Agrégalo igual: queda con sus iniciales.',
    localTitle: '¿No está en el catálogo?',
    localBody: 'Escribe el nombre y sigue. Nada te frena.',
    localExample: 'Gimnasio',
    localAdded: 'Agregada',
    steps: [
      { t: 'Busca el servicio', d: 'Logo, nombre y categoría listos.' },
      { t: 'Pon el monto', d: 'En COP, USD o EUR, con separador de miles al escribir.' },
      { t: 'Elige la fecha de cobro', d: 'Una vez: Mensualy la corre sola cada mes.' },
    ],
  },
  reminders: {
    eyebrow: 'Recordatorios',
    title: 'Te avisa antes de que te cobren.',
    subtitle:
      'Elige cuántos días antes quieres enterarte, para cada suscripción o para todas. Y si no eliges nada, igual te avisa el mismo día del cobro.',
    optionsTitle: 'Avísame',
    options: ['El mismo día', '1 día antes', '2 días antes', '3 días antes'],
    tapTitle: 'Un toque y estás ahí',
    tapBody: 'Al tocar la notificación se abre el detalle de esa suscripción, listo para cancelarla o editarla.',
    localNote: 'Notificaciones locales: se programan en tu teléfono, sin servidores.',
  },
  calendar: {
    eyebrow: 'Calendario',
    title: 'Tu mes, cobro por cobro.',
    subtitle: 'Cada punto es un cobro. Toca un día y ves qué se renueva y por cuánto.',
    month: 'Noviembre 2026',
    weekdays: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    monthShort: 'de noviembre',
    monthTotal: 'Total del mes',
    charges: 'cobros',
    selectedLabel: 'Cobros del',
    hint: 'Toca un día con punto',
    empty: 'Ese día no se cobra nada.',
  },
  savings: {
    eyebrow: 'Sugerencias de ahorro',
    title: 'Te dice qué sobra.',
    subtitle:
      'Mensualy revisa tus suscripciones y te muestra, sin juzgar, dónde se te está yendo la plata.',
    cards: [
      { t: 'Suscripción zombie', d: '90 días o más sin marcarla como usada.', example: 'Disney+ · 97 días sin uso' },
      { t: 'Subió de precio', d: 'Guarda el historial de cada monto y detecta los aumentos del último año.', example: 'Spotify · 12% más caro' },
      { t: 'Poco uso', d: 'Un aviso temprano antes de que se vuelva zombie.', example: 'HBO Max · 52 días sin uso' },
      { t: 'Servicios repetidos', d: 'Dos o más en la misma categoría: ¿los necesitas todos?', example: 'Streaming · 3 servicios' },
      { t: 'Gasto desproporcionado', d: 'Cuando una sola se lleva un cuarto o más de tu gasto mensual.', example: 'ChatGPT Plus · 34% del total' },
    ],
  },
  sharing: {
    eyebrow: 'Gasto compartido',
    title: 'Divide y paga solo tu parte.',
    subtitle:
      '¿Compartes Spotify con tu pareja o Netflix con tu familia? Marca con quién y qué porcentaje pones tú. Mensualy calcula cuánto te ahorras al mes, sin descuadres de centavos.',
    you: 'Tú pagas',
    them: 'Laura paga',
    saved: 'Reduces tu gasto en',
    perMonth: '/mes',
    portion: 'Tu porción',
  },
  details: {
    title: 'Y los detalles que importan',
    items: {
      offline: { t: 'Funciona sin internet', d: 'Todo vive en tu teléfono. Abre, anota y listo.' },
      currency: { t: 'COP, USD y EUR', d: 'Mezcla monedas y ve todo en la tuya.' },
      auto: { t: 'Fechas que se corren solas', d: 'Elige el día una vez; cada ciclo avanza automático.' },
      cycles: { t: 'Semanal, mensual o anual', d: 'Con el equivalente al mes y al año para comparar.' },
      biometric: { t: 'Bloqueo con huella o Face ID', d: 'Que nadie más vea en qué gastas.' },
      theme: { t: 'Modo claro y oscuro', d: 'Elige el que te guste en Ajustes.' },
      export: { t: 'Exporta tus datos', d: 'Un archivo con todo, cuando quieras.' },
      cancel: { t: 'Cancelar sin perder nada', d: 'Las canceladas quedan en el historial y se reactivan con un toque.' },
      noAccount: { t: 'Sin cuentas', d: 'Ni registro ni contraseña. La instalas y empiezas.' },
    },
  },
  screens: {
    eyebrow: 'Pantallas',
    title: 'Así se ve en tu teléfono',
    subtitle: 'Capturas reales de la app, con datos de ejemplo.',
    prev: 'Pantalla anterior',
    next: 'Pantalla siguiente',
    goTo: 'Ir a la pantalla',
    items: [
      { a: 'Tu mes y tu año,', b: 'de un vistazo.', alt: 'Inicio de Mensualy con el gasto mensual y anual' },
      { a: 'Te dice', b: 'qué sobra.', alt: 'Sugerencias de ahorro de Mensualy' },
      { a: 'Cada detalle,', b: 'en un toque.', alt: 'Detalle de una suscripción en Mensualy' },
      { a: 'Agregar toma', b: 'segundos.', alt: 'Formulario de nueva suscripción de Mensualy' },
      { a: 'Cobro', b: 'por cobro.', alt: 'Calendario de cobros de Mensualy' },
      { a: 'Todas,', b: 'en orden.', alt: 'Lista de suscripciones de Mensualy' },
    ],
  },
  privacy: {
    title: 'Tus suscripciones',
    titleB: 'son solo tuyas.',
    subtitle: 'Mensualy no tiene servidores que guarden tus datos. Lo que anotas se queda en tu teléfono.',
    free: {
      name: 'Gratis',
      price: '$0',
      per: 'Sin anuncios y sin trucos',
      items: ['Suscripciones ilimitadas', 'Recordatorios antes de cada cobro', 'Sugerencias de ahorro', 'Calendario y análisis de gasto', 'Gasto compartido'],
    },
    data: {
      name: 'Tus datos',
      tag: 'local-first',
      items: {
        local: { t: 'En tu teléfono', d: 'Una base de datos local (SQLite), no una nube.' },
        noAccount: { t: 'Sin cuenta', d: 'No pedimos correo, nombre real ni contraseña.' },
        noPayments: { t: 'Nunca toca tus pagos', d: 'No se conecta a tu banco ni a tus tarjetas: tú decides qué anotar.' },
        notifications: { t: 'Avisos locales', d: 'Los recordatorios los programa tu propio teléfono.' },
        export: { t: 'Tú tienes la llave', d: 'Exporta todo en un archivo cuando quieras.' },
      },
    },
  },
  cta: {
    titleA: 'Tu próximo cobro',
    titleB: 'ya no te va a sorprender.',
    note: 'Te escribimos una sola vez, cuando esté en Google Play.',
  },
  footer: {
    privacy: 'Política de privacidad',
    support: 'Soporte',
    rights: '© 2026 Mensualy',
    madeBy: 'Hecho por',
  },
};

export type Dictionary = typeof es;
