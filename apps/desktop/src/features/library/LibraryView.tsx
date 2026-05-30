import type { ReactNode } from "react";
import { FilePlus, Gamepad2, Lock, Radar, RefreshCcw } from "lucide-react";
import { EmptyState, NoticeBanner, PrimaryButton, SecondaryButton } from "../../components/ui";
import type { Platform, UserGame } from "../../types/api";
import type { EpicScannerState, SteamScannerState } from "../../types/ui";
import { GameCard } from "./GameCard";
import { GameDetailsPanel } from "./GameDetailsPanel";
import { PlatformFilter } from "./PlatformFilter";

export function LibraryView({
  activeFilter,
  activeSessions,
  epicState,
  error,
  favoriteCount,
  filteredGames,
  isLaunchingGameId,
  isLoading,
  isRevealingGameId,
  isSyncing,
  notice,
  onAddManual,
  onFilterChange,
  onFinishSession,
  onLaunchGame,
  onRevealFolder,
  onScanEpic,
  onScanSteam,
  onSelectGame,
  onSyncMock,
  onToggleFavorite,
  platforms,
  selectedGame,
  showDevSync,
  steamState
}: {
  activeFilter: string;
  activeSessions: Record<number, number>;
  epicState: EpicScannerState;
  error: string | null;
  favoriteCount: number;
  filteredGames: UserGame[];
  isLaunchingGameId: number | null;
  isLoading: boolean;
  isRevealingGameId: number | null;
  isSyncing: boolean;
  notice: string | null;
  onAddManual: () => void;
  onFilterChange: (filter: string) => void;
  onFinishSession: (game: UserGame) => void;
  onLaunchGame: (game: UserGame) => void;
  onRevealFolder: (game: UserGame) => void;
  onScanEpic: () => void;
  onScanSteam: () => void;
  onSelectGame: (id: number) => void;
  onSyncMock: () => void;
  onToggleFavorite: (game: UserGame) => void;
  platforms: Platform[];
  selectedGame: UserGame | null;
  showDevSync: boolean;
  steamState: SteamScannerState;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="min-w-0">
        <div className="mb-5 flex items-center justify-between gap-4">
          <PlatformFilter
            activeFilter={activeFilter}
            favoriteCount={favoriteCount}
            onChange={onFilterChange}
            platforms={platforms}
          />
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-ludex-text xl:inline-flex">
              <Gamepad2 size={16} />
              {filteredGames.length} jogos
            </div>
            {showDevSync ? (
              <SecondaryButton
                className="px-4 py-2.5"
                onClick={onSyncMock}
                disabled={isSyncing}
                title="Recurso de desenvolvimento: envia jogos mockados para testar a API."
              >
                <RefreshCcw size={16} />
                {isSyncing ? "Sincronizando..." : "Dev sync mock"}
              </SecondaryButton>
            ) : null}
            <PrimaryButton className="px-4 py-2.5" onClick={onAddManual}>
              <FilePlus size={16} />
              Adicionar jogo
            </PrimaryButton>
          </div>
        </div>

        {error ? <NoticeBanner tone="error">{error}</NoticeBanner> : null}
        {notice ? <NoticeBanner tone="success">{notice}</NoticeBanner> : null}

        <div className="mt-5">
          {isLoading ? (
            <div className="rounded-2xl border border-white/10 bg-ludex-panel/80 p-8 text-ludex-muted shadow-neon">
              Carregando biblioteca...
            </div>
          ) : filteredGames.length === 0 ? (
            <EmptyState
              action={
                <PrimaryButton onClick={onAddManual}>
                  <FilePlus size={16} />
                  Adicionar primeiro jogo
                </PrimaryButton>
              }
              description="Adicione um executável manualmente, importe da Steam/Epic ou use o sync mock apenas para desenvolvimento."
              title="Sua biblioteca ainda está vazia"
            />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(178px,1fr))] gap-4">
              {filteredGames.map((userGame) => (
                <GameCard
                  isSelected={selectedGame?.id === userGame.id}
                  key={userGame.id}
                  onSelect={onSelectGame}
                  onToggleFavorite={onToggleFavorite}
                  userGame={userGame}
                />
              ))}
            </div>
          )}
        </div>

        <LibraryScannerStrip
          epicState={epicState}
          gameCount={filteredGames.length}
          onAddManual={onAddManual}
          onScanEpic={onScanEpic}
          onScanSteam={onScanSteam}
          steamState={steamState}
        />
      </section>

      <GameDetailsPanel
        activeSessionId={selectedGame ? activeSessions[selectedGame.id] : undefined}
        game={selectedGame}
        isLaunching={selectedGame?.id === isLaunchingGameId}
        isRevealing={selectedGame?.id === isRevealingGameId}
        onFinishSession={onFinishSession}
        onLaunchGame={onLaunchGame}
        onRevealFolder={onRevealFolder}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}

function LibraryScannerStrip({
  epicState,
  gameCount,
  onAddManual,
  onScanEpic,
  onScanSteam,
  steamState
}: {
  epicState: EpicScannerState;
  gameCount: number;
  onAddManual: () => void;
  onScanEpic: () => void;
  onScanSteam: () => void;
  steamState: SteamScannerState;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">
            Scanners <span className="text-ludex-pink">ピコ~</span>
          </h3>
          <p className="mt-1 text-sm text-ludex-muted">Detecte e importe jogos instalados</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-ludex-text">
          <Gamepad2 size={16} />
          {gameCount} jogos
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <ScannerTile
          actionLabel="Adicionar jogo"
          description="Adicione jogos manualmente selecionando o executável."
          icon={<Gamepad2 size={23} />}
          name="ManualScanner"
          onAction={onAddManual}
          tone="violet"
        />
        <ScannerTile
          actionLabel={steamState.status === "success" ? "Escanear novamente" : "Escanear Steam"}
          description="Escaneia suas bibliotecas da Steam."
          icon={<Radar size={23} />}
          name="SteamScanner"
          onAction={onScanSteam}
          status={scannerLabel(steamState)}
          tone="cyan"
        />
        <ScannerTile
          actionLabel={epicState.status === "success" ? "Escanear novamente" : "Escanear Epic"}
          description="Escaneia jogos instalados pela Epic Games."
          icon={<Radar size={23} />}
          name="EpicScanner"
          onAction={onScanEpic}
          status={scannerLabel(epicState)}
          tone="cyan"
        />
        <ScannerTile
          actionLabel="Em breve"
          description="Suporte ao Xbox / PC Game Pass será adicionado futuramente."
          disabled
          icon={<Lock size={23} />}
          name="XboxScanner"
          status="Em breve"
          tone="muted"
        />
      </div>
    </section>
  );
}

function scannerLabel(state: { status: string; games: unknown[] }) {
  if (state.status === "loading" || state.status === "importing") {
    return "Rodando...";
  }

  if (state.status === "success") {
    return `${state.games.length} encontrados`;
  }

  if (state.status === "error") {
    return "Erro no scan";
  }

  return "Pronto";
}

function ScannerTile({
  actionLabel,
  description,
  disabled = false,
  icon,
  name,
  onAction,
  status,
  tone
}: {
  actionLabel: string;
  description: string;
  disabled?: boolean;
  icon: ReactNode;
  name: string;
  onAction?: () => void;
  status?: string;
  tone: "violet" | "cyan" | "muted";
}) {
  const toneClasses = {
    violet: "text-ludex-violet border-ludex-violet/35 bg-ludex-violet/10",
    cyan: "text-ludex-cyan border-ludex-cyan/35 bg-ludex-cyan/10",
    muted: "text-ludex-muted border-white/10 bg-white/[0.05]"
  }[tone];

  return (
    <article className="flex min-h-[154px] flex-col rounded-2xl border border-white/10 bg-[#101524]/86 p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.2)]">
      <div className={`grid h-10 w-10 place-items-center rounded-2xl border ${toneClasses}`}>
        {icon}
      </div>
      <h4 className="mt-3 font-semibold text-white">{name}</h4>
      {status ? <p className="mt-1 text-xs text-emerald-300">{status}</p> : null}
      <p className="mt-2 text-xs leading-5 text-ludex-muted">{description}</p>
      <SecondaryButton
        className="mt-auto w-full px-3 py-2 text-xs uppercase tracking-wide"
        disabled={disabled}
        onClick={onAction}
      >
        {actionLabel}
      </SecondaryButton>
    </article>
  );
}
