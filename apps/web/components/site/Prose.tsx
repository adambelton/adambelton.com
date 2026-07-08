import type { ReactNode } from "react";

type ProseProps = {
  children: ReactNode;
  className?: string;
};

export function Prose({ children, className = "" }: ProseProps) {
  return (
    <div className={`max-w-3xl text-lg leading-8 text-[var(--muted)] ${className}`}>
      {children}
    </div>
  );
}
