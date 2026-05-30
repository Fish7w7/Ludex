import { useEffect, useMemo, useState } from "react";
import { ludexApi } from "./api/ludexApi";
import { AppShell } from "./components/layout/AppShell";
import {
  designPreviewGames,
  designPreviewPlatforms,
  isDesignPreviewEnabled,
  isDesignPreviewGame
} from "./data/designPreviewGames";
import { mockSyncGames } from "./data/mockSyncGames";
import { AuthProvider, useAuth } from "./features/auth/AuthProvider";
import { AuthScreen } from "./features/auth/AuthScreen";
import { LoadingSplash } from "./features/auth/LoadingSplash";
import { LibraryView } from "./features/library/LibraryView";
import {
  buildManualSyncGame
} from "./features/manual/manualGame";
import { ManualGameModal } from "./features/manual/ManualGameModal";
import {
  epicGameSelectionId,
  epicGameToSyncGame
} from "./features/scanner/epicScanner";
import { ScannerView } from "./features/scanner/ScannerView";
import { steamGameToSyncGame } from "./features/scanner/steamScanner";
import { SettingsView } from "./features/settings/SettingsView";
import { desktopCommands } from "./lib/desktopCommands";
import { gameName, platformKey, platformName } from "./lib/gameUtils";
import type { Platform, UserGame } from "./types/api";
import type { ActiveView, EpicScannerState, SteamScannerState } from "./types/ui";

const showDevSyncMock = import.meta.env.DEV;

const initialSteamScannerState: SteamScannerState = {
  status: "idle",
  error: null,
  games: [],
  selectedIds: [],
  libraries: [],
  steamPath: null,
  notice: null
};

const initialEpicScannerState: EpicScannerState = {
  status: "idle",
  error: null,
  games: [],
  selectedIds: [],
  manifestsPath: null,
  manifestsFound: 0,
  ignoredManifests: 0,
  notice: null
};

function LibraryDashboard() {
  const { user, logout } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [games, setGames] = useState<UserGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeView, setActiveView] = useState<ActiveView>("library");
  const [search, setSearch] = useState("");
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
  const [epicScanner, setEpicScanner] = useState<EpicScannerState>(
    initialEpicScannerState
  );
  const libraryGames = isDesignPreviewEnabled ? designPreviewGames : games;
  const libraryPlatforms = isDesignPreviewEnabled ? designPreviewPlatforms : platforms;

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();

    return libraryGames.filter((game) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "favorites" && game.is_favorite) ||
        platformKey(game) === activeFilter ||
        game.platform?.slug === activeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [gameName(game), platformName(game), game.install_path, game.executable_path]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    });
  }, [activeFilter, libraryGames, search]);

  const selectedGame =
    libraryGames.find((game) => game.id === selectedGameId) ?? filteredGames[0] ?? null;
  const favoriteCount = libraryGames.filter((game) => game.is_favorite).length;

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

  function changeView(view: ActiveView) {
    setActiveView(view);
    if (view === "favorites") {
      setActiveFilter("favorites");
    }
  }

  async function handleSyncMock() {
    setIsSyncing(true);
    setError(null);
    setNotice(null);

    try {
      const response = await ludexApi.syncDetectedGames(mockSyncGames);
      await loadLibrary();
      setSelectedGameId(response.data[0]?.id ?? null);
      setNotice(`${response.synced} jogos sincronizados pelo mock de desenvolvimento.`);
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

    if (isDesignPreviewGame(userGame)) {
      setNotice("Design preview: favoritos mockados não alteram a API.");
      return;
    }

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

  async function launchGame(userGame: UserGame) {
    setError(null);
    setNotice(null);

    if (isDesignPreviewGame(userGame)) {
      setNotice("Design preview: o botão Jogar é apenas visual neste modo.");
      return;
    }

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
      setNotice(`Sessão iniciada para ${gameName(userGame)}.`);
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

  async function finishSession(userGame: UserGame) {
    setError(null);

    if (isDesignPreviewGame(userGame)) {
      setNotice("Design preview: sessão mockada não altera a API.");
      return;
    }

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

  async function revealGameFolder(userGame: UserGame) {
    setError(null);
    setNotice(null);

    if (isDesignPreviewGame(userGame)) {
      setNotice("Design preview: abertura de pasta fica desativada para mocks visuais.");
      return;
    }

    const localPath = userGame.install_path || userGame.executable_path;
    if (!localPath?.trim()) {
      setError("O jogo selecionado não tem uma pasta local salva.");
      return;
    }

    setIsRevealingGameId(userGame.id);

    try {
      await desktopCommands.revealGameInFolder(localPath);
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
      setSelectedGameId(response.data[0]?.id ?? null);
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
    setSteamScanner((current) => ({
      ...current,
      selectedIds: current.selectedIds.includes(externalId)
        ? current.selectedIds.filter((id) => id !== externalId)
        : [...current.selectedIds, externalId]
    }));
  }

  async function scanEpicGames() {
    setEpicScanner((current) => ({
      ...current,
      status: "loading",
      error: null,
      notice: null
    }));

    try {
      const result = await desktopCommands.scanEpicGames();
      setEpicScanner({
        status: "success",
        error: null,
        games: result.games,
        selectedIds: result.games.map(epicGameSelectionId),
        manifestsPath: result.manifests_path,
        manifestsFound: result.manifests_found,
        ignoredManifests: result.ignored_manifests,
        notice: `${result.games.length} jogos Epic Games encontrados.`
      });
    } catch (requestError) {
      setEpicScanner((current) => ({
        ...current,
        status: "error",
        error:
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível escanear a Epic Games.",
        notice: null
      }));
    }
  }

  async function importSelectedEpicGames() {
    const selectedGames = epicScanner.games.filter((game) =>
      epicScanner.selectedIds.includes(epicGameSelectionId(game))
    );

    if (selectedGames.length === 0) {
      setEpicScanner((current) => ({
        ...current,
        error: "Selecione pelo menos um jogo Epic Games para importar."
      }));
      return;
    }

    setEpicScanner((current) => ({
      ...current,
      status: "importing",
      error: null,
      notice: null
    }));

    try {
      const response = await ludexApi.syncEpicGames(
        selectedGames.map(epicGameToSyncGame)
      );
      await loadLibrary();
      setActiveView("library");
      setSelectedGameId(response.data[0]?.id ?? null);
      setEpicScanner((current) => ({
        ...current,
        status: "success",
        error: null,
        notice: `${response.synced} jogos Epic Games importados para a biblioteca.`
      }));
      setNotice(`${response.synced} jogos Epic Games importados.`);
    } catch (requestError) {
      setEpicScanner((current) => ({
        ...current,
        status: "error",
        error:
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível importar os jogos Epic Games.",
        notice: null
      }));
    }
  }

  function toggleEpicSelection(selectionId: string) {
    setEpicScanner((current) => ({
      ...current,
      selectedIds: current.selectedIds.includes(selectionId)
        ? current.selectedIds.filter((id) => id !== selectionId)
        : [...current.selectedIds, selectionId]
    }));
  }

  function replaceUserGame(updatedGame: UserGame) {
    setGames((currentGames) =>
      currentGames.map((game) => (game.id === updatedGame.id ? updatedGame : game))
    );
  }

  const heading =
    activeView === "scanner"
      ? "Scanners"
      : activeView === "settings"
        ? "Settings"
        : activeView === "favorites"
          ? "Favorites"
          : "Library";

  const subtitle =
    activeView === "scanner"
      ? "Importação segura"
      : activeView === "settings"
        ? "Preferências do Ludex"
        : "Japanese cyber arcade launcher";

  return (
    <AppShell
      activeView={activeView}
      heading={heading}
      onLogout={logout}
      onSearch={setSearch}
      onViewChange={changeView}
      search={search}
      showSearch={activeView === "library" || activeView === "favorites"}
      subtitle={subtitle}
      user={user}
    >
      {activeView === "scanner" ? (
        <ScannerView
          epicState={epicScanner}
          onAddManual={() => setIsManualModalOpen(true)}
          onImportEpic={importSelectedEpicGames}
          onImportSteam={importSelectedSteamGames}
          onScanEpic={scanEpicGames}
          onScanSteam={scanSteamGames}
          onToggleEpic={toggleEpicSelection}
          onToggleSteam={toggleSteamSelection}
          steamState={steamScanner}
        />
      ) : activeView === "settings" ? (
        <SettingsView />
      ) : (
        <LibraryView
          activeFilter={activeFilter}
          activeSessions={activeSessions}
          epicState={epicScanner}
          error={error}
          favoriteCount={favoriteCount}
          filteredGames={filteredGames}
          isLaunchingGameId={isLaunchingGameId}
          isLoading={isLoading}
          isRevealingGameId={isRevealingGameId}
          isSyncing={isSyncing}
          notice={notice}
          onAddManual={() => setIsManualModalOpen(true)}
          onFilterChange={setActiveFilter}
          onFinishSession={finishSession}
          onLaunchGame={launchGame}
          onRevealFolder={revealGameFolder}
          onScanEpic={scanEpicGames}
          onScanSteam={scanSteamGames}
          onSelectGame={setSelectedGameId}
          onSyncMock={handleSyncMock}
          onToggleFavorite={toggleFavorite}
          platforms={libraryPlatforms}
          selectedGame={selectedGame}
          showDevSync={showDevSyncMock}
          steamState={steamScanner}
        />
      )}

      <ManualGameModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={handleAddManualGame}
      />
    </AppShell>
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
