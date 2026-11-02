import { test, expect } from "@playwright/test";
async function square(page: import("@playwright/test").Page, s: string) {
  await page.locator(`[data-square="${s}"]`).click();
}
test("lezione completa, errori, navigazione, IndexedDB e ripasso", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Le grandi partite/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Inizia la prima lezione/ }).click();
  await page.getByRole("button", { name: "Continua" }).click();
  await expect(page.getByRole("button", { name: "Continua" })).toBeDisabled();
  await page.getByRole("button", { name: "Mostra la mossa 1" }).click();
  await page.getByRole("button", { name: "Mostra la mossa 2" }).click();
  await page.getByRole("button", { name: "Continua" }).click();
  await square(page, "e2");
  await square(page, "e4");
  await expect(
    page.getByText("La mossa è legale, ma", { exact: false }),
  ).toBeVisible();
  await square(page, "d2");
  await square(page, "d4");
  await expect(page.getByRole("button", { name: "Continua" })).toBeEnabled();
  await page.getByRole("button", { name: "Continua" }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Una coordinata, una casa" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Indietro" }).click();
  await expect(page.getByRole("button", { name: "Continua" })).toBeEnabled();
  await page.getByRole("button", { name: "Continua" }).click();
  await page.getByRole("button", { name: /La traversa/ }).click();
  await expect(page.getByRole("button", { name: "Continua" })).toBeDisabled();
  await page.getByRole("button", { name: /La colonna/ }).click();
  await page.getByRole("button", { name: "Continua" }).click();
  await page.getByRole("button", { name: "Concludi" }).click();
  await expect(
    page.getByRole("heading", { name: "Ben giocato!" }),
  ).toBeVisible();
  await expect(page.getByText("2", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Vai al ripasso" }).click();
  await expect(page.getByText("Ora tocca a te · 1 errori")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Riprova la lezione" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/review-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Riprova la lezione" }).click();
  await page.getByRole("button", { name: /^Continua/ }).click();
  await page.getByRole("button", { name: "Esci dalla lezione" }).click();
  await page.getByRole("button", { name: "⌂ Home", exact: true }).click();
  await page.getByRole("button", { name: "Continua il percorso" }).click();
  await expect(
    page.getByRole("heading", { name: "Apriamo il centro" }),
  ).toBeVisible();
});
test("layout 360–430 e desktop, PWA e offline reale", async ({
  page,
  context,
}) => {
  await page.goto("/");
  for (const width of [360, 390, 430, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByRole("heading", { name: /Le grandi partite/ }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
  }
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Le grandi partite/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Inizia la prima lezione/ }).click();
  await expect(
    page.getByRole("heading", { name: "64 case. Infinite possibilità." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continua" }).click();
  await page.getByRole("button", { name: "Mostra la mossa 1" }).click();
  await page.screenshot({
    path: "test-results/lesson-offline.png",
    fullPage: true,
  });
});

test("tutta la prima unità si sblocca e si completa con attività reali", async ({
  page,
}) => {
  const { lessons } = await import("../../src/content/unit");
  await page.goto("/");
  await page.getByRole("button", { name: /Inizia la prima lezione/ }).click();
  for (let li = 0; li < lessons.length; li++) {
    const lesson = lessons[li];
    for (const b of lesson.blocks) {
      await expect(
        page.getByRole("heading", { name: b.title, exact: true }),
      ).toBeVisible();
      if ("activity" in b) {
        if (b.type === "guided_move") {
          for (let i = 0; i < b.activity.moves.length; i++)
            await page
              .getByRole("button", { name: `Mostra la mossa ${i + 1}` })
              .click();
        } else {
          for (const alternatives of b.activity.moves) {
            const u = alternatives[0];
            await page.locator(`[data-square="${u.slice(0, 2)}"]`).tap();
            await page.locator(`[data-square="${u.slice(2, 4)}"]`).tap();
          }
        }
      } else if (b.type === "multiple_choice")
        await page
          .getByRole("button", { name: new RegExp(b.choices[b.answer]) })
          .click();
      await page
        .getByRole("button", {
          name: b.type === "summary" ? /^Concludi/ : /^Continua/,
          exact: false,
        })
        .click();
    }
    await expect(
      page.getByRole("heading", { name: "Ben giocato!" }),
    ).toBeVisible();
    if (li < lessons.length - 1)
      await page.getByRole("button", { name: "La prossima lezione" }).click();
  }
  await page.getByRole("button", { name: "Torna al percorso" }).click();
  await expect(page.getByText("4/4", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("4/4", { exact: true })).toBeVisible();
});
