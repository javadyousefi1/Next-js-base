export type FileRejection = { file: File; reason: "type" | "size" | "count" };

export type FileRules = {
  /** MIME types (`image/png`), wildcards (`image/*`) or extensions (`.pdf`); empty = anything. */
  accept?: readonly string[];
  /** Largest file in bytes. */
  maxSize?: number;
  /** Most files accepted at once (only with `multiple`). */
  maxFiles?: number;
  /** More than one file allowed (default: one). */
  multiple?: boolean;
};

/** Does the file match one `accept` entry (MIME type, `type/*` wildcard or `.ext`)? */
function matchesAccept(file: File, entry: string) {
  const rule = entry.trim().toLowerCase();
  if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
  if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
  return file.type.toLowerCase() === rule;
}

/**
 * Splits picked/dropped files into accepted and rejected (with the reason): wrong type, too big,
 * or over the count limit (a single-file zone keeps the first file and rejects the rest).
 */
export function validateFiles(files: readonly File[], rules: FileRules = {}) {
  const { accept = [], maxSize, maxFiles, multiple = false } = rules;
  const limit = multiple ? (maxFiles ?? Infinity) : 1;
  const accepted: File[] = [];
  const rejected: FileRejection[] = [];

  for (const file of files) {
    if (accept.length > 0 && !accept.some((entry) => matchesAccept(file, entry))) {
      rejected.push({ file, reason: "type" });
    } else if (maxSize !== undefined && file.size > maxSize) {
      rejected.push({ file, reason: "size" });
    } else if (accepted.length >= limit) {
      rejected.push({ file, reason: "count" });
    } else {
      accepted.push(file);
    }
  }
  return { accepted, rejected };
}

/** `1536` → `1.5 KB` (digits follow the locale). */
export function formatBytes(bytes: number, locale?: string) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const text = new Intl.NumberFormat(locale, { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(
    value,
  );
  return `${text} ${units[unit]}`;
}
