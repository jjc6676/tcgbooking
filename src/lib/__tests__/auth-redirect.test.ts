import { describe, it, expect } from "vitest";

/**
 * Tests for the open redirect prevention logic used in auth/callback/route.ts.
 * The logic: only allow `next` values that start with "/" and don't start with "//".
 */

function sanitizeRedirect(rawNext: string | null): string {
  const val = rawNext ?? "/book";
  return val.startsWith("/") && !val.startsWith("//") ? val : "/book";
}

describe("sanitizeRedirect (auth callback)", () => {
  it("allows simple relative paths", () => {
    expect(sanitizeRedirect("/admin")).toBe("/admin");
    expect(sanitizeRedirect("/book")).toBe("/book");
    expect(sanitizeRedirect("/appointments")).toBe("/appointments");
  });

  it("allows nested paths", () => {
    expect(sanitizeRedirect("/admin/appointments")).toBe("/admin/appointments");
    expect(sanitizeRedirect("/book/abc-123")).toBe("/book/abc-123");
  });

  it("allows paths with query strings", () => {
    expect(sanitizeRedirect("/update-password?token=abc")).toBe("/update-password?token=abc");
  });

  it("defaults to /book when next is null", () => {
    expect(sanitizeRedirect(null)).toBe("/book");
  });

  it("blocks absolute URLs (open redirect)", () => {
    expect(sanitizeRedirect("https://evil.com")).toBe("/book");
    expect(sanitizeRedirect("http://evil.com")).toBe("/book");
  });

  it("blocks protocol-relative URLs", () => {
    expect(sanitizeRedirect("//evil.com")).toBe("/book");
    expect(sanitizeRedirect("//evil.com/phish")).toBe("/book");
  });

  it("blocks javascript: URLs", () => {
    expect(sanitizeRedirect("javascript:alert(1)")).toBe("/book");
  });

  it("blocks data: URLs", () => {
    expect(sanitizeRedirect("data:text/html,<script>alert(1)</script>")).toBe("/book");
  });

  it("blocks empty string", () => {
    expect(sanitizeRedirect("")).toBe("/book");
  });

  it("blocks relative paths without leading slash", () => {
    expect(sanitizeRedirect("admin")).toBe("/book");
    expect(sanitizeRedirect("book")).toBe("/book");
  });
});
