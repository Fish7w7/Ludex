import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  FilePlus,
  FolderOpen,
  Gamepad2,
  Heart,
  Library,
  LogOut,
  Play,
  Radar,
  RefreshCcw,
  Search,
  Settings,
  Sparkles,
  Square,
  X,
  UserPlus
} from "lucide-react";
import { ludexApi } from "./api/ludexApi";
import { mockSyncGames } from "./data/mockSyncGames";
import { AuthProvider, useAuth } from "./features/auth/AuthProvider";
import {
  buildManualSyncGame,
  deriveGameName,
  isWindowsExecutablePath
} from "./features/manual/manualGame";
import { steamGameToSyncGame } from "./features/scanner/steamScanner";
import { desktopCommands } from "./lib/desktopCommands";
import type { SteamDetectedGame } from "./lib/desktopCommands";
import type { Platform, UserGame } from "./types/api";

type ActiveView = "library" | "scanner" | "favorites" | "settings";

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

type SteamScannerState = {
  status: "idle" | "loading" | "success" | "error" | "importing";
  error: string | null;
  games: SteamDetectedGame[];
  selectedIds: string[];
  libraries: string[];
  steamPath: string | null;
  notice: string | null;
};

const initialSteamScannerState: SteamScannerState = {
  status: "idle",
  error: null,
  games: [],
  selectedIds: [],
  libraries: [],
  steamPath: null,
  notice: null
};

function formatPlaytime(seconds: number): string {
  if (seconds <= 0) {
    return "0m";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Nunca";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function gameName(userGame: UserGame): string {
  return userGame.game?.name ?? `Game #${userGame.game_id}`;
}

function platformName(userGame: UserGame): string {
  return userGame.platform?.name ?? userGame.source;
}

function AuthScreen() {
  const { login, register, error, clearError } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("Jogador Ludex");
  const [email, setEmail] = useState(
    () => `jogador-${Date.now()}@ludex.local`
  );
  const [password, setPassword] = useState("password1234");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    clearError();
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível autenticar no Ludex."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(155,92,255,0.22),transparent_32%),linear-gradient(135deg,#080912_0%,#101225_52%,#05070d_100%)] px-6 text-ludex-text">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-black/35 p-7 shadow-neon backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ludex-violet text-white shadow-neon">
            <Gamepad2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Ludex</h1>
            <p className="text-sm text-ludex-cyan">ピコ~</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 rounded-xl bg-white/5 p-1">
          <button
            className={`rounded-lg px-3 py-2 text-sm transition ${
              mode === "login"
                ? "bg-ludex-cyan text-ludex-ink"
                : "text-ludex-muted hover:text-white"
            }`}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`rounded-lg px-3 py-2 text-sm transition ${
              mode === "register"
                ? "bg-ludex-cyan text-ludex-ink"
                : "text-ludex-muted hover:text-white"
            }`}
            onClick={() => setMode("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label className="block text-sm">
              <span className="text-ludex-muted">Nome</span>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ludex-cyan"
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            </label>
          ) : null}

          <label className="block text-sm">
            <span className="text-ludex-muted">Email</span>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ludex-cyan"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>

          <label className="block text-sm">
            <span className="text-ludex-muted">Senha</span>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ludex-cyan"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>

          {formError ?? error ? (
            <p className="rounded-xl border border-ludex-pink/30 bg-ludex-pink/10 px-4 py-3 text-sm text-pink-100">
              {formError ?? error}
            </p>
          ) : null}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ludex-violet px-4 py-3 font-medium text-white shadow-neon transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {mode === "register" ? <UserPlus size={18} /> : <Play size={18} />}
            {isSubmitting
              ? "Conectando..."
              : mode === "register"
                ? "Criar conta"
                : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}

function LoadingSplash() {
  return (
    <main className="grid min-h-screen place-items-center bg-ludex-ink text-ludex-text">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ludex-violet shadow-neon">
          <Gamepad2 size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Ludex ピコ~</h1>
        <p className="mt-2 text-sm text-ludex-muted">Carregando sessão...</p>
      </div>
    </main>
  );
}

function LibraryDashboard() {
  const { user, logout } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [games, setGames] = useState<UserGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [activePlatformSlug, setActivePlatformSlug] = useState("all");
  const [activeView, setActiveView] = useState<ActiveView>("library");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeSessions, setActiveSessions] = useState<Record<number, number>>({});
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isLaunchingGameId, setIsLaunchingGameId] = useState<number | null>(null);
  const [isRevealingGameId, setIsRevealingGameId] = useState<number | null>(null);
  const [steamScanner, setSteamScanner] = useState<SteamScannerState>(
    initialSteamScannerState
  );

  const selectedGame =
    games.find((game) => game.id === selectedGameId) ?? games[0] ?? null;

  const filteredGames = useMemo(() => {
    if (activePlatformSlug === "all") {
      return games;
    }

    if (activePlatformSlug === "favorites") {
      return games.filter((game) => game.is_favorite);
    }

    return games.filter((game) => game.platform?.slug === activePlatformSlug);
  }, [activePlatformSlug, games]);

  const favoriteCount = games.filter((game) => game.is_favorite).length;

  const loadLibrary = async () => {
    setError(null);
    const [loadedPlatforms, loadedGames] = await Promise.all([
      ludexApi.platforms(),
      ludexApi.userGames()
    ]);
    setPlatforms(loadedPlatforms);
    setGames(loadedGames);
    setSelectedGameId((currentId) => currentId ?? loadedGames[0]?.id ?? null);
  };

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    loadLibrary()
      .catch((requestError: Error) => {
        if (isActive) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSyncMock() {
    setIsSyncing(true);
    setError(null);
    setNotice(null);

    try {
      const response = await ludexApi.syncDetectedGames(mockSyncGames);
      await loadLibrary();
      setNotice(`${response.synced} jogos sincronizados pelo mock.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível sincronizar os jogos mockados."
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function scanSteamGames() {
    setSteamScanner((current) => ({
      ...current,
      status: "loading",
      error: null,
      notice: null
    }));

    try {
      const result = await desktopCommands.scanSteamGames();
      setSteamScanner({
        status: "success",
        error: null,
        games: result.games,
        selectedIds: result.games
          .map((game) => game.external_id)
          .filter((externalId): externalId is string => Boolean(externalId)),
        libraries: result.libraries.map((library) => library.path),
        steamPath: result.steam_path,
        notice: `${result.games.length} jogos Steam encontrados.`
      });
    } catch (requestError) {
      setSteamScanner((current) => ({
        ...current,
        status: "error",
        error:
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível escanear a Steam.",
        notice: null
      }));
    }
  }

  async function importSelectedSteamGames() {
    const selectedGames = steamScanner.games.filter(
      (game) => game.external_id && steamScanner.selectedIds.includes(game.external_id)
    );

    if (selectedGames.length === 0) {
      setSteamScanner((current) => ({
        ...current,
        error: "Selecione pelo menos um jogo Steam para importar."
      }));
      return;
    }

    setSteamScanner((current) => ({
      ...current,
      status: "importing",
      error: null,
      notice: null
    }));

    try {
      const response = await ludexApi.syncSteamGames(
        selectedGames.map(steamGameToSyncGame)
      );
      await loadLibrary();
      setActiveView("library");
      setSteamScanner((current) => ({
        ...current,
        status: "success",
        error: null,
        notice: `${response.synced} jogos Steam importados para a biblioteca.`
      }));
      setNotice(`${response.synced} jogos Steam importados.`);
    } catch (requestError) {
      setSteamScanner((current) => ({
        ...current,
        status: "error",
        error:
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível importar os jogos Steam.",
        notice: null
      }));
    }
  }

  function toggleSteamSelection(externalId: string) {
    setSteamScanner((current) => {
      const selectedIds = current.selectedIds.includes(externalId)
        ? current.selectedIds.filter((id) => id !== externalId)
        : [...current.selectedIds, externalId];

      return {
        ...current,
        selectedIds
      };
    });
  }

  async function handleAddManualGame(draft: {
    name: string;
    executablePath: string;
    libraryPath?: string;
  }) {
    setError(null);
    setNotice(null);

    const validation = await desktopCommands.validateExecutablePath(draft.executablePath);
    const manualGame = buildManualSyncGame({
      name: draft.name,
      executablePath: validation.executable_path,
      libraryPath: draft.libraryPath || validation.install_path
    });
    const response = await ludexApi.syncManualGame(manualGame);
    await loadLibrary();

    setSelectedGameId(response.data[0]?.id ?? null);
    setNotice(`${response.synced} jogo manual adicionado à biblioteca.`);
  }

  async function toggleFavorite(userGame: UserGame) {
    setError(null);

    try {
      const updatedGame = userGame.is_favorite
        ? await ludexApi.unfavoriteUserGame(userGame.id)
        : await ludexApi.favoriteUserGame(userGame.id);
      replaceUserGame(updatedGame);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível atualizar o favorito."
      );
    }
  }

  async function finishSession(userGame: UserGame) {
    setError(null);

    try {
      const result = await ludexApi.finishPlaySession(
        userGame.id,
        activeSessions[userGame.id]
      );
      replaceUserGame(result.userGame);
      setActiveSessions((sessions) => {
        const nextSessions = { ...sessions };
        delete nextSessions[userGame.id];
        return nextSessions;
      });
      setNotice(`Sessão finalizada para ${gameName(result.userGame)}.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível finalizar a sessão."
      );
    }
  }

  async function launchGame(userGame: UserGame) {
    setError(null);
    setNotice(null);

    if (!userGame.executable_path?.trim()) {
      setError("O jogo selecionado não tem um executável local salvo.");
      return;
    }

    setIsLaunchingGameId(userGame.id);

    try {
      await desktopCommands.launchGame(userGame.executable_path);
      const session = await ludexApi.startPlaySession(userGame.id);
      setActiveSessions((sessions) => ({
        ...sessions,
        [userGame.id]: session.id
      }));
      setNotice(`Jogo iniciado pelo Ludex: ${gameName(userGame)}.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível abrir o jogo."
      );
    } finally {
      setIsLaunchingGameId(null);
    }
  }

  async function revealGameFolder(userGame: UserGame) {
    setError(null);
    setNotice(null);

    const path = userGame.install_path || userGame.executable_path;
    if (!path?.trim()) {
      setError("O jogo selecionado não tem uma pasta local salva.");
      return;
    }

    setIsRevealingGameId(userGame.id);

    try {
      await desktopCommands.revealGameInFolder(path);
      setNotice(`Pasta aberta para ${gameName(userGame)}.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível abrir a pasta do jogo."
      );
    } finally {
      setIsRevealingGameId(null);
    }
  }

  function replaceUserGame(updatedGame: UserGame) {
    setGames((currentGames) =>
      currentGames.map((game) => (game.id === updatedGame.id ? updatedGame : game))
    );
  }

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
                  activeView === item.key
                    ? "bg-white/10 text-white shadow-neon"
                    : "text-ludex-muted hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => {
                  setActiveView(item.key);
                  if (item.key === "favorites") {
                    setActivePlatformSlug("favorites");
                  }
                }}
                type="button"
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-ludex-cyan/20 bg-ludex-panel/80 p-4">
            <p className="text-xs uppercase text-ludex-muted">API Laravel</p>
            <p className="mt-2 text-sm text-white">
              {user?.name ?? "Jogador"} conectado. Offline fica para uma fase futura.
            </p>
            <button
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-ludex-muted transition hover:bg-white/15 hover:text-white"
              onClick={logout}
              type="button"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        <section className="flex flex-1 flex-col px-8 py-7">
          <header className="flex items-center justify-between gap-5">
            <div>
              <p className="text-sm text-ludex-cyan">Windows MVP client</p>
              <h2 className="mt-1 text-3xl font-semibold">All Games</h2>
            </div>
            <div className="flex min-w-80 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <Search size={18} className="text-ludex-muted" />
              <span className="text-sm text-ludex-muted">Search library</span>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-[minmax(0,1fr)_380px] gap-6">
            <section>
              {activeView === "scanner" ? (
                <SteamScannerPanel
                  onImportSelected={importSelectedSteamGames}
                  onScan={scanSteamGames}
                  onToggleSelection={toggleSteamSelection}
                  state={steamScanner}
                />
              ) : (
                <>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      activePlatformSlug === "all"
                        ? "bg-ludex-cyan text-ludex-ink"
                        : "bg-white/5 text-ludex-muted hover:bg-white/10"
                    }`}
                    onClick={() => setActivePlatformSlug("all")}
                    type="button"
                  >
                    Todos
                  </button>
                  <button
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      activePlatformSlug === "favorites"
                        ? "bg-ludex-cyan text-ludex-ink"
                        : "bg-white/5 text-ludex-muted hover:bg-white/10"
                    }`}
                    onClick={() => setActivePlatformSlug("favorites")}
                    type="button"
                  >
                    Favoritos ({favoriteCount})
                  </button>
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        activePlatformSlug === platform.slug
                          ? "bg-ludex-cyan text-ludex-ink"
                          : "bg-white/5 text-ludex-muted hover:bg-white/10"
                      }`}
                      onClick={() => setActivePlatformSlug(platform.slug)}
                      type="button"
                    >
                      {platform.name}
                    </button>
                  ))}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    className="flex items-center gap-2 rounded-full bg-ludex-violet px-4 py-2 text-sm font-medium text-white shadow-neon transition hover:-translate-y-0.5"
                    onClick={() => setIsManualModalOpen(true)}
                    type="button"
                  >
                    <FilePlus size={16} />
                    Adicionar jogo manual
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-full bg-ludex-pink px-4 py-2 text-sm font-medium text-white shadow-neon transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSyncing}
                    onClick={handleSyncMock}
                    type="button"
                  >
                    <Radar size={16} />
                    {isSyncing ? "Sincronizando..." : "Sync mock"}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="mb-4 rounded-2xl border border-ludex-pink/30 bg-ludex-pink/10 p-4 text-sm text-pink-100">
                  {error}
                </div>
              ) : null}

              {notice ? (
                <div className="mb-4 rounded-2xl border border-ludex-cyan/30 bg-ludex-cyan/10 p-4 text-sm text-cyan-100">
                  {notice}
                </div>
              ) : null}

              {isLoading ? (
                <div className="rounded-2xl border border-white/10 bg-ludex-panel/85 p-8 text-ludex-muted">
                  Carregando biblioteca...
                </div>
              ) : filteredGames.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-ludex-panel/85 p-8">
                  <h3 className="text-xl font-semibold text-white">Biblioteca vazia</h3>
                  <p className="mt-2 text-sm text-ludex-muted">
                    Use o Sync mock para enviar jogos de teste para a API Laravel.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="flex items-center gap-2 rounded-xl bg-ludex-violet px-4 py-3 text-sm font-medium text-white shadow-neon"
                      onClick={() => setIsManualModalOpen(true)}
                      type="button"
                    >
                      <FilePlus size={16} />
                      Adicionar jogo manual
                    </button>
                    <button
                      className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                      onClick={handleSyncMock}
                      type="button"
                    >
                      <RefreshCcw size={16} />
                      Importar jogos mockados
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                  {filteredGames.map((userGame) => (
                    <article
                      key={userGame.id}
                      className={`group rounded-2xl border bg-ludex-panel/85 p-4 transition hover:-translate-y-0.5 hover:border-ludex-cyan/40 hover:shadow-neon ${
                        selectedGame?.id === userGame.id
                          ? "border-ludex-cyan/50"
                          : "border-white/10"
                      }`}
                    >
                      {userGame.game?.cover_url ? (
                        <img
                          alt=""
                          className="h-28 w-full rounded-xl object-cover"
                          src={userGame.game.cover_url}
                        />
                      ) : (
                        <div className="h-28 rounded-xl bg-gradient-to-br from-ludex-violet via-ludex-pink to-ludex-cyan" />
                      )}
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-medium text-white">
                            {gameName(userGame)}
                          </h3>
                          <p className="mt-1 text-xs text-ludex-muted">
                            {platformName(userGame)}
                          </p>
                        </div>
                        <button
                          aria-label={
                            userGame.is_favorite
                              ? "Remover dos favoritos"
                              : "Adicionar aos favoritos"
                          }
                          className={`grid h-9 w-9 place-items-center rounded-full transition ${
                            userGame.is_favorite
                              ? "bg-ludex-pink text-white"
                              : "bg-white/10 text-ludex-cyan group-hover:bg-ludex-cyan group-hover:text-ludex-ink"
                          }`}
                          onClick={() => toggleFavorite(userGame)}
                          type="button"
                        >
                          <Heart
                            fill={userGame.is_favorite ? "currentColor" : "none"}
                            size={16}
                          />
                        </button>
                      </div>
                      <p className="mt-3 truncate text-xs text-ludex-muted">
                        {userGame.install_path}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-ludex-muted">
                        <span>{formatPlaytime(userGame.total_playtime_seconds)}</span>
                        <button
                          className="rounded-lg bg-white/10 px-3 py-2 text-white transition hover:bg-white/15"
                          onClick={() => setSelectedGameId(userGame.id)}
                          type="button"
                        >
                          Detalhes
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
                </>
              )}
            </section>

            <GameDetailsPanel
              activeSessionId={selectedGame ? activeSessions[selectedGame.id] : undefined}
              isLaunching={selectedGame?.id === isLaunchingGameId}
              isRevealing={selectedGame?.id === isRevealingGameId}
              game={selectedGame}
              onFinishSession={finishSession}
              onLaunchGame={launchGame}
              onRevealFolder={revealGameFolder}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        </section>
      </div>
      <ManualGameModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={handleAddManualGame}
      />
    </main>
  );
}

function GameDetailsPanel({
  activeSessionId,
  game,
  isLaunching,
  isRevealing,
  onFinishSession,
  onLaunchGame,
  onRevealFolder,
  onToggleFavorite
}: {
  activeSessionId?: number;
  game: UserGame | null;
  isLaunching: boolean;
  isRevealing: boolean;
  onFinishSession: (game: UserGame) => void;
  onLaunchGame: (game: UserGame) => void;
  onRevealFolder: (game: UserGame) => void;
  onToggleFavorite: (game: UserGame) => void;
}) {
  if (!game) {
    return (
      <aside className="rounded-2xl border border-white/10 bg-black/25 p-5">
        <div className="grid h-full min-h-96 place-items-center text-center text-ludex-muted">
          <div>
            <Sparkles className="mx-auto text-ludex-pink" size={24} />
            <p className="mt-3 text-sm">Nenhum jogo selecionado.</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border border-white/10 bg-black/25 p-5">
      {game.game?.cover_url ? (
        <img
          alt=""
          className="h-44 w-full rounded-2xl object-cover"
          src={game.game.cover_url}
        />
      ) : (
        <div className="h-44 rounded-2xl bg-gradient-to-br from-ludex-violet via-ludex-pink to-ludex-cyan" />
      )}
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="break-words text-2xl font-semibold">{gameName(game)}</h3>
          <p className="mt-1 text-sm text-ludex-muted">{platformName(game)}</p>
        </div>
        <button
          aria-label={
            game.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
            game.is_favorite
              ? "bg-ludex-pink text-white"
              : "bg-white/10 text-ludex-cyan"
          }`}
          onClick={() => onToggleFavorite(game)}
          type="button"
        >
          <Heart fill={game.is_favorite ? "currentColor" : "none"} size={18} />
        </button>
      </div>

      <dl className="mt-6 space-y-4 text-sm">
        <DetailRow label="Install path" value={game.install_path} />
        <DetailRow label="Executable" value={game.executable_path} />
        <DetailRow label="Source" value={game.source} />
        <DetailRow label="External ID" value={game.external_id ?? "Sem ID externo"} />
        <DetailRow label="Play time" value={formatPlaytime(game.total_playtime_seconds)} />
        <DetailRow label="Last played" value={formatDate(game.last_played_at)} />
      </dl>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase text-ludex-muted">Metadata</p>
        <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-ludex-text">
          {JSON.stringify(game.metadata ?? {}, null, 2)}
        </pre>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-ludex-violet px-4 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={Boolean(activeSessionId) || isLaunching}
          onClick={() => onLaunchGame(game)}
          type="button"
        >
          <Play size={16} />
          {isLaunching ? "Abrindo..." : "Jogar"}
        </button>
        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRevealing}
          onClick={() => onRevealFolder(game)}
          type="button"
        >
          <FolderOpen size={16} />
          {isRevealing ? "Abrindo..." : "Abrir pasta"}
        </button>
        <button
          className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!activeSessionId}
          onClick={() => onFinishSession(game)}
          type="button"
        >
          <Square size={16} />
          Finalizar
        </button>
      </div>
    </aside>
  );
}

function SteamScannerPanel({
  onImportSelected,
  onScan,
  onToggleSelection,
  state
}: {
  onImportSelected: () => void;
  onScan: () => void;
  onToggleSelection: (externalId: string) => void;
  state: SteamScannerState;
}) {
  const isBusy = state.status === "loading" || state.status === "importing";

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ludex-cyan">SteamScanner</p>
          <h3 className="mt-1 text-2xl font-semibold">Escanear Steam</h3>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 rounded-full bg-ludex-pink px-4 py-2 text-sm font-medium text-white shadow-neon transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
            onClick={onScan}
            type="button"
          >
            <Radar size={16} />
            {state.status === "loading" ? "Escaneando..." : "Escanear Steam"}
          </button>
          <button
            className="flex items-center gap-2 rounded-full bg-ludex-violet px-4 py-2 text-sm font-medium text-white shadow-neon transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy || state.selectedIds.length === 0}
            onClick={onImportSelected}
            type="button"
          >
            <Check size={16} />
            {state.status === "importing"
              ? "Importando..."
              : `Importar selecionados (${state.selectedIds.length})`}
          </button>
        </div>
      </div>

      {state.error ? (
        <div className="mb-4 rounded-2xl border border-ludex-pink/30 bg-ludex-pink/10 p-4 text-sm text-pink-100">
          {state.error}
        </div>
      ) : null}

      {state.notice ? (
        <div className="mb-4 rounded-2xl border border-ludex-cyan/30 bg-ludex-cyan/10 p-4 text-sm text-cyan-100">
          {state.notice}
        </div>
      ) : null}

      {state.status === "idle" ? (
        <div className="rounded-2xl border border-white/10 bg-ludex-panel/85 p-8">
          <h4 className="text-xl font-semibold text-white">Pronto para ler a Steam</h4>
          <p className="mt-2 text-sm text-ludex-muted">
            O Ludex vai procurar a instalação da Steam, ler `libraryfolders.vdf` e
            os `appmanifest_*.acf` das bibliotecas encontradas.
          </p>
        </div>
      ) : null}

      {state.status === "loading" ? (
        <div className="rounded-2xl border border-white/10 bg-ludex-panel/85 p-8 text-ludex-muted">
          Procurando Steam e lendo manifests...
        </div>
      ) : null}

      {state.games.length > 0 ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="text-ludex-muted">Steam</p>
            <p className="mt-1 break-words text-white">
              {state.steamPath ?? "Caminho não informado"}
            </p>
            <p className="mt-3 text-ludex-muted">Bibliotecas encontradas</p>
            <div className="mt-2 space-y-1">
              {state.libraries.map((library) => (
                <p key={library} className="break-words text-xs text-ludex-text">
                  {library}
                </p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            {state.games.map((game) => {
              const externalId = game.external_id ?? game.name;
              const isSelected =
                Boolean(game.external_id) && state.selectedIds.includes(externalId);

              return (
                <article
                  className={`rounded-2xl border bg-ludex-panel/85 p-4 transition ${
                    isSelected ? "border-ludex-cyan/50" : "border-white/10"
                  }`}
                  key={`${game.external_id}-${game.install_path}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate font-medium text-white">{game.name}</h4>
                      <p className="mt-1 text-xs text-ludex-muted">
                        AppID {game.external_id ?? "desconhecido"}
                      </p>
                    </div>
                    <button
                      aria-label={isSelected ? "Remover da importação" : "Selecionar para importação"}
                      className={`grid h-9 w-9 place-items-center rounded-full transition ${
                        isSelected
                          ? "bg-ludex-cyan text-ludex-ink"
                          : "bg-white/10 text-ludex-muted hover:text-white"
                      }`}
                      disabled={!game.external_id}
                      onClick={() => onToggleSelection(externalId)}
                      type="button"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                  <p className="mt-3 truncate text-xs text-ludex-muted">
                    {game.install_path}
                  </p>
                  <p className="mt-2 truncate text-xs text-ludex-muted">
                    {game.metadata.manifest_path}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ManualGameModal({
  isOpen,
  onClose,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (draft: {
    name: string;
    executablePath: string;
    libraryPath?: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [executablePath, setExecutablePath] = useState("");
  const [libraryPath, setLibraryPath] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  async function selectExecutable() {
    setError(null);
    setIsSelecting(true);

    try {
      const selected = await desktopCommands.selectManualExecutable();
      if (!selected) {
        return;
      }

      setExecutablePath(selected.executable_path);
      setLibraryPath((currentPath) => currentPath || selected.install_path);
      setName((currentName) => currentName || selected.suggested_name);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível selecionar o executável."
      );
    } finally {
      setIsSelecting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Informe o nome do jogo.");
      return;
    }

    if (!executablePath.trim()) {
      setError("Selecione ou informe um executável .exe.");
      return;
    }

    if (!isWindowsExecutablePath(executablePath)) {
      setError("Selecione um arquivo .exe válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        executablePath,
        libraryPath: libraryPath || undefined
      });
      setName("");
      setExecutablePath("");
      setLibraryPath("");
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível adicionar o jogo manual."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-6 backdrop-blur-sm">
      <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-ludex-panel p-6 shadow-neon">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ludex-cyan">ManualScanner</p>
            <h3 className="mt-1 text-2xl font-semibold">Adicionar jogo manual</h3>
          </div>
          <button
            aria-label="Fechar"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-ludex-muted transition hover:bg-white/15 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="text-ludex-muted">Nome do jogo</span>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ludex-cyan"
              onChange={(event) => setName(event.target.value)}
              placeholder="Meu Jogo"
              value={name}
            />
          </label>

          <label className="block text-sm">
            <span className="text-ludex-muted">Caminho do executável</span>
            <div className="mt-2 flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ludex-cyan"
                onBlur={() => {
                  if (!name.trim() && executablePath.trim()) {
                    setName(deriveGameName(executablePath));
                  }
                }}
                onChange={(event) => setExecutablePath(event.target.value)}
                placeholder="D:\\Games\\Meu Jogo\\game.exe"
                value={executablePath}
              />
              <button
                className="flex shrink-0 items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSelecting}
                onClick={selectExecutable}
                type="button"
              >
                <FolderOpen size={16} />
                {isSelecting ? "Selecionando..." : "Selecionar .exe"}
              </button>
            </div>
          </label>

          <label className="block text-sm">
            <span className="text-ludex-muted">Pasta/biblioteca opcional</span>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ludex-cyan"
              onChange={(event) => setLibraryPath(event.target.value)}
              placeholder="D:\\Games\\Meu Jogo"
              value={libraryPath}
            />
          </label>

          <div className="rounded-xl border border-ludex-cyan/20 bg-ludex-cyan/10 px-4 py-3 text-sm text-cyan-100">
            Plataforma: Manual. O Ludex só enviará este executável após sua confirmação.
          </div>

          {error ? (
            <p className="rounded-xl border border-ludex-pink/30 bg-ludex-pink/10 px-4 py-3 text-sm text-pink-100">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-xl bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/15"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="flex items-center gap-2 rounded-xl bg-ludex-violet px-4 py-3 text-sm font-medium text-white shadow-neon transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              <FilePlus size={16} />
              {isSubmitting ? "Adicionando..." : "Adicionar à biblioteca"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-ludex-muted">{label}</dt>
      <dd className="break-words text-white">{value}</dd>
    </div>
  );
}

function AuthGate() {
  const { status } = useAuth();

  if (status === "checking") {
    return <LoadingSplash />;
  }

  if (status === "guest") {
    return <AuthScreen />;
  }

  return <LibraryDashboard />;
}

export function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
