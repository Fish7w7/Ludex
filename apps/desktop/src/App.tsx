import {
  Gamepad2,
  Heart,
  Library,
  Play,
  Radar,
  Search,
  Settings,
  Sparkles
} from "lucide-react";
import { mockGames } from "./data/mockGames";

const navigation = [
  { label: "Library", icon: Library, active: true },
  { label: "Scanner", icon: Radar, active: false },
  { label: "Favorites", icon: Heart, active: false },
  { label: "Settings", icon: Settings, active: false }
];

export function App() {
  const selectedGame = mockGames[0];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(155,92,255,0.22),transparent_32%),linear-gradient(135deg,#080912_0%,#101225_52%,#05070d_100%)] text-ludex-text">
      <div className="flex min-h-screen">
        <aside className="flex w-64 flex-col border-r border-white/10 bg-black/25 px-5 py-6 backdrop-blur">
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ludex-violet text-white shadow-neon">
                <Gamepad2 size={22} />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-normal">Ludex</h1>
                <p className="text-xs text-ludex-cyan">ピコ~</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                  item.active
                    ? "bg-white/10 text-white shadow-neon"
                    : "text-ludex-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-ludex-cyan/20 bg-ludex-panel/80 p-4">
            <p className="text-xs uppercase text-ludex-muted">Sync Ready</p>
            <p className="mt-2 text-sm text-white">
              Offline architecture prepared. Local storage lands in a later phase.
            </p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col px-8 py-7">
          <header className="flex items-center justify-between gap-5">
            <div>
              <p className="text-sm text-ludex-cyan">Windows MVP shell</p>
              <h2 className="mt-1 text-3xl font-semibold">All Games</h2>
            </div>
            <div className="flex min-w-80 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <Search size={18} className="text-ludex-muted" />
              <span className="text-sm text-ludex-muted">Search library</span>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-[1fr_360px] gap-6">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-2">
                  {["All Games", "Steam", "Manual"].map((filter, index) => (
                    <button
                      key={filter}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        index === 0
                          ? "bg-ludex-cyan text-ludex-ink"
                          : "bg-white/5 text-ludex-muted hover:bg-white/10"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <button className="flex items-center gap-2 rounded-full bg-ludex-pink px-4 py-2 text-sm font-medium text-white shadow-neon">
                  <Radar size={16} />
                  Scan Drives
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {mockGames.map((game) => (
                  <article
                    key={game.id}
                    className="group rounded-2xl border border-white/10 bg-ludex-panel/85 p-4 transition hover:-translate-y-0.5 hover:border-ludex-cyan/40 hover:shadow-neon"
                  >
                    <div className={`h-28 rounded-xl bg-gradient-to-br ${game.gradient}`} />
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-white">{game.title}</h3>
                        <p className="mt-1 text-xs text-ludex-muted">{game.source}</p>
                      </div>
                      <button className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-ludex-cyan transition group-hover:bg-ludex-cyan group-hover:text-ludex-ink">
                        <Play size={16} />
                      </button>
                    </div>
                    <p className="mt-3 truncate text-xs text-ludex-muted">{game.installPath}</p>
                  </article>
                ))}
              </div>
            </section>

            <aside className="rounded-2xl border border-white/10 bg-black/25 p-5">
              <div className={`h-44 rounded-2xl bg-gradient-to-br ${selectedGame.gradient}`} />
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold">{selectedGame.title}</h3>
                  <p className="mt-1 text-sm text-ludex-muted">{selectedGame.source}</p>
                </div>
                <Sparkles className="text-ludex-pink" size={22} />
              </div>
              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-5">
                  <dt className="text-ludex-muted">Drive</dt>
                  <dd>{selectedGame.drive}</dd>
                </div>
                <div className="flex justify-between gap-5">
                  <dt className="text-ludex-muted">Play time</dt>
                  <dd>{selectedGame.playTime}</dd>
                </div>
                <div className="flex justify-between gap-5">
                  <dt className="text-ludex-muted">Scanner</dt>
                  <dd>Mock</dd>
                </div>
              </dl>
              <button className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-ludex-violet px-4 py-3 font-medium text-white">
                <Play size={18} />
                Launch Stub
              </button>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

