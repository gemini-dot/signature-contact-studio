/** Appends the current site language (?lang=) so auth e-mails are sent in that language. */
export function withLang(url: string): string {
  const lang = (typeof localStorage !== "undefined" && localStorage.getItem("lang")) || "fr";
  const u = new URL(url, window.location.origin);
  u.searchParams.set("lang", lang);
  return u.toString();
}
