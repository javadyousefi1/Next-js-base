import { afterAll, describe, expect, mock, spyOn, test } from "bun:test";

import { z } from "zod";

import { ApiError } from "./errors";
import { HttpClient } from "./http-client";

/** A real local HTTP server: the client runs exactly as in the app (axios, no mocks). */
const server = Bun.serve({
  port: 0,
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === "/user") return Response.json({ id: 1, name: "Ada" });
    if (pathname === "/created") return Response.json({ id: 2 }, { status: 201 });
    if (pathname === "/private") return Response.json({ message: "Expired" }, { status: 401 });
    if (pathname === "/slow") await Bun.sleep(500);
    return Response.json({ message: "No such user" }, { status: 404 });
  },
});
afterAll(() => server.stop(true));

const onError = mock((_error: ApiError) => {});
const client = new HttpClient({ baseURL: server.url.href, timeout: 2000, proxy: false, onError });
const userSchema = z.object({ id: z.number(), name: z.string() });

const failure = (promise: Promise<unknown>) => promise.catch((caught: unknown) => caught);

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
    const log = spyOn(console, "error").mockImplementation(() => {});
    const error = await failure(client.get("/user", { schema: z.object({ id: z.string() }) }));
    log.mockRestore();
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      code: "INVALID_RESPONSE",
      message: "Unexpected response from GET /user",
    });
  });

  test("an HTTP error is an ApiError with the server's message", async () => {
    expect(await failure(client.get("/missing"))).toMatchObject({
      code: "NOT_FOUND",
      status: 404,
      message: "No such user",
    });
  });

  test("every error is reported to onError (401 → session expired in the browser)", async () => {
    const error = await failure(client.get("/private"));
    expect(error).toMatchObject({ code: "UNAUTHORIZED", status: 401 });
    expect(onError).toHaveBeenLastCalledWith(error);
  });

  test("timeouts and network failures are ApiErrors too", async () => {
    const slow = new HttpClient({ baseURL: server.url.href, timeout: 50, proxy: false });
    expect(await failure(slow.get("/slow"))).toMatchObject({ code: "TIMEOUT" });

    const offline = new HttpClient({ baseURL: "http://127.0.0.1:1", timeout: 1000, proxy: false });
    expect(await failure(offline.get("/user"))).toMatchObject({ code: "NETWORK" });
  });
});
