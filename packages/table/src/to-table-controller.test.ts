import { describe, expect, mock, test } from "bun:test";

import { toTableController } from "./to-table-controller";
import type { TableControls } from "./types";

const controls = { activeFilterCount: 0 } as unknown as TableControls;

describe("toTableController", () => {
  test("maps the query data to rows and total", () => {
    const table = toTableController(controls, {
      data: { items: [{ id: 1 }], total: 7 },
      isPending: false,
      isFetching: true,
      isError: false,
      refetch: () => undefined,
    });
    expect(table.rows).toEqual([{ id: 1 }]);
    expect(table.total).toBe(7);
    expect(table.isFetching).toBe(true);
    expect(table.activeFilterCount).toBe(0);
  });

  test("no data yet → empty rows, loading", () => {
    const table = toTableController(controls, {
      isPending: true,
      isFetching: true,
      isError: false,
      refetch: () => undefined,
    });
    expect(table.rows).toEqual([]);
    expect(table.total).toBe(0);
    expect(table.isLoading).toBe(true);
  });

  test("an error only counts while there is no data", () => {
    const base = { isPending: false, isFetching: false, isError: true, refetch: () => undefined };
    expect(toTableController(controls, base).isError).toBe(true);
    expect(toTableController(controls, { ...base, data: { items: [], total: 0 } }).isError).toBe(
      false,
    );
  });

  test("retry refetches", () => {
    const refetch = mock(() => undefined);
    toTableController(controls, {
      isPending: false,
      isFetching: false,
      isError: true,
      refetch,
    }).retry();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
