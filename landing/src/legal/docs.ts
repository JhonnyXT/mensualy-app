// Política de privacidad de Mensualy, en el mismo formato tipado que usan las
// landings de Meld y MyWallet para su `LegalPage`. Tiene que reflejar el
// producto ACTUAL: hoy la app no tiene cuentas, no hace ninguna llamada de red
// (sin analíticas, sin API de tasas de cambio) y todo vive en SQLite local. Si
// eso cambia (nube, cuentas, un SDK nuevo con red, permisos nuevos), actualizar
// esta política antes de publicar el cambio.

import type { Locale } from '@/i18n/config';

export type LegalSection = { h: string; p?: string[]; list?: string[]; cta?: { label: string; href: string } };
export type LegalDoc = { title: string; updated: string; intro: string[]; sections: LegalSection[] };

const CONTACT = 'hello@joblanstudio.com';

const privacyEs: LegalDoc = {
  title: 'Política de privacidad',
  updated: 'Última actualización: noviembre de 2026',
  intro: [
    'Mensualy es una app para llevar el control de tus suscripciones. Funciona completa en tu teléfono: no tiene cuentas, no tiene servidores propios y no envía tus datos a ninguna parte. Esta política explica qué guarda la app, para qué pide cada permiso y qué pasa con tus datos si te unes a la lista de espera.',
  ],
  sections: [
    {
      h: '1. Lo que guardas en la app',
      p: [
        'Las suscripciones que agregas (nombre, servicio, monto, moneda, categoría, ciclo y fecha de cobro, si la compartes, el nombre de esa persona y el porcentaje de cada uno, y cuándo la marcaste como usada), el historial de precios de cada una, tus recordatorios y tus preferencias (moneda principal, tema, bloqueo, tu nombre y tu foto de perfil, si los pones) se guardan en una base de datos local (SQLite) dentro de tu dispositivo.',
        'Mensualy nunca se conecta a tu banco ni a tus tarjetas, no procesa pagos y no guarda números de cuenta ni de tarjeta. Tú decides qué anotar.',
      ],
    },
    {
      h: '2. Nada sale de tu teléfono',
      list: [
        'La app no tiene cuentas: no pedimos correo, contraseña ni nombre real.',
        'La app no hace llamadas a internet: ni analíticas, ni publicidad, ni servicios de terceros que reciban tus datos. Las tasas de cambio entre COP, USD y EUR vienen incluidas en la app.',
        'Nadie, ni siquiera quien desarrolla Mensualy, puede ver lo que anotas.',
      ],
    },
    {
      h: '3. Permisos que pide la app y para qué',
      list: [
        'Notificaciones: para avisarte antes de cada cobro. Los recordatorios los programa tu propio teléfono; no pasan por ningún servidor.',
        'Fotos (opcional): solo si eliges una foto de perfil. La imagen se copia a la carpeta privada de la app y no se sube a ninguna parte.',
        'Huella o Face ID (opcional): solo si activas el bloqueo de la app. La verificación la hace el sistema operativo; Mensualy nunca recibe ni guarda tus datos biométricos.',
      ],
    },
    {
      h: '4. Exportar y borrar tus datos',
      list: [
        'Desde Ajustes puedes exportar todo a un archivo. Se abre el menú de compartir de tu teléfono y tú eliges dónde guardarlo o a quién enviarlo.',
        'Como todo vive en tu dispositivo, para borrar tus datos basta con desinstalar la app o borrar sus datos desde los ajustes del sistema. No hay copias en otro lugar.',
      ],
    },
    {
      h: '5. Este sitio web y la lista de espera',
      p: [
        'El formulario de la lista de espera está en joblanstudio.com, la web de quien desarrolla Mensualy, que tiene su propia política de privacidad (joblanstudio.com/es/privacidad). Ahí guardamos tu email y el nombre que escribas para avisarte cuando Mensualy esté disponible, con un proveedor de envío de correos que actúa en nuestro nombre: Resend (resend.com). La ciudad, la plataforma y la nota opcional solo quedan en los registros del servidor (Vercel), para saber qué te interesa.',
        `No usamos esos datos para nada más, y puedes pedir que los borremos en cualquier momento escribiendo a ${CONTACT}. Este sitio y ese formulario no usan cookies de rastreo ni analíticas.`,
      ],
    },
    {
      h: '6. Menores de edad',
      p: ['Mensualy no está dirigida a menores de 13 años y no recopila datos de nadie, menores incluidos.'],
    },
    {
      h: '7. Cambios a esta política',
      p: ['Si Mensualy empieza a guardar o enviar datos de otra forma (por ejemplo, un respaldo en la nube opcional), actualizaremos esta política antes de que ese cambio llegue a la app, y la fecha de arriba lo reflejará.'],
    },
    {
      h: '8. Contacto',
      p: [`Cualquier duda sobre privacidad: ${CONTACT}.`],
    },
  ],
};

const privacyEn: LegalDoc = {
  title: 'Privacy Policy',
  updated: 'Last updated: November 2026',
  intro: [
    'Mensualy is an app to keep track of your subscriptions. It works fully on your phone: it has no accounts, no servers of its own and sends your data nowhere. This policy explains what the app stores, why it asks for each permission and what happens to your data if you join the waitlist.',
  ],
  sections: [
    {
      h: '1. What you store in the app',
      p: [
        'The subscriptions you add (name, service, amount, currency, category, billing cycle and date, whether you share it, that person’s name and each share, and when you marked it as used), each one’s price history, your reminders and your preferences (main currency, theme, lock, your name and profile photo, if you set them) are stored in a local database (SQLite) on your device.',
        'Mensualy never connects to your bank or cards, does not process payments and never stores account or card numbers. You decide what to add.',
      ],
    },
    {
      h: '2. Nothing leaves your phone',
      list: [
        'The app has no accounts: we don’t ask for an email, password or real name.',
        'The app makes no internet calls: no analytics, no ads, no third-party services receiving your data. Exchange rates between COP, USD and EUR ship with the app.',
        'Nobody, not even Mensualy’s developer, can see what you add.',
      ],
    },
    {
      h: '3. Permissions the app asks for and why',
      list: [
        'Notifications: to remind you before each charge. Reminders are scheduled by your own phone; they never go through a server.',
        'Photos (optional): only if you pick a profile photo. The image is copied to the app’s private folder and is not uploaded anywhere.',
        'Fingerprint or Face ID (optional): only if you turn on the app lock. The operating system does the check; Mensualy never receives or stores your biometric data.',
      ],
    },
    {
      h: '4. Exporting and deleting your data',
      list: [
        'From Settings you can export everything to a file. Your phone’s share menu opens and you choose where to save it or who to send it to.',
        'Since everything lives on your device, deleting your data is as simple as uninstalling the app or clearing its data in system settings. There are no copies anywhere else.',
      ],
    },
    {
      h: '5. This website and the waitlist',
      p: [
        'The waitlist form lives on joblanstudio.com, the website of Mensualy’s developer, which has its own privacy policy (joblanstudio.com/en/privacy). There we store your email and the name you enter to let you know when Mensualy is available, with an email provider acting on our behalf: Resend (resend.com). City, platform and the optional note only stay in the server logs (Vercel), to know what you are interested in.',
        `We use that data for nothing else, and you can ask us to delete it at any time by writing to ${CONTACT}. This site and that form use no tracking cookies or analytics.`,
      ],
    },
    {
      h: '6. Children',
      p: ['Mensualy is not directed at children under 13 and collects no data from anyone, children included.'],
    },
    {
      h: '7. Changes to this policy',
      p: ['If Mensualy starts storing or sending data differently (for example, an optional cloud backup), we will update this policy before that change reaches the app, and the date above will reflect it.'],
    },
    {
      h: '8. Contact',
      p: [`Any privacy question: ${CONTACT}.`],
    },
  ],
};

export const legalDocs: { privacy: Record<Locale, LegalDoc> } = {
  privacy: { es: privacyEs, en: privacyEn },
};
