import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="py-7 sm:py-9">
      <Link
        className="text-[0.95rem] font-semibold tracking-normal no-underline"
        href="/"
      >
        Adam Belton
      </Link>
    </header>
  );
}
