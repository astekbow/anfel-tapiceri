export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replaceAll("ë", "e")
    .replaceAll("ç", "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Kthen një slug unik duke i shtuar -2, -3... nëse baza është e zënë. */
export async function uniqueSlug(
  base: string,
  taken: (slug: string) => Promise<boolean>
): Promise<string> {
  const root = slugify(base) || "artikull";
  let candidate = root;
  let i = 2;
  while (await taken(candidate)) {
    candidate = `${root}-${i}`;
    i += 1;
  }
  return candidate;
}
