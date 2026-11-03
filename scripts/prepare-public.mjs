import { mkdir, rm, copyFile, cp } from "node:fs/promises";
await rm("work/public", { recursive: true, force: true });
await mkdir("work/public", { recursive: true });
for (const name of ["icon.svg", "icon-192.png", "icon-512.png"]) {
  await copyFile(`public/${name}`, `work/public/${name}`);
}

for (const dir of ["cmaps", "standard_fonts", "wasm"])
  await cp(`node_modules/pdfjs-dist/${dir}`, `work/public/pdf-support/${dir}`, {
    recursive: true,
  });
