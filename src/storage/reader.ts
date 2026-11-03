import { openDB } from "idb";
import type { Annotation } from "../annotations/model";
export type DocumentRecord = {
  id: string;
  title: string;
  bytes: ArrayBuffer;
  pages: number;
  page: number;
  bookmarks: number[];
  cover?: string;
  updated: number;
};
let connection: ReturnType<typeof openDB> | undefined;
export const readerDB = () =>
  (connection ??= openDB("chess-academy", 2, {
    blocked() {
      window.dispatchEvent(new Event("reader-storage-blocked"));
    },
    upgrade(db) {
      for (const name of [
        "state",
        "documents",
        "files",
        "annotations",
        "settings",
      ])
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
    },
  }));
export async function listDocuments(): Promise<DocumentRecord[]> {
  const db = await readerDB();
  return db.getAll("documents");
}
export async function putDocument(doc: DocumentRecord) {
  const db = await readerDB();
  const tx = db.transaction(["documents", "files"], "readwrite");
  await tx
    .objectStore("documents")
    .put({ ...doc, bytes: new ArrayBuffer(0) }, doc.id);
  await tx.objectStore("files").put(doc.bytes, doc.id);
  await tx.done;
}
export async function savePosition(
  id: string,
  page: number,
  bookmarks?: number[],
) {
  const db = await readerDB();
  const tx = db.transaction("documents", "readwrite");
  const doc = (await tx.store.get(id)) as DocumentRecord | undefined;
  if (doc)
    await tx.store.put(
      {
        ...doc,
        page,
        ...(bookmarks ? { bookmarks } : {}),
        updated: Date.now(),
      },
      id,
    );
  await tx.done;
}
export async function annotationsFor(id: string): Promise<Annotation[]> {
  const db = await readerDB();
  return (await db.getAll("annotations")).filter((a) => a.documentId === id);
}
export async function putAnnotation(a: Annotation) {
  const db = await readerDB();
  await db.put("annotations", a, a.id);
}
export async function removeAnnotation(id: string) {
  const db = await readerDB();
  await db.delete("annotations", id);
}
export async function removeDocument(id: string) {
  const db = await readerDB();
  const tx = db.transaction(["documents", "files", "annotations"], "readwrite");
  await tx.objectStore("documents").delete(id);
  await tx.objectStore("files").delete(id);
  for (const a of await tx.objectStore("annotations").getAll())
    if (a.documentId === id) await tx.objectStore("annotations").delete(a.id);
  await tx.done;
}
export async function setting<T>(key: string, fallback: T): Promise<T> {
  return (await (await readerDB()).get("settings", key)) ?? fallback;
}
export async function setSetting(key: string, value: unknown) {
  await (await readerDB()).put("settings", value, key);
}

export async function documentBytes(id: string): Promise<ArrayBuffer> {
  return (await readerDB()).get("files", id);
}
