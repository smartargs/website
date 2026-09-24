/**
 * Company and legal details used across the site. Projects live in src/content/projects.
 *
 * Values starting with "TODO" render on the live site as they are; the build
 * prints a warning while any are left.
 */

export const site = {
  name: 'smartargs',
  url: 'https://smartargs.com',
  title: 'smartargs · Game development and software products',
  description:
    'Useful software, built to last. Browse the smartargs catalog: Vantage, ready-made gameplay systems for Unity 6, and SignArgs, PDF signing on the device.',
  /** Public contact address, shown on the contact page, in the footer and in the Impressum. */
  email: 'contact@smartargs.com',
  nav: [
    { label: 'Catalog', href: '/#catalog' },
    { label: 'Contact', href: '/contact' },
  ],
  /** Cloudflare Web Analytics token. While null, no analytics script loads. */
  analyticsToken: null as string | null,
  /**
   * Turnstile site key (public). Set PUBLIC_TURNSTILE_SITE_KEY in the build environment.
   * The fallback is Cloudflare's always-pass test key, for local development.
   */
  turnstileSiteKey: (import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined) || '1x00000000000000000000AA',
};

/** Impressum and privacy policy details. Optional fields are hidden while null. */
export const legal = {
  /** Your full legal name, or the registered company name. */
  name: 'TODO Full name',
  /** Trading name, if it differs from the legal name. */
  businessName: 'smartargs' as string | null,
  street: 'TODO Street and number',
  postalCode: 'TODO',
  city: 'TODO City',
  country: 'Germany',
  email: site.email,
  phone: null as string | null,
  /** Umsatzsteuer-Identifikationsnummer (USt-IdNr.), if you have one. */
  vatId: null as string | null,
  /** Commercial register entry, if any, e.g. { court: 'Amtsgericht München', number: 'HRB 123456' }. */
  register: null as { court: string; number: string } | null,
  /** The provider hosting the inbox that contact form mail is delivered to. Named in the privacy policy. */
  mailboxProvider: 'TODO Your email provider, e.g. Google Workspace',
  /** Date the privacy policy last changed. */
  privacyUpdated: '2026-09-10',
};

if (import.meta.env.PROD) {
  const placeholders = new Set(
    [...Object.entries(site), ...Object.entries(legal)]
      .filter(([, value]) => typeof value === 'string' && value.startsWith('TODO'))
      .map(([key]) => key),
  );
  if (placeholders.size > 0) {
    console.warn(`[site] Placeholder values left in src/config/site.ts: ${[...placeholders].join(', ')}`);
  }
}
