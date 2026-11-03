import { readdir, readFile } from "node:fs/promises";
import assert from "node:assert/strict";
async function inspect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      assert.ok(
        path === "dist/assets" ||
          path === "dist/pdf-support" ||
          path.startsWith("dist/pdf-support/"),
        `Unexpected published directory: ${path}`,
      );
      await inspect(path);
    } else {
      if (path.startsWith("dist/pdf-support/"))
        assert.match(
          path,
          /^dist\/pdf-support\/(?:cmaps|standard_fonts|wasm)\/[\w.-]+$/,
        );
      else
        assert.match(
          path,
          /^dist\/(?:index\.html|manifest\.webmanifest|sw\.js|workbox-[\w-]+\.js|icon\.svg|icon-(?:192|512)\.png|assets\/[\w.-]+\.(?:js|mjs|css|svg))$/,
          `Unexpected published file: ${path}`,
        );
      const data = await readFile(path);
      assert.ok(
        !data.subarray(0, 5).equals(Buffer.from("%PDF-")),
        `PDF detected: ${path}`,
      );
      if (/\.(js|css|html|webmanifest)$/.test(path)) {
        assert.ok(
          !/(?:How%20to%20Win|How to Win at Chess\.pdf|data:application\/pdf)/i.test(
            data.toString(),
          ),
          `Source document reference: ${path}`,
        );
      }
    }
  }
}
await inspect("dist");
const manifest = JSON.parse(
  await readFile("dist/manifest.webmanifest", "utf8"),
);
for (const key of ["id", "scope", "start_url"])
  assert.equal(manifest[key], "/chess-academy/");
console.log("Published artifact allowlist and PWA manifest verified.");
