import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Catalog entries. One Markdown or MDX file per project in src/content/projects. */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** One line, shown on the card and under the title. */
    tagline: z.string(),
    /** Meta description for search engines and link previews. */
    description: z.string(),
    /** Free-form label such as "Unity package" or "Web app". The catalog filters by it. */
    category: z.string(),
    /** Lowercase keywords such as "unity"; shown as #tags and used as search keywords. */
    tags: z.array(z.string()).default([]),
    status: z.enum(['available', 'in-development', 'coming-soon', 'archived']),
    year: z.number().int(),
    version: z.string().optional(),
    /** Shown like a price tag, e.g. "Free", "€49" or "On request". Omit to hide. */
    price: z.string().optional(),
    /** Featured entries take two columns in the catalog grid. */
    featured: z.boolean().default(false),
    /** Lower comes first. */
    order: z.number().default(100),
    /** Drafts only appear in `npm run dev`. */
    draft: z.boolean().default(false),
    /** Generated cover art: a line pattern on a solid color, with a short glyph. */
    cover: z.object({
      pattern: z.enum(['rings', 'grid', 'stripes', 'dots', 'waves', 'blocks']),
      color: z.string(),
      glyph: z.string().max(4),
    }),
    /** Key facts in the spec strip on the project page. */
    specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    /** Buttons in the project page's buy box. The first one is the primary action; without links it offers an enquiry. */
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
  }),
});

/**
 * Product documentation: plain Markdown copied unchanged into src/content/docs/<project-id>/.
 * Ids keep the file path ("vantage-dev/modules/movement"); index files map to their folder.
 */
const docs = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/docs',
    generateId: ({ entry }) => entry.replace(/\.md$/, '').replace(/\/index$/, ''),
  }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { projects, docs };
