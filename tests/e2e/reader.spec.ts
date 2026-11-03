import { test, expect } from "@playwright/test";
function fixture() {
  const texts = [
    "First original test page. Reading stays private.",
    "Second original test page. No external service.",
  ];
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R /Outlines 8 0 R >>",
    "<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>",
    ...[6, 7].map(
      (n) =>
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 600] /Resources << /Font << /F1 5 0 R >> >> /Contents ${n} 0 R >>`,
    ),
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ...texts.map((t) => {
      const s = `BT /F1 16 Tf 30 540 Td (${t}) Tj ET`;
      return `<< /Length ${s.length} >>\nstream\n${s}\nendstream`;
    }),
    "<< /Type /Outlines /First 9 0 R /Last 9 0 R /Count 1 >>",
    "<< /Title (Test section) /Parent 8 0 R /Dest [4 0 R /Fit] >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const start = Buffer.byteLength(pdf);
  pdf +=
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
    offsets
      .slice(1)
      .map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)
      .join("") +
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return Buffer.from(pdf);
}
test("local reader: import, index, line, exploration, offline, resume and deletion", async ({
  page,
  context,
}) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (!/^(http:\/\/127.0.0.1:4173|data:|blob:)/.test(r.url()))
      external.push(r.url());
    expect(["GET", "HEAD"]).toContain(r.method());
  });
  await page.goto("./");
  await page
    .getByLabel("Importa un PDF")
    .setInputFiles({
      name: "Original test.pdf",
      mimeType: "application/pdf",
      buffer: fixture(),
    });
  await expect(page.getByLabel("Pagina PDF", { exact: true })).toHaveValue("1");
  await expect(page.locator(".pdf-page canvas")).toBeVisible();
  await expect(page.locator(".textLayer")).toContainText("First original");
  await page.getByText("Indice e segnalibri", { exact: true }).click();
  await page.getByRole("button", { name: "Test section · 2" }).click();
  await page.getByRole("button", { name: "Segnalibro", exact: true }).click();
  await page
    .getByText("Aggiungi una scacchiera a questa pagina", { exact: true })
    .click();
  await page.getByLabel("Titolo", { exact: true }).fill("My original line");
  await page
    .getByLabel("FEN", { exact: true })
    .fill("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  await page.getByLabel("Mosse SAN").fill("e2e4 e7e5");
  await page.getByLabel("Provenienza").selectOption("original");
  await page.getByRole("button", { name: "Salva annotazione locale" }).click();
  await page
    .getByText("My original line · da verificare", { exact: true })
    .click();
  await page.getByRole("button", { name: "Avanti", exact: true }).click();
  await expect(page.getByText(/Linea annotata: 1\/2/)).toBeVisible();
  await page.locator('[data-square="e7"]').click();
  await page.locator('[data-square="e5"]').click();
  await expect(page.getByText(/Esplorazione libera:/)).toBeVisible();
  await page.getByRole("button", { name: "Ripristina linea" }).click();
  await expect(page.getByText(/Linea annotata: 1\/2/)).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByLabel("Pagina PDF", { exact: true })).toHaveValue("2");
  await expect(page.locator(".pdf-page canvas")).toBeVisible();
  await page.getByLabel("Modalità").selectOption("text");
  await expect(page.locator(".reflow")).toContainText("Second original");
  await page.getByRole("button", { name: "← Libreria" }).click();
  await expect(
    page.getByRole("heading", { name: "Original test" }),
  ).toBeVisible();
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Rimuovi documento e dati" }).click();
  await expect(
    page.getByText("La biblioteca è vuota.", { exact: false }),
  ).toBeVisible();
  expect(external).toEqual([]);
});
test("invalid import and migration preserves old state", async ({ page }) => {
  await page.route("**/seed", (route) =>
    route.fulfill({ contentType: "text/html", body: "<html></html>" }),
  );
  await page.goto("http://127.0.0.1:4173/chess-academy/seed");
  await page.evaluate(async () => {
    const r = indexedDB.open("chess-academy", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("state");
    await new Promise<void>((resolve) => {
      r.onsuccess = () => {
        const db = r.result;
        const tx = db.transaction("state", "readwrite");
        tx.objectStore("state").put({ completed: { board: 1 } }, "progress");
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
      };
    });
  });
  await page.goto("./");
  await page
    .getByLabel("Importa un PDF")
    .setInputFiles({
      name: "bad.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("invalid"),
    });
  await expect(page.getByRole("status")).toContainText("Il file non è un PDF");
  const old = await page.evaluate(async () => {
    const r = indexedDB.open("chess-academy", 2);
    return new Promise((resolve) => {
      r.onsuccess = () => {
        const db = r.result;
        const q = db.transaction("state").objectStore("state").get("progress");
        q.onsuccess = () => {
          resolve(q.result);
          db.close();
        };
      };
    });
  });
  expect(old).toEqual({ completed: { board: 1 } });
});
