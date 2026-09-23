import { getCollection, type CollectionEntry } from 'astro:content';
import { parse } from 'yaml';

export type DocEntry = CollectionEntry<'docs'>;

export interface DocLink {
  title: string;
  id: string;
  href: string;
  children: DocLink[];
}

interface TocItem {
  name: string;
  href?: string;
  items?: TocItem[];
}

/** DocFX-style toc.yml files that ship with the docs and set the sidebar order. */
const tocFiles = import.meta.glob<string>('/src/content/docs/*/toc.yml', { query: '?raw', import: 'default', eager: true });

/** Docs entries of one project, or of all projects. */
export async function getDocs(project?: string): Promise<DocEntry[]> {
  const entries = await getCollection('docs');
  return project ? entries.filter((entry) => entry.id === project || entry.id.startsWith(`${project}/`)) : entries;
}

/** Site URL of a docs entry id, e.g. "vantage-dev/modules/movement" → "/projects/vantage-dev/docs/modules/movement". */
export function docHref(id: string): string {
  const [project, ...page] = id.split('/');
  return `/projects/${project}/docs${page.length > 0 ? `/${page.join('/')}` : ''}`;
}

/** Title from front matter, else the first "# Heading" in the Markdown. */
export function docTitle(entry: DocEntry): string {
  return entry.data.title ?? /^#\s+(.+)$/m.exec(entry.body ?? '')?.[1]?.trim() ?? entry.id.split('/').at(-1) ?? entry.id;
}

/** Sidebar tree in toc.yml order. Without a toc.yml, pages are listed by path with the index first. */
export async function getDocsNav(project: string): Promise<DocLink[]> {
  const entries = await getDocs(project);
  const ids = new Set(entries.map((entry) => entry.id));
  const toc = tocFiles[`/src/content/docs/${project}/toc.yml`];

  if (!toc) {
    return entries
      .toSorted((a, b) => Number(b.id === project) - Number(a.id === project) || a.id.localeCompare(b.id))
      .map((entry) => ({ title: docTitle(entry), id: entry.id, href: docHref(entry.id), children: [] }));
  }

  const toLinks = (items: TocItem[]): DocLink[] =>
    items.flatMap((item) => {
      const children = toLinks(item.items ?? []);
      const id = item.href && `${project}/${item.href.replace(/\.md$/, '')}`.replace(/\/index$/, '');
      if (!id || !ids.has(id)) return children;
      return [{ title: item.name, id, href: docHref(id), children }];
    });

  return toLinks(parse(toc) as TocItem[]);
}

/** Depth-first list of every page in the sidebar, for previous/next links. */
export function flattenNav(links: DocLink[]): DocLink[] {
  return links.flatMap((link) => [link, ...flattenNav(link.children)]);
}

/** The first prose paragraph of a Markdown body as plain text, for meta descriptions. */
export function summarize(body = '', maxLength = 160): string {
  const paragraph =
    body
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find((block) => block && !/^(#|\||```|[-*] |\d+\. |>|<)/.test(block)) ?? '';
  const text = paragraph
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}
