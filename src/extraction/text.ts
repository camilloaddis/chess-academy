import type { Pdf } from "../documents/pdf";
export async function extractPage(pdf: Pdf, number: number) {
  const page = await pdf.getPage(number);
  const content = await page.getTextContent();
  const items = content.items.filter(
    (i): i is Extract<typeof i, { str: string }> => "str" in i,
  );
  const lines: string[] = [];
  let current = "";
  let y: number | undefined;
  let disorder = false;
  let lastY = Infinity;
  for (const item of items) {
    const iy = item.transform[5];
    if (iy > lastY + 12) disorder = true;
    lastY = iy;
    if (y !== undefined && Math.abs(iy - y) > 3) {
      lines.push(current);
      current = "";
    }
    current += (current && !current.endsWith(" ") ? " " : "") + item.str;
    y = iy;
    if (item.hasEOL) {
      lines.push(current);
      current = "";
      y = undefined;
    }
  }
  if (current) lines.push(current);
  return { lines, uncertain: disorder || lines.join("").length < 40 };
}
export async function outline(
  pdf: Pdf,
): Promise<{ title: string; page: number; depth: number }[]> {
  const result: { title: string; page: number; depth: number }[] = [];
  async function walk(
    nodes: NonNullable<Awaited<ReturnType<Pdf["getOutline"]>>>,
    depth: number,
  ) {
    for (const n of nodes) {
      try {
        const dest =
          typeof n.dest === "string"
            ? await pdf.getDestination(n.dest)
            : n.dest;
        if (dest) {
          const p =
            typeof dest[0] === "number"
              ? dest[0]
              : await pdf.getPageIndex(dest[0]);
          result.push({ title: n.title, page: p + 1, depth });
        }
      } catch {
        /* Unresolvable PDF destination: keep page navigation available. */
      }
      if (n.items?.length) await walk(n.items, depth + 1);
    }
  }
  await walk((await pdf.getOutline()) ?? [], 0);
  return result;
}
