import { afterAll, describe, expect, mock, test } from "bun:test";

import { z } from "zod";

import { ApiError } from "./errors";
import { HttpClient } from "./http-client";

/** A real local HTTP server: the client runs exactly as in the app (axios, no mocks). */
const server = Bun.serve({
  port: 0,
  fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === "/user") return Response.json({ id: 1, name: "Ada" });
    if (pathname === "/created") return Response.json({ id: 2 }, { status: 201 });
    return Response.json({ message: "No such user" }, { status: 404 });
  },
});
afterAll(() => server.stop());

const onError = mock((_error: ApiError) => {});
const client = new HttpClient({ baseURL: server.url.href, timeout: 2000, proxy: false, onError });
const userSchema = z.object({ id: z.number(), name: z.string() });

describe("HttpClient", () => {
  test("returns the data parsed with the schema", async () => {
    expect(await client.get("/user", { schema: userSchema })).toEqual({ id: 1, name: "Ada" });
  });

  test("returns raw data without a schema", async () => {
    expect(await client.post("/created", { name: "Grace" })).toEqual({ id: 2 });
  });

  test("request() resolves to status + data", async () => {
    expect(await client.request("POST", "/created")).toEqual({ status: 201, data: { id: 2 } });
  });

  test("an unexpected shape is an INVALID_RESPONSE ApiError labelled with the endpoint", async () => {
    const schema = z.object({ id: z.string() });
    const error = await client.get("/user", { schema }).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      code: "INVALID_RESPONSE",
      message: "Unexpected response from GET /user",
    });
  });

  test("an HTTP error is an ApiError, reported to onError", async () => {
    const error = await client.get("/missing").catch((caught: unknown) => caught);
    expect(error).toMatchObject({ code: "NOT_FOUND", status: 404, message: "No such user" });
    expect(onError).toHaveBeenLastCalledWith(error);
  });
});
