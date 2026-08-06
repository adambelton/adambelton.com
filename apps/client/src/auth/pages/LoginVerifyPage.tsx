import { useState } from "react";
import { magicLinkVerifyPath } from "packages/auth/src/server/routes";
import { Breadcrumbs, Button, Prose } from "apps/client/src/ui/components";

export function LoginVerifyPage() {
  const [isCompleting, setIsCompleting] = useState(false);

  function handleVerify() {
    setIsCompleting(true);
    window.location.assign(`${magicLinkVerifyPath}${window.location.search}`);
  }

  return (
    <section aria-labelledby="verify-sign-in-title">
      <title>Verify sign in — Adam Belton</title>
      <meta content="noindex" name="robots" />
      <Breadcrumbs items={[
        { label: "Log in", href: "/login" },
        { label: "Verify" },
      ]} />
      <h1
        className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
        id="verify-sign-in-title"
      >
        Complete sign in.
      </h1>
      <Prose className="mt-8">
        Use this page to finish signing in from your email link.
      </Prose>
      <div className="mt-10">
        <Button disabled={isCompleting} onClick={handleVerify} type="button">
          {isCompleting ? "Completing..." : "Complete sign in"}
        </Button>
      </div>
    </section>
  );
}
