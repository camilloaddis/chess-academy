import { readFile, writeFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

test('subpath manifest, hash refresh, offline and progress after worker update', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  const registration = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(new URL(registration).pathname).toBe('/chess-academy/');
  const manifest = await page.evaluate(async () => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')!;
    return (await fetch(link.href)).json();
  });
  expect(manifest.start_url).toBe('/chess-academy/');
  for (const icon of manifest.icons) {
    const response = await page.request.get(new URL(icon.src, page.url()).href);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/png');
  }
  await page.getByRole('button', { name: /Inizia la prima lezione/ }).click();
  await page.getByRole('button', { name: /^Continua/ }).click();
  await expect.poll(() => page.evaluate(async () => {
    const request = indexedDB.open('chess-academy', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return new Promise<number>((resolve) => {
      const read = db.transaction('state').objectStore('state').get('progress');
      read.onsuccess = () => { resolve(read.result?.positions.board ?? 0); db.close(); };
    });
  })).toBe(1);
  const before = await context.storageState({ indexedDB: true });
  const hash = new URL(page.url()).hash;
  await page.reload();
  expect(new URL(page.url()).hash).toBe(hash);
  // Install a genuinely different worker script, preserving the generated precache logic.
  const sw = await readFile('dist/sw.js', 'utf8');
  await writeFile('dist/sw.js', `${sw}\nself.skipWaiting(); // update regression\n`);
  try {
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    await new Promise<void>(async (resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Worker update timeout')), 15000);
      navigator.serviceWorker.addEventListener('controllerchange', () => { clearTimeout(timeout); resolve(); }, { once: true });
      try { await reg.update(); } catch (e) { clearTimeout(timeout); reject(e); }
    });
  });
  } finally { await writeFile('dist/sw.js', sw); }
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Apriamo il centro', exact: true })).toBeVisible();
  const after = await context.storageState({ indexedDB: true });
  expect(after.origins.map(o => o.indexedDB)).toEqual(before.origins.map(o => o.indexedDB));
});
