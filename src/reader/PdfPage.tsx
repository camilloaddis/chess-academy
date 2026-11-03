import { useEffect, useRef, useState } from "react";
import { TextLayer } from "pdfjs-dist";
import type { Pdf } from "../documents/pdf";
import "pdfjs-dist/web/pdf_viewer.css";
export function PdfPage({ pdf, page }: { pdf: Pdf; page: number }) {
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(innerWidth);
  useEffect(() => {
    const resize = () => setWidth(innerWidth);
    addEventListener("resize", resize);
    return () => removeEventListener("resize", resize);
  }, []);
  const [error, setError] = useState("");
  useEffect(() => {
    const container = host.current!;
    let disposed = false;
    let render:
      ReturnType<Awaited<ReturnType<Pdf["getPage"]>>["render"]> | undefined;
    let text: TextLayer | undefined;
    async function draw() {
      try {
        const p = await pdf.getPage(page);
        if (disposed) return;
        const viewport = p.getViewport({
          scale: Math.min(
            container.clientWidth / p.getViewport({ scale: 1 }).width,
            2,
            2200 / p.getViewport({ scale: 1 }).height,
          ),
        });
        const canvas = document.createElement("canvas");
        const ratio = Math.min(devicePixelRatio, 2);
        canvas.width = Math.ceil(viewport.width * ratio);
        canvas.height = Math.ceil(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        const layer = document.createElement("div");
        layer.className = "textLayer";
        layer.style.setProperty("--scale-factor", `${viewport.scale}`);
        container.replaceChildren(canvas, layer);
        container.style.height = `${viewport.height}px`;
        render = p.render({
          canvas,
          viewport,
          transform: [ratio, 0, 0, ratio, 0, 0],
        });
        await render.promise;
        if (disposed) return;
        text = new TextLayer({
          textContentSource: await p.getTextContent(),
          container: layer,
          viewport,
        });
        await text.render();
      } catch (e) {
        if (!disposed)
          setError(e instanceof Error ? e.message : "Pagina non disponibile");
      }
    }
    void draw();
    return () => {
      disposed = true;
      render?.cancel();
      text?.cancel();
    };
  }, [pdf, page, width]);
  return (
    <>
      <div className="pdf-page" ref={host} aria-label={`Pagina PDF ${page}`} />
      {error && <p role="alert">{error}</p>}
    </>
  );
}
