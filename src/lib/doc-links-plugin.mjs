/**
 * Rewrites relative Markdown links in the mirrored product docs, such as `modules/movement.md#setup`,
 * to site URLs like `/projects/vantage-dev/docs/modules/movement#setup`. Docs can then be copied in unchanged.
 *
 * A Sätteri hast plugin (see `markdown.processor` in astro.config.mjs), so it runs while the Markdown
 * is compiled. The docs pages can then be rendered with `<Content />`: rewriting `entry.rendered.html`
 * afterwards means injecting it with `set:html`, which leaves Astro's image placeholders unresolved
 * and every screenshot without a `src`.
 */
export function docLinksPlugin({ fileURL }) {
  const path = fileURL?.pathname ?? '';
  const source = path.split('/src/content/docs/')[1];
  // Only the copied product docs use relative .md links; the plugin sits out every other document.
  if (!source) return null;

  const directory = decodeURIComponent(source).split('/').slice(0, -1);

  return {
    name: 'doc-links',
    element: {
      filter: ['a'],
      visit(node, ctx) {
        const href = node.properties?.href;
        if (typeof href !== 'string') return;

        const index = href.indexOf('#');
        const target = index < 0 ? href : href.slice(0, index);
        const hash = index < 0 ? '' : href.slice(index);
        // Relative links to a Markdown file only: no protocol, no query string.
        if (!/^[^:?]+\.md$/.test(target)) return;

        const parts = [...directory];
        for (const segment of target.split('/')) {
          if (segment === '..') parts.pop();
          else if (segment && segment !== '.') parts.push(segment);
        }
        // Links that leave the project's docs folder are left alone.
        if (parts.length < 2 || parts[0] !== directory[0]) return;

        const [project, ...page] = parts.join('/').replace(/\.md$/, '').replace(/\/index$/, '').split('/');
        ctx.setProperty(node, 'href', `/projects/${project}/docs${page.length > 0 ? `/${page.join('/')}` : ''}${hash}`);
      },
    },
  };
}
