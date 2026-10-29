import { DOCUMENT_KINDS, type DocumentKind, type ProfileDocument } from "./schemas/profile.schema";

/** The documents grouped by kind, in the order of `DOCUMENT_KINDS` (a kind may be empty). */
export function groupDocuments(
  documents: readonly ProfileDocument[],
): { kind: DocumentKind; items: ProfileDocument[] }[] {
  return DOCUMENT_KINDS.map((kind) => ({
    kind,
    items: documents.filter((document) => document.kind === kind),
  }));
}
