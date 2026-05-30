import type { ReactNode } from "react";
import { ChevronDown, Heart, Library, LogOut, Radar, Settings } from "lucide-react";
import sidebarBackground from "../../assets/sidebar-bg.png";
import { BrandMark, SearchInput, StatusBadge } from "../ui";
import type { ActiveView } from "../../types/ui";
import type { ApiUser } from "../../types/api";

const navigation = [
  { key: "library", label: "Library", icon: Library },
  { key: "scanner", label: "Scanner", icon: Radar },
  { key: "favorites", label: "Favorites", icon: Heart },
  { key: "settings", label: "Settings", icon: Settings }
] satisfies Array<{
  key: ActiveView;
  label: string;
  icon: typeof Library;
}>;

export function AppShell({
  activeView,
  children,
  heading,
  onLogout,
  onSearch,
  onViewChange,
  search,
  showSearch,
  subtitle,
  user
}: {
  activeView: ActiveView;
  children: ReactNode;
  heading: string;
  onLogout: () => void;
  onSearch: (value: string) => void;
  onViewChange: (view: ActiveView) => void;
  search: string;
  showSearch: boolean;
  subtitle: string;
  user: ApiUser | null;
}) {
  return (
    <main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_28%_0%,rgba(40,244,255,0.13),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(155,92,255,0.16),transparent_30%),linear-gradient(135deg,#070918_0%,#0d1021_48%,#03050b_100%)] text-ludex-text">
      <div className="flex h-screen">
        <Sidebar
          activeView={activeView}
          onLogout={onLogout}
          onViewChange={onViewChange}
          user={user}
        />

        <section className="min-w-0 flex-1 overflow-y-auto border-l border-white/[0.03] px-6 py-7 2xl:px-8">
          <header className="flex items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-ludex-cyan">{subtitle}</p>
              <h2 className="mt-1 text-[2.45rem] font-semibold leading-none tracking-normal text-white">
                {heading}
              </h2>
            </div>
            {showSearch ? (
              <SearchInput
                onChange={(event) => onSearch(event.target.value)}
                value={search}
              />
            ) : null}
          </header>

          <div className="mt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}

function Sidebar({
  activeView,
  onLogout,
  onViewChange,
  user
}: {
  activeView: ActiveView;
  onLogout: () => void;
  onViewChange: (view: ActiveView) => void;
  user: ApiUser | null;
}) {
  const displayName = user?.name ?? "Jogador Ludex";
  const displayEmail = user?.email ?? "demo@ludex.local";

  return (
    <aside className="relative flex w-[284px] shrink-0 overflow-hidden border-r border-white/10 bg-[#040814]">
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-bottom opacity-95 saturate-125 contrast-110"
        src={sidebarBackground}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,22,0.12)_0%,rgba(5,8,22,0.35)_42%,rgba(2,5,14,0.76)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_26%_12%,rgba(155,92,255,0.52),transparent_25%),radial-gradient(circle_at_72%_36%,rgba(40,244,255,0.12),transparent_30%),linear-gradient(90deg,rgba(2,5,14,0.18),transparent_58%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-ludex-cyan/30" />

      <div className="relative z-10 flex h-screen w-full flex-col px-4 py-5">
        <div className="relative mb-6 px-3 pb-4 pt-6">
          <div className="absolute left-8 top-4 h-24 w-24 rounded-full bg-ludex-violet/35 blur-2xl" />
          <div className="relative">
            <BrandMark compact />
          </div>
        </div>

        <nav className="space-y-2.5" aria-label="Principal">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={`group flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ludex-cyan/60 ${
                activeView === item.key
                  ? "border-ludex-violet/55 bg-ludex-violet/[0.34] text-white shadow-[inset_3px_0_0_rgba(255,79,216,0.86),0_0_30px_rgba(155,92,255,0.34)]"
                  : "border-transparent bg-black/20 text-ludex-text/78 hover:border-ludex-cyan/20 hover:bg-white/[0.09] hover:text-white"
              }`}
              onClick={() => onViewChange(item.key)}
              type="button"
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                  activeView === item.key
                    ? "bg-ludex-violet text-white shadow-[0_0_18px_rgba(155,92,255,0.48)]"
                    : "bg-white/[0.08] text-ludex-muted group-hover:text-ludex-cyan"
                }`}
              >
                <item.icon size={17} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <section className="rounded-2xl border border-white/[0.14] bg-black/42 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.65)]" />
                  <p className="text-sm font-semibold text-white">API connected</p>
                </div>
                <p className="mt-1 text-xs text-ludex-muted">Ludex API</p>
              </div>
              <StatusBadge tone="success">online</StatusBadge>
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.14] bg-black/44 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.34)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ludex-pink/40 bg-gradient-to-br from-ludex-violet to-ludex-pink text-sm font-semibold text-white shadow-[0_0_24px_rgba(255,79,216,0.28)]">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white" title={displayName}>
                  {displayName}
                </p>
                <p className="truncate text-xs text-ludex-muted" title={displayEmail}>
                  {displayEmail}
                </p>
              </div>
              <ChevronDown className="text-ludex-muted" size={16} />
            </div>

            <div className="mt-4 border-t border-white/10 pt-3">
              <button
                className="flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left text-sm font-medium text-ludex-pink transition hover:bg-ludex-pink/10 hover:text-pink-100 focus:outline-none focus:ring-2 focus:ring-ludex-cyan/60"
                onClick={onLogout}
                type="button"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </section>

          <div className="flex items-center justify-between px-1 text-xs text-ludex-muted">
            <span>v0.1.0</span>
            <span className="font-semibold text-ludex-pink">ピコ~</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
