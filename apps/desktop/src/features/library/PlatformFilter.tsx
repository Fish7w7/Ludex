import type { Platform } from "../../types/api";

export function PlatformFilter({
  activeFilter,
  favoriteCount,
  onChange,
  platforms
}: {
  activeFilter: string;
  favoriteCount: number;
  onChange: (filter: string) => void;
  platforms: Platform[];
}) {
  const filters = [
    { key: "all", label: "Todos" },
    ...platforms.map((platform) => ({
      key: platform.scanner_key ?? platform.slug,
      label: platform.scanner_key === "epic" ? "Epic" : platform.name
    })),
    { key: "favorites", label: `Favoritos (${favoriteCount})` }
  ];

  return (
    <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Filtros">
      {filters.map((filter) => (
        <button
          key={filter.key}
          className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ludex-cyan/60 ${
            activeFilter === filter.key
              ? "border-ludex-violet/45 bg-ludex-violet text-white shadow-[0_0_24px_rgba(155,92,255,0.28)]"
              : "border-white/10 bg-white/[0.05] text-ludex-muted hover:border-ludex-cyan/25 hover:bg-white/[0.08] hover:text-white"
          }`}
          onClick={() => onChange(filter.key)}
          role="tab"
          type="button"
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
