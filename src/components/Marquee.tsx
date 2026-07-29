interface MarqueeItem {
  text: string;
  spotlight?: boolean;
}

/**
 * Continuous CSS-driven ticker (no JS animation loop — cheap, off the main thread).
 * Content is duplicated once so the loop seams perfectly at -50%.
 */
export function Marquee({ items }: { items: MarqueeItem[] }) {
  const row = (keyPrefix: string) => (
    <div className="flex shrink-0 items-center" aria-hidden={keyPrefix === "dup"}>
      {items.map((item, i) => (
        <span key={`${keyPrefix}-${i}`} className="flex items-center">
          <span className={`whitespace-nowrap px-4 text-sm font-semibold uppercase tracking-wide sm:text-base ${item.spotlight ? "font-display spotlight" : "text-ink-secondary"}`}>
            {item.text}
          </span>
          <span className="text-ink-muted">·</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee-mask overflow-hidden border-y border-hairline py-3">
      <div className="marquee-track flex w-max motion-reduce:animate-none">
        {row("a")}
        {row("dup")}
      </div>
    </div>
  );
}
