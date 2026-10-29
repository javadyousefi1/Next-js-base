/**
 * One size for every state of a table (loading, rows, empty, error), so nothing jumps:
 * the table's body is always `pageSize` rows of `ROW_HEIGHT_REM` under a `HEADER_HEIGHT_REM` header.
 */
export const HEADER_HEIGHT_REM = 2.5;
export const ROW_HEIGHT_REM = 3;

/** Height of the rows area for `rows` rows. */
export function bodyHeight(rows: number): string {
  return `${rows * ROW_HEIGHT_REM}rem`;
}

/** Minimum height of the whole bordered table (2px = its border). */
export function tableMinHeight(rows: number): string {
  return `calc(${HEADER_HEIGHT_REM + rows * ROW_HEIGHT_REM}rem + 2px)`;
}

/** Tailwind classes of the same sizes (keep in sync with the constants above). */
export const HEADER_ROW_CLASS = "h-10";
export const BODY_ROW_CLASS = "h-12";
