import { describe, expect, it } from "vitest";
import {
  createMagicLinkEmailHtml,
  createMagicLinkVerificationPageUrl,
} from "packages/auth/src/adapters/email";

describe("createMagicLinkVerificationPageUrl", () => {
  it("preserves the magic-link token and callback on a sign-in verification page", () => {
    const url = createMagicLinkVerificationPageUrl(
      "http://localhost:3000/auth/magic-link/verify?token=test-token&callbackURL=%2Fproducts",
    );

    expect(url).toBe(
      "http://localhost:3000/login/verify?token=test-token&callbackURL=%2Fproducts",
    );
  });

  it("links the site name to the sign-in verification page in HTML email", () => {
    const html = createMagicLinkEmailHtml(
      "http://localhost:3000/login/verify?token=test-token&callbackURL=%2Fproducts",
    );

    expect(html).toContain(
      '<a href="http://localhost:3000/login/verify?token=test-token&amp;callbackURL=%2Fproducts">AdamBelton.com</a>',
    );
  });

  it("escapes the verification page URL before putting it in an HTML attribute", () => {
    const html = createMagicLinkEmailHtml(
      'http://localhost:3000/login/verify?token="test"&callbackURL=/products',
    );

    expect(html).toContain(
      '<a href="http://localhost:3000/login/verify?token=&quot;test&quot;&amp;callbackURL=/products">AdamBelton.com</a>',
    );
  });
});
