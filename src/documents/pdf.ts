import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerURL from "pdfjs-dist/build/pdf.worker.min.mjs?url";
GlobalWorkerOptions.workerSrc = workerURL;
export function openPdf(bytes: ArrayBuffer) {
  const base = `${location.origin}${import.meta.env.BASE_URL}pdf-support/`;
  return getDocument({
    data: bytes.slice(0),
    cMapUrl: `${base}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${base}standard_fonts/`,
    wasmUrl: `${base}wasm/`,
    enableXfa: false,
  });
}
export type Pdf = Awaited<ReturnType<typeof openPdf>["promise"]>;
