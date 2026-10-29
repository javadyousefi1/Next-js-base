import { expect, test } from "@playwright/test";

test("the CSP lets images load from another http(s) host (avatars, documents)", async ({
  request,
}) => {
  const response = await request.get("/login");
  const csp = response.headers()["content-security-policy"] ?? "";
  const imgSrc = csp.split(";").find((directive) => directive.trim().startsWith("img-src"));

  expect(imgSrc).toBeDefined();
  expect(imgSrc).toContain("https:");
  expect(imgSrc).toContain("http:");
  expect(imgSrc).toContain("blob:");
});
