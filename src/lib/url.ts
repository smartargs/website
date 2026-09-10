/**
 * The public path of a page. With `build.format: 'file'` the build reports `/vantage.html`
 * and `/index.html`, while the site serves `/vantage` and `/`.
 */
export function publicPath(url: URL): string {
  return url.pathname.replace(/(?:\/index)?\.html$/, '') || '/';
}
