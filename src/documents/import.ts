import { openPdf } from "./pdf";
import {
  putDocument,
  listDocuments,
  putAnnotation,
  type DocumentRecord,
} from "../storage/reader";
import { referenceAnnotations } from "../annotations/model";
export const MAX_FILE = 64 * 1024 * 1024;
export async function importPdf(
  file: File,
): Promise<{ doc: DocumentRecord; persistent: boolean }> {
  if (file.size > MAX_FILE)
    throw new Error(
      "Limite del prototipo: 64 MB per PDF. Scegli un documento più piccolo.",
    );
  const bytes = await file.arrayBuffer();
  if (!new TextDecoder().decode(bytes.slice(0, 1024)).includes("%PDF-"))
    throw new Error("Il file non è un PDF.");
  const id = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const existing = (await listDocuments().catch(() => [])).find(
    (d) => d.id === id,
  );
  if (existing) return { doc: existing, persistent: true };
  const task = openPdf(bytes);
  let pdf;
  try {
    pdf = await task.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({
      scale: Math.min(
        160 / page.getViewport({ scale: 1 }).width,
        240 / page.getViewport({ scale: 1 }).height,
      ),
    });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvas, viewport }).promise;
    const doc: DocumentRecord = {
      id,
      title: file.name.replace(/\.pdf$/i, ""),
      bytes,
      pages: pdf.numPages,
      page: 1,
      bookmarks: [],
      cover: canvas.toDataURL("image/png"),
      updated: Date.now(),
    };
    const estimate = await navigator.storage
      ?.estimate?.()
      .catch(() => ({}) as StorageEstimate);
    let persistent = false;
    if (
      !estimate?.quota ||
      estimate.quota - (estimate.usage ?? 0) > file.size * 1.5
    ) {
      try {
        await putDocument(doc);
        persistent = true;
      } catch {
        /* Session fallback, reported by caller. */
      }
    }
    for (const a of persistent ? referenceAnnotations(id) : [])
      await putAnnotation(a).catch(() => {});
    return { doc, persistent };
  } catch (e) {
    throw new Error(
      `PDF non apribile (file danneggiato o protetto da password). ${e instanceof Error ? e.message : ""}`,
    );
  } finally {
    await task.destroy();
  }
}
