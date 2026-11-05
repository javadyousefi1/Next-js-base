import { afterAll, describe, expect, mock, spyOn, test } from "bun:test";

import { z } from "zod";

import { ApiError } from "./errors";
import { HttpClient } from "./http-client";

/** A real local HTTP server: the client runs exactly as in the app (real fetch, no mocks). */
const server = Bun.serve({
  port: 0,
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === "/user") return Response.json({ id: 1, name: "Ada" });
    if (pathname === "/created") return Response.json({ id: 2 }, { status: 201 });
    if (pathname === "/private") return Response.json({ message: "Expired" }, { status: 401 });
    if (pathname === "/error-key") return Response.json({ error: "Bad email" }, { status: 400 });
    if (pathname === "/errors-list") {
      return Response.json({ errors: [{ message: "Name is required" }] }, { status: 422 });
    }
    if (pathname === "/errors-strings")
      return Response.json({ errors: ["Too short"] }, { status: 422 });
    if (pathname === "/detail") return Response.json({ detail: "Already exists" }, { status: 409 });
    if (pathname === "/echo") {
      const type = request.headers.get("content-type") ?? "";
      const body: unknown = type.includes("json")
        ? await request.json()
        : type.includes("form-data")
          ? Object.fromEntries(await request.formData())
          : null;
      return Response.json({ query: new URL(request.url).search, body });
    }
    if (pathname === "/boom") return Response.json({ message: "Crash" }, { status: 503 });
    if (pathname === "/empty") return new Response(null, { status: 204 });
    if (pathname === "/slow") await Bun.sleep(500);
    return Response.json({ message: "No such user" }, { status: 404 });
  },
});
afterAll(() => server.stop(true));

const onError = mock((_error: ApiError) => {});
const client = new HttpClient({ baseURL: server.url.href, timeout: 2000, onError });
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

  test("the message is found in the common error shapes", async () => {
    const messages = await Promise.all(
      ["/error-key", "/errors-list", "/errors-strings", "/detail"].map(async (path) => {
        const error = await failure(client.get(path));
        return error instanceof ApiError ? error.message : undefined;
      }),
    );
    expect(messages).toEqual(["Bad email", "Name is required", "Too short", "Already exists"]);
  });

  test("every error is reported to onError (401 → session expired in the browser)", async () => {
    const error = await failure(client.get("/private"));
    expect(error).toMatchObject({ code: "UNAUTHORIZED", status: 401 });
    expect(onError).toHaveBeenLastCalledWith(error);
  });

  test("timeouts and network failures are ApiErrors too", async () => {
    const slow = new HttpClient({ baseURL: server.url.href, timeout: 50 });
    expect(await failure(slow.get("/slow"))).toMatchObject({ code: "TIMEOUT" });

    const offline = new HttpClient({ baseURL: "http://127.0.0.1:1", timeout: 1000 });
    expect(await failure(offline.get("/user"))).toMatchObject({ code: "NETWORK" });
  });

  test("params become the query string (null/undefined skipped, arrays bracketed)", async () => {
    const { query } = z
      .object({ query: z.string() })
      .parse(await client.get("/echo", { params: { a: 1, b: null, c: undefined, d: ["x", "y"] } }));
    expect(decodeURIComponent(query)).toBe("?a=1&d[]=x&d[]=y");
  });

  test("a body is sent as JSON, FormData is passed through", async () => {
    expect(await client.post("/echo", { name: "Ada" })).toMatchObject({ body: { name: "Ada" } });
    const form = new FormData();
    form.set("file", "content");
    expect(await client.post("/echo", form)).toMatchObject({ body: { file: "content" } });
  });

  test("an empty response resolves to undefined", async () => {
    expect(await client.delete("/empty")).toBeUndefined();
  });

  test("5xx is SERVER; the body is kept as details", async () => {
    expect(await failure(client.get("/boom"))).toMatchObject({
      code: "SERVER",
      status: 503,
      details: { message: "Crash" },
    });
  });

  test("a cancelled request rethrows the abort (not an ApiError) and skips onError", async () => {
    onError.mockClear();
    const controller = new AbortController();
    const pending = failure(client.get("/slow", { signal: controller.signal }));
    controller.abort();
    const error = await pending;
    expect(error).not.toBeInstanceOf(ApiError);
    expect(onError).not.toHaveBeenCalled();
  });
});
