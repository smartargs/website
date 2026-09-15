import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage, Mailbox } from 'mimetext/browser';

/** Topics are "other" or a catalog entry's id such as "vantage-dev". */
const TOPIC_PATTERN = /^[a-z0-9-]{1,60}$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Submission {
  name: string;
  email: string;
  company: string;
  topic: string;
  message: string;
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/contact') {
      if (request.method !== 'POST') {
        return reply(405, 'Method not allowed.', { Allow: 'POST' });
      }
      return handleContact(request, env);
    }

    // wrangler.jsonc only routes /api/* here; anything else falls through to the static site.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function handleContact(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) {
    return reply(403, 'Invalid origin.');
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(400, 'Invalid form data.');
  }

  const field = (name: string) => String(form.get(name) ?? '').trim();

  // Honeypot field, invisible to people. Report success so bots don't retry.
  if (field('website')) {
    return reply(200);
  }

  const topic = field('topic');
  const submission: Submission = {
    name: field('name').replace(/\s+/g, ' '),
    email: field('email'),
    company: field('company').replace(/\s+/g, ' '),
    topic: TOPIC_PATTERN.test(topic) ? topic : 'other',
    message: field('message'),
  };

  const problem = validate(submission);
  if (problem) {
    return reply(400, problem);
  }

  if (!(await passesTurnstile(field('cf-turnstile-response'), request.headers.get('CF-Connecting-IP'), env))) {
    return reply(400, 'The spam check failed. Please try again.');
  }

  try {
    await sendEmail(submission, env);
  } catch (error) {
    console.error('Sending the contact email failed', error);
    return reply(502, 'Your message could not be sent. Please email us instead.');
  }

  return reply(200);
}

function validate({ name, email, company, message }: Submission): string | null {
  if (!name || name.length > 100) return 'Please enter your name (up to 100 characters).';
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return 'Please enter a valid email address.';
  if (company.length > 100) return 'Please shorten the company name to 100 characters.';
  if (message.length < 10 || message.length > 5000) return 'Please write a message between 10 and 5,000 characters.';
  return null;
}

async function passesTurnstile(token: string, ip: string | null, env: Env): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY is not set');
    return false;
  }
  if (!token) return false;

  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET_KEY);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  if (!response.ok) return false;

  const outcome = await response.json<{ success: boolean }>();
  return outcome.success === true;
}

async function sendEmail({ name, email, company, topic, message }: Submission, env: Env): Promise<void> {
  const details = [`Name: ${name}`, `Email: ${email}`, ...(company ? [`Company: ${company}`] : []), `Regarding: ${topic}`];

  const mime = createMimeMessage();
  mime.setSender({ name: 'smartargs website', addr: env.CONTACT_FROM });
  mime.setRecipient(env.CONTACT_TO);
  mime.setHeader('Reply-To', new Mailbox(email));
  mime.setSubject(`[${topic}] ${name}${company ? ` (${company})` : ''}`);
  mime.addMessage({ contentType: 'text/plain', data: `${details.join('\n')}\n\n${message}` });

  await env.CONTACT_EMAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, mime.asRaw()));
}

function reply(status: number, error?: string, headers: Record<string, string> = {}): Response {
  return Response.json(error ? { ok: false, error } : { ok: true }, {
    status,
    headers: { 'Cache-Control': 'no-store', ...headers },
  });
}
