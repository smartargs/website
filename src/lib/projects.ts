import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type ProjectStatus = Project['data']['status'];
export type CoverPattern = Project['data']['cover']['pattern'];

/** Drafts are listed in `astro dev`, or in a build with PUBLIC_SHOW_DRAFTS=true. */
const showDrafts = import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_DRAFTS === 'true';

const warnedLinks = new Set<string>();

/** Visible projects in catalog order. */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('projects', ({ data }) => showDrafts || !data.draft);
  if (import.meta.env.PROD) warnAboutPlaceholderLinks(projects);
  return projects.sort((a, b) => a.data.order - b.data.order || b.data.year - a.data.year);
}

function warnAboutPlaceholderLinks(projects: Project[]) {
  for (const { id, data } of projects) {
    for (const link of data.links) {
      const key = `${id} ${link.href}`;
      if (link.href.includes('TODO') && !warnedLinks.has(key)) {
        warnedLinks.add(key);
        console.warn(`[catalog] Placeholder link in ${id}: "${link.label}" → ${link.href}`);
      }
    }
  }
}

export const statusLabels: Record<ProjectStatus, string> = {
  available: 'Available',
  'in-development': 'In development',
  'coming-soon': 'Coming soon',
  archived: 'Archived',
};

/** Catalog number like "No. 01" for a zero-based position. */
export function catalogNumber(index: number): string {
  return `No. ${String(index + 1).padStart(2, '0')}`;
}

/** Whether a project names Unity on its card or page; such pages carry Unity's trademark notice. */
export function mentionsUnity(project: Project): boolean {
  return /\bunity\b/i.test(`${JSON.stringify(project.data)} ${project.body ?? ''}`);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
