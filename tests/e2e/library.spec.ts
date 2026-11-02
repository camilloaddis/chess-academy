import { test, expect } from '@playwright/test';
import { lessons } from '../../src/content/unit';

test('ogni lezione è accessibile senza prerequisiti anche dal link diretto', async ({ page }) => {
  await page.goto('./#path');
  for (const lesson of lessons) {
    await expect(page.getByRole('button').filter({ has: page.getByText(lesson.title, { exact: true }) })).toBeEnabled();
  }
  const last = lessons.at(-1)!;
  await page.getByRole('button').filter({ has: page.getByText(last.title, { exact: true }) }).click();
  await expect(page.getByRole('heading', { name: last.blocks[0].title, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: last.blocks[0].title, exact: true })).toBeVisible();
  await page.goto(`./#lesson/${lessons[2].id}`);
  await expect(page.getByRole('heading', { name: lessons[2].blocks[0].title, exact: true })).toBeVisible();
});

test('saltare passaggi non completa gli esercizi e il ripasso resta possibile', async ({ page }) => {
  await page.goto('./#lesson/promotion');
  await page.getByLabel('Scegli un passaggio').selectOption('2');
  await expect(page.getByRole('heading', { name: 'Scegli il cavallo', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Continua/ }).click();
  await page.getByLabel('Scegli un passaggio').selectOption('4');
  await page.getByRole('button', { name: /^Torna al percorso/ }).click();
  await expect(page.getByRole('heading', { name: 'Il tuo percorso.' })).toBeVisible();
  await page.goto('./#complete/promotion');
  await expect(page.getByRole('heading', { name: 'La lezione ti aspetta' })).toBeVisible();
  await page.getByRole('button', { name: 'Riprendi', exact: true }).click();
  await page.getByLabel('Scegli un passaggio').selectOption('2');
  await expect(page.getByRole('heading', { name: 'Scegli il cavallo', exact: true })).toBeVisible();
  await expect(page.locator('[data-square="a7"] [data-piece]')).toBeVisible();
});

test('anche il catalogo intermedio si apre offline', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  const lesson = lessons.at(-1)!;
  await page.goto(`./#lesson/${lesson.id}`);
  await page.reload();
  await expect(page.getByRole('heading', { name: lesson.blocks[0].title, exact: true })).toBeVisible();
  await page.getByLabel('Scegli un passaggio').selectOption('2');
  await expect(page.getByRole('heading', { name: lesson.blocks[2].title, exact: true })).toBeVisible();
});

test('i progressi della prima versione sopravvivono al nuovo catalogo', async ({ page }) => {
  await page.goto('./');
  const old = {
    schemaVersion: 1, contentVersion: 1, currentLesson: 'board',
    positions: { board: 4 }, completed: { board: 1 },
    results: { 'board@1/board-pawn': { attempts: 2, errors: 1, done: true, hints: 1 } },
    review: ['board@1/board-pawn'],
  };
  await page.evaluate(async progress => {
    const request = indexedDB.open('chess-academy', 1);
    const db = await new Promise<IDBDatabase>(resolve => { request.onsuccess = () => resolve(request.result); });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('state', 'readwrite');
      tx.objectStore('state').put(progress, 'progress');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, old);
  await page.goto('./#path');
  await page.reload();
  const first = page.getByRole('button').filter({ has: page.getByText(lessons[0].title, { exact: true }) });
  await first.click();
  await expect(page.getByRole('heading', { name: lessons[0].blocks[4].title, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Esci dalla lezione' }).click();
  const last = lessons.at(-1)!;
  await page.getByRole('button').filter({ has: page.getByText(last.title, { exact: true }) }).click();
  await page.getByLabel('Scegli un passaggio').selectOption('2');
  await expect.poll(() => page.evaluate(async () => {
    const request = indexedDB.open('chess-academy', 1);
    const db = await new Promise<IDBDatabase>(resolve => { request.onsuccess = () => resolve(request.result); });
    return new Promise<Record<string, unknown>>(resolve => {
      const read = db.transaction('state').objectStore('state').get('progress');
      read.onsuccess = () => { resolve(read.result); db.close(); };
    });
  })).toMatchObject({ ...old, currentLesson: last.id, positions: { board: 4, [last.id]: 2 } });
});
