import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type WorkspaceButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

const variants = {
  primary:
    "border border-[var(--foreground)] px-4 py-2 font-semibold hover:bg-[var(--foreground)] hover:text-[var(--background)] disabled:border-[var(--line)] disabled:hover:bg-transparent disabled:hover:text-[var(--muted)]",
  secondary:
    "border border-[var(--line)] px-3 py-2 hover:border-[var(--foreground)] hover:bg-[var(--selection)] disabled:border-[var(--line-subtle)] disabled:hover:bg-transparent",
} as const;

export const WorkspaceButton = forwardRef<HTMLButtonElement, WorkspaceButtonProps>(function WorkspaceButton({
  children,
  className = "",
  variant = "primary",
  ...props
}, ref) {
  return (
    <button
      className={`w-fit cursor-pointer transition-colors disabled:cursor-not-allowed disabled:text-[var(--muted)] ${variants[variant]} ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});
