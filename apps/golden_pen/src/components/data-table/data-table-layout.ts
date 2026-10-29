/**
 * Sizes shared by every state of a table so the parts line up: real rows and skeleton rows have
 * the same height, and the empty / error block has one fixed height. A loaded table takes exactly
 * the height of its rows (no reserved empty space).
 */

/** Tailwind classes of the header row and of every body row (real and skeleton). */
export const HEADER_ROW_CLASS = "h-10";
export const BODY_ROW_CLASS = "h-12";

/** Height of the empty / no-results / error block inside the table. */
export const STATE_HEIGHT_CLASS = "h-72";
