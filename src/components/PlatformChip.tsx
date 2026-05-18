import { getPlatform } from "@/data/platforms";

export function PlatformChip({ platformId, size = "md" }: { platformId: string; size?: "sm" | "md" }) {
  const p = getPlatform(platformId);
  if (!p) return null;
  const text = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${text}`}
      style={{ backgroundColor: `${p.color}1f`, color: p.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
      {p.shortName}
    </span>
  );
}