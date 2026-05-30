import type { ReactNode } from "react";
import { Check, FilePlus, Lock, Radar } from "lucide-react";
import { NoticeBanner, PrimaryButton, SecondaryButton, StatusBadge } from "../../components/ui";
import type { EpicDetectedGame, SteamDetectedGame } from "../../lib/desktopCommands";
import type { EpicScannerState, SteamScannerState } from "../../types/ui";
import { epicGameSelectionId } from "./epicScanner";

export function ScannerView({
  epicState,
  onAddManual,
  onImportEpic,
  onImportSteam,
  onScanEpic,
  onScanSteam,
  onToggleEpic,
  onToggleSteam,
  steamState
}: {
  epicState: EpicScannerState;
  onAddManual: () => void;
  onImportEpic: () => void;
  onImportSteam: () => void;
  onScanEpic: () => void;
  onScanSteam: () => void;
  onToggleEpic: (selectionId: string) => void;
  onToggleSteam: (externalId: string) => void;
  steamState: SteamScannerState;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <ScannerSummaryCard
          actionLabel="Adicionar"
          description="Escolha um .exe local e confirme antes de sincronizar."
          icon={<FilePlus size={18} />}
          name="ManualScanner"
          onAction={onAddManual}
          status={<StatusBadge tone="success">ativo</StatusBadge>}
        />
        <ScannerSummaryCard
          actionLabel="Rodar Steam"
          description="Lê libraryfolders.vdf e appmanifest_*.acf."
          icon={<Radar size={18} />}
          name="SteamScanner"
          onAction={onScanSteam}
          status={scannerStatusBadge(steamState)}
        />
        <ScannerSummaryCard
          actionLabel="Rodar Epic"
          description="Lê manifests .item e InstallLocation real."
          icon={<Radar size={18} />}
          name="EpicScanner"
          onAction={onScanEpic}
          status={scannerStatusBadge(epicState)}
        />
        <ScannerSummaryCard
          actionLabel="Futuro"
          description="Game Pass exige uma fase dedicada de segurança."
          disabled
          icon={<Lock size={18} />}
          name="XboxScanner"
          status={<StatusBadge tone="muted">planejado</StatusBadge>}
        />
      </div>

      <SteamScannerPanel
        onImportSelected={onImportSteam}
        onScan={onScanSteam}
        onToggleSelection={onToggleSteam}
        state={steamState}
      />
      <EpicScannerPanel
        onImportSelected={onImportEpic}
        onScan={onScanEpic}
        onToggleSelection={onToggleEpic}
        state={epicState}
      />
    </div>
  );
}

function ScannerSummaryCard({
  actionLabel,
  description,
  disabled = false,
  icon,
  name,
  onAction,
  status
}: {
  actionLabel: string;
  description: string;
  disabled?: boolean;
  icon: ReactNode;
  name: string;
  onAction?: () => void;
  status: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-ludex-panel/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.07] text-ludex-cyan">
          {icon}
        </div>
        {status}
      </div>
      <h3 className="mt-4 font-semibold text-white">{name}</h3>
      <p className="mt-2 min-h-10 text-xs leading-5 text-ludex-muted">{description}</p>
      <SecondaryButton
        className="mt-4 w-full py-2.5"
        disabled={disabled}
        onClick={onAction}
      >
        {actionLabel}
      </SecondaryButton>
    </article>
  );
}

function scannerStatusBadge(state: { status: string; games: unknown[] }) {
  if (state.status === "loading" || state.status === "importing") {
    return <StatusBadge tone="violet">rodando</StatusBadge>;
  }

  if (state.status === "success") {
    return <StatusBadge tone="success">{state.games.length} encontrados</StatusBadge>;
  }

  if (state.status === "error") {
    return <StatusBadge tone="pink">erro</StatusBadge>;
  }

  return <StatusBadge tone="muted">pronto</StatusBadge>;
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
    <ScannerPanel
      description="Procura a instalação da Steam, descobre bibliotecas em múltiplos discos e lista os appmanifest_*.acf encontrados."
      importLabel={`Importar selecionados (${state.selectedIds.length})`}
      isBusy={isBusy}
      onImportSelected={onImportSelected}
      onScan={onScan}
      scanLabel={state.status === "loading" ? "Escaneando..." : "Escanear Steam"}
      title="SteamScanner"
      canImport={state.selectedIds.length > 0}
      error={state.error}
      notice={state.notice}
    >
      {state.status === "loading" ? (
        <LoadingLine text="Procurando Steam e lendo manifests..." />
      ) : null}

      {state.games.length > 0 ? (
        <div className="space-y-4">
          <ScannerMeta
            label="Steam"
            path={state.steamPath ?? "Caminho não informado"}
            details={state.libraries}
          />
          <ResultGrid>
            {state.games.map((game) => (
              <SteamResultCard
                game={game}
                isSelected={
                  game.external_id ? state.selectedIds.includes(game.external_id) : false
                }
                key={`${game.external_id}-${game.install_path}`}
                onToggle={onToggleSelection}
              />
            ))}
          </ResultGrid>
        </div>
      ) : null}
    </ScannerPanel>
  );
}

function EpicScannerPanel({
  onImportSelected,
  onScan,
  onToggleSelection,
  state
}: {
  onImportSelected: () => void;
  onScan: () => void;
  onToggleSelection: (selectionId: string) => void;
  state: EpicScannerState;
}) {
  const isBusy = state.status === "loading" || state.status === "importing";

  return (
    <ScannerPanel
      description="Lê manifests .item da Epic Games e usa InstallLocation para encontrar jogos em qualquer disco."
      importLabel={`Importar Epic (${state.selectedIds.length})`}
      isBusy={isBusy}
      onImportSelected={onImportSelected}
      onScan={onScan}
      scanLabel={state.status === "loading" ? "Escaneando..." : "Escanear Epic Games"}
      title="EpicScanner"
      canImport={state.selectedIds.length > 0}
      error={state.error}
      notice={state.notice}
    >
      {state.status === "loading" ? <LoadingLine text="Lendo manifests da Epic Games..." /> : null}

      {state.games.length > 0 ? (
        <div className="space-y-4">
          <ScannerMeta
            label="Manifests Epic Games"
            path={state.manifestsPath ?? "Caminho não informado"}
            details={[
              `${state.manifestsFound} manifests lidos`,
              `${state.ignoredManifests} ignorados`
            ]}
          />
          <ResultGrid>
            {state.games.map((game) => {
              const selectionId = epicGameSelectionId(game);
              return (
                <EpicResultCard
                  game={game}
                  isSelected={state.selectedIds.includes(selectionId)}
                  key={`${selectionId}-${game.install_path}`}
                  onToggle={onToggleSelection}
                  selectionId={selectionId}
                />
              );
            })}
          </ResultGrid>
        </div>
      ) : null}
    </ScannerPanel>
  );
}

function ScannerPanel({
  canImport,
  children,
  description,
  error,
  importLabel,
  isBusy,
  notice,
  onImportSelected,
  onScan,
  scanLabel,
  title
}: {
  canImport: boolean;
  children: ReactNode;
  description: string;
  error: string | null;
  importLabel: string;
  isBusy: boolean;
  notice: string | null;
  onImportSelected: () => void;
  onScan: () => void;
  scanLabel: string;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/25 p-5 shadow-neon">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ludex-cyan">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            {title.replace("Scanner", "") || title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ludex-muted">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <SecondaryButton disabled={isBusy} onClick={onScan}>
            <Radar size={16} />
            {scanLabel}
          </SecondaryButton>
          <PrimaryButton disabled={isBusy || !canImport} onClick={onImportSelected}>
            <Check size={16} />
            {isBusy ? "Aguarde..." : importLabel}
          </PrimaryButton>
        </div>
      </div>

      {error ? <NoticeBanner tone="error">{error}</NoticeBanner> : null}
      {notice ? <NoticeBanner tone="success">{notice}</NoticeBanner> : null}

      <div className="mt-4">{children}</div>
    </section>
  );
}

function LoadingLine({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ludex-panel/80 p-6 text-sm text-ludex-muted">
      {text}
    </div>
  );
}

function ScannerMeta({
  details,
  label,
  path
}: {
  details: string[] | Array<{ path: string; manifest_count: number }>;
  label: string;
  path: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm">
      <p className="text-ludex-muted">{label}</p>
      <p className="mt-1 break-words text-white">{path}</p>
      <div className="mt-3 space-y-1">
        {details.map((detail) => {
          const value = typeof detail === "string" ? detail : detail.path;
          return (
            <p key={value} className="break-words text-xs text-ludex-text">
              {value}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function ResultGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
      {children}
    </div>
  );
}

function SteamResultCard({
  game,
  isSelected,
  onToggle
}: {
  game: SteamDetectedGame;
  isSelected: boolean;
  onToggle: (externalId: string) => void;
}) {
  const externalId = game.external_id ?? game.name;

  return (
    <ResultCard
      idLabel={`AppID ${game.external_id ?? "desconhecido"}`}
      isSelected={isSelected}
      name={game.name}
      onToggle={() => onToggle(externalId)}
      path={game.install_path}
      secondary={game.metadata.manifest_path}
      toggleDisabled={!game.external_id}
    />
  );
}

function EpicResultCard({
  game,
  isSelected,
  onToggle,
  selectionId
}: {
  game: EpicDetectedGame;
  isSelected: boolean;
  onToggle: (selectionId: string) => void;
  selectionId: string;
}) {
  return (
    <ResultCard
      idLabel={`Epic ID ${game.external_id ?? "sem ID externo"}`}
      isSelected={isSelected}
      name={game.name}
      onToggle={() => onToggle(selectionId)}
      path={game.install_path}
      secondary={game.executable_path ?? "Executável não confiável ou ausente"}
    />
  );
}

function ResultCard({
  idLabel,
  isSelected,
  name,
  onToggle,
  path,
  secondary,
  toggleDisabled = false
}: {
  idLabel: string;
  isSelected: boolean;
  name: string;
  onToggle: () => void;
  path: string;
  secondary?: string;
  toggleDisabled?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border bg-ludex-panel/85 p-4 transition ${
        isSelected ? "border-ludex-cyan/50" : "border-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate font-medium text-white">{name}</h4>
          <p className="mt-1 text-xs text-ludex-muted">{idLabel}</p>
        </div>
        <button
          aria-label={isSelected ? "Remover da importação" : "Selecionar para importação"}
          className={`grid h-9 w-9 place-items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-ludex-cyan/60 ${
            isSelected
              ? "bg-ludex-cyan text-ludex-ink"
              : "bg-white/10 text-ludex-muted hover:text-white"
          }`}
          disabled={toggleDisabled}
          onClick={onToggle}
          type="button"
        >
          <Check size={16} />
        </button>
      </div>
      <p className="mt-3 truncate text-xs text-ludex-muted" title={path}>
        {path}
      </p>
      {secondary ? (
        <p className="mt-2 truncate text-xs text-ludex-muted" title={secondary}>
          {secondary}
        </p>
      ) : null}
    </article>
  );
}
