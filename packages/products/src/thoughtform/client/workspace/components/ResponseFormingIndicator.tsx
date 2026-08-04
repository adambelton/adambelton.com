export function ResponseFormingIndicator() {
  return (
    <div
      className="flex items-center gap-3 text-sm text-[var(--muted)]"
      data-testid="response-forming-indicator"
      role="status"
    >
      <span aria-hidden="true" className="flex gap-1">
        {[0, 1, 2].map((index) => (
          <span
            className="h-1.5 w-1.5 rounded-full bg-current motion-safe:animate-pulse"
            key={index}
            style={{ animationDelay: `${index * 160}ms` }}
          />
        ))}
      </span>
      <span>ThoughtForm is considering your message.</span>
    </div>
  );
}
