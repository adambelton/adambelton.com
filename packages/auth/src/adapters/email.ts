import { Resend } from "resend";

export type MagicLinkEmail = {
  email: string;
  url: string;
};

export type SendMagicLinkEmail = (message: MagicLinkEmail) => Promise<void>;

export function createMagicLinkVerificationPageUrl(url: string): string {
  const verificationUrl = new URL(url);
  verificationUrl.pathname = "/login/verify";
  return verificationUrl.toString();
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function createMagicLinkEmailHtml(verificationPageUrl: string): string {
  const escapedVerificationPageUrl = escapeHtmlAttribute(verificationPageUrl);

  return [
    "<p>",
    `Open this sign-in page for <a href="${escapedVerificationPageUrl}">AdamBelton.com</a>.`,
    "</p>",
    "<p>Then choose <strong>Complete sign in</strong>.</p>",
    "<p>This link signs you in directly. It expires shortly and can only be used once.</p>",
    "<p>If you did not request this email, you can ignore it.</p>",
  ].join("");
}

export function createResendMagicLinkEmailSender({
  apiKey,
  from,
}: {
  apiKey: string | undefined;
  from: string;
}): SendMagicLinkEmail {
  return async ({ email, url }) => {
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is required to send magic links.");
    }

    const verificationPageUrl = createMagicLinkVerificationPageUrl(url);
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: "Sign in to AdamBelton.com",
      html: createMagicLinkEmailHtml(verificationPageUrl),
      text: [
        "Open this sign-in page:",
        "",
        verificationPageUrl,
        "",
        "Then choose Complete sign in.",
        "",
        "This link signs you in directly. It expires shortly and can only be used once.",
        "",
        "If you did not request this email, you can ignore it.",
      ].join("\n"),
    });

    if (error) {
      throw new Error(error.message);
    }
  };
}
