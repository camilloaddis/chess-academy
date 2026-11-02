import { mkdir, rm, copyFile } from 'node:fs/promises';
await rm('work/public', { recursive: true, force: true });
await mkdir('work/public', { recursive: true });
for (const name of ['icon.svg', 'icon-192.png', 'icon-512.png']) {
  await copyFile(`public/${name}`, `work/public/${name}`);
}
