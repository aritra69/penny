/**
 * Whether a request is for an auth route, e.g. `isRoute(url, "/get-session")`.
 *
 * better-fetch hands hooks the URL as a `URL` object, and React Native's own `URL` only accepts
 * strings (`new URL(url)` throws on one), so this works on the text and never builds a `URL`.
 */
export function isRoute(url: string | URL, route: string): boolean {
  const [path] = String(url).split(/[?#]/, 1);
  return path.endsWith(route);
}
