# smartargs.com

Company website for smartargs: a catalog of projects (currently vantage-dev), a product page per project, a contact form, Impressum and privacy policy.

## Stack

- **Astro 7**, fully static. Pages ship as plain HTML; the only JavaScript is the theme toggle, the mobile menu and the contact form. The catalog filter is CSS only.
- **Tailwind CSS 4 + shadcn/ui** (Nova style). The React components in `src/components/ui` are used for their class variants (`buttonVariants`). Render shadcn components in `.astro` files without a `client:*` directive and they still ship zero JS.
- **Content collections + MDX** for catalog entries.
- **Cloudflare Workers**. `dist/` is served as static assets. `worker/index.ts` only handles `POST /api/contact`: it checks Turnstile and emails the message through Cloudflare Email Routing.
- Fonts (Geist, Geist Mono) are downloaded at build time and served from the site's own domain.

## Commands

| Command                          | What it does                                                                                 |
| :------------------------------- | :------------------------------------------------------------------------------------------- |
| `npm run dev`                    | Astro dev server at `localhost:4321`, drafts included (the contact form has no backend here) |
| `npm run new -- <id> "<Title>"`  | Create a catalog entry from the product template                                             |
| `npm run preview`                | Production build served by Wrangler at `localhost:8787`, contact form included               |
| `npm run build`                  | Static build to `dist/`                                                                      |
| `npm run deploy`                 | Build and deploy with Wrangler                                                               |
| `npm run check`                  | Type-check the Astro pages and the Worker                                                    |
| `npm run types`                  | Regenerate `worker/worker-configuration.d.ts` after changing `wrangler.jsonc`                |

To try the contact form locally, copy `.dev.vars.example` to `.dev.vars` (Cloudflare's always-pass Turnstile test keys) and run `npm run preview`. Wrangler simulates the email binding and does not send real mail.

## Adding a product to the catalog

```sh
npm run new -- my-product "My Product"
```

This copies `templates/product.mdx` to `src/content/projects/my-product.mdx`. The id becomes the URL (`/projects/my-product`) and the contact form topic. The new entry:

- starts as a draft, visible only in `npm run dev`;
- has every field commented: category, tags, status, price, cover pattern and color, key facts and buttons;
- comes with the standard product overview sections (How it works, Features, Documentation).

The product page is an overview: what it is, why it helps and what it can do. Setup steps, code, configuration and FAQs belong in the product's documentation (see below), not on the product page.

Fill it in, then delete `draft: true` to publish. The full schema is in `src/content.config.ts`, and `vantage-dev.mdx` is a complete example.

Every project page uses the same layout (`src/pages/projects/[slug].astro`). Inside an entry, every `##` heading becomes a numbered section and an "On this page" link. `<Features>` and `<Steps>` turn a Markdown list into a grid.

The `sample-*.md` entries are drafts that demonstrate the layout; delete them when real projects arrive. A build with `PUBLIC_SHOW_DRAFTS=true` includes drafts too.

## Product documentation

Docs live in `src/content/docs/<project-id>/` as plain Markdown, copied unchanged from the product's repository. They're published at `/projects/<project-id>/docs/…`, and the product page gets a Documentation button automatically.

- `toc.yml` (DocFX format) sets the sidebar order. Without one, pages are listed by path.
- Relative links such as `modules/movement.md#setup` are rewritten to site URLs at build time (`rewriteDocLinks` in `src/lib/docs.ts`).
- ` ```mermaid ` blocks render as diagrams. The Mermaid library loads only on pages that contain one.
- Page titles come from the first `# Heading`; optional front matter `title` and `description` override it.

Where each product's docs come from (repository, branch, folder) is set in `scripts/docs-sources.json`. After pushing doc changes in the product repository:

```sh
npm run docs:sync                    # every product, or: npm run docs:sync -- vantage-dev
git add src/content/docs && git commit -m "docs: sync vantage-dev docs"
```

- **Download:** the script fetches only the docs folder from GitHub over SSH (a few hundred KB, even for a large Unity repository) and replaces the local copy. Files deleted at the source disappear here too.
- **Commit:** the synced copy is committed to this repository, so Cloudflare builds never need access to the private product repositories.
- **Preview unpushed docs:** `npm run docs:sync -- vantage-dev --from "/path/to/Documentation~"` copies from a local folder instead.

## Other content

- `src/config/site.ts`: public email, navigation, Impressum details, analytics token. The build warns while `TODO` values are left.
- `public/og.png` (1200×630) is the social preview image.

## Deploying from GitHub

1. Push the repository to GitHub.
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Import a repository**. Build command `npm run build`, deploy command `npx wrangler deploy`. The Worker name must match `name` in `wrangler.jsonc` (`smartargs-website`).
3. **Turnstile:** create a widget for `smartargs.com`.
   - Add the site key as the build variable `PUBLIC_TURNSTILE_SITE_KEY`.
   - Add the secret key as the Worker secret `TURNSTILE_SECRET_KEY` (Worker → Settings → Variables and Secrets).
4. **Email Routing:** enable it for `smartargs.com`, add your inbox as a destination address and verify it, then set `CONTACT_TO` in `wrangler.jsonc` to that address.
5. **Domain:** uncomment `routes` in `wrangler.jsonc`, or add the domain under the Worker's Settings → Domains & Routes.
6. Optional: enable Cloudflare Web Analytics and put the token into `analyticsToken` in `src/config/site.ts`. The privacy policy picks it up automatically.

Every push to the main branch then builds and deploys.

## Before launch

- Replace every `TODO` in `src/config/site.ts`.
- Have the Impressum and privacy policy checked. They are a starting point, not legal advice.
