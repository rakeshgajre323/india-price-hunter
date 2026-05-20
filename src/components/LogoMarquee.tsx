import { platforms } from "@/data/platforms";

/**
 * Infinite horizontal marquee of partner app logos.
 * Uses stylized brand-coloured monogram tiles (initial + name)
 * so we do not ship third-party trademarked artwork.
 */
export function LogoMarquee() {
  // Duplicate the list so the translate animation loops seamlessly.
  const loop = [...platforms, ...platforms];

  return (
    <section className="border-y border-border bg-secondary/30 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Comparing live prices across India's top quick-commerce apps
        </div>

        <div
          className="group relative mt-6 overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused]">
            {loop.map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="flex min-w-[200px] items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`,
                  }}
                  aria-hidden
                >
                  {p.shortName.charAt(0)}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-tight tracking-tight">
                    {p.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    ~{p.avgEtaMin} min delivery
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}