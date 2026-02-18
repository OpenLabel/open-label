import { describe, it, expect } from "vitest";
import DOMPurify from "dompurify";

describe("XSS prevention via DOMPurify", () => {
  it("strips script tags from HTML", () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain("<script");
    expect(clean).toContain("<p>Hello</p>");
  });

  it("strips onerror event handlers", () => {
    const dirty = '<img src="x" onerror="alert(1)" />';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain("onerror");
  });

  it("strips javascript: URLs from links", () => {
    const dirty = '<a href="javascript:alert(1)">click</a>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain("javascript:");
  });

  it("preserves safe HTML content", () => {
    const safe = '<p>Wine from <strong>Bordeaux</strong>, 2020</p>';
    const clean = DOMPurify.sanitize(safe);
    expect(clean).toBe(safe);
  });
});
