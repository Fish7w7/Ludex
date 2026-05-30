import {
  CalendarDays,
  Clock3,
  Database,
  FolderOpen,
  Gamepad2,
  Heart,
  Play,
  Square,
  Tag
} from "lucide-react";
import { IconButton, PrimaryButton, SecondaryButton, StatusBadge } from "../../components/ui";
import { formatDate, formatPlaytime, gameName, platformName } from "../../lib/gameUtils";
import type { UserGame } from "../../types/api";
import { GameCover } from "./GameCover";

export function GameDetailsPanel({
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
      <aside className="sticky top-7 max-h-[calc(100vh-3.5rem)] rounded-2xl border border-white/10 bg-[#0d1221]/88 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.36)]">
        <div className="flex h-full min-h-[330px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/18 p-8 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.07] text-ludex-cyan shadow-neon">
            <Gamepad2 size={26} />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-white">
            Selecione um jogo para ver detalhes
          </h3>
          <p className="mt-3 max-w-xs text-sm leading-6 text-ludex-muted">
            Clique em um card da biblioteca para ver caminhos, metadata e ações de jogo.
          </p>
        </div>
      </aside>
    );
  }

  const name = gameName(game);
  const platform = platformName(game);
  const details = [
    ["Plataforma", platform],
    ["Source", game.source],
    ["External ID", game.external_id ?? "Sem ID externo"],
    ["Instalado em", game.install_path],
    ["Executável", game.executable_path || "Sem executável local"],
    ["Launch Command", game.launch_command ?? "Não usado"],
    ["Total Playtime", formatPlaytime(game.total_playtime_seconds)],
    ["Última vez jogado", formatDate(game.last_played_at)]
  ];

  return (
    <aside className="sticky top-7 max-h-[calc(100vh-3.5rem)] overflow-auto rounded-2xl border border-white/10 bg-[#0d1221]/92 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.36)]">
      <div className="flex items-start gap-4">
        <GameCover
          className="h-[112px] w-[112px] shrink-0 rounded-2xl border border-white/10 shadow-[0_0_34px_rgba(155,92,255,0.22)]"
          coverUrl={game.game?.cover_url}
          name={name}
          platform={platform}
          showGlyph={false}
        />
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-2xl font-semibold leading-tight text-white">{name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge tone="violet">{platform}</StatusBadge>
            {activeSessionId ? <StatusBadge tone="success">sessão ativa</StatusBadge> : null}
          </div>
          <div className="mt-3 space-y-1 text-sm">
            <p className="flex items-center gap-2 text-ludex-cyan">
              <Clock3 size={15} />
              {formatPlaytime(game.total_playtime_seconds)}
            </p>
            <p className="flex items-center gap-2 text-ludex-muted">
              <CalendarDays size={15} />
              Última vez jogado: {formatDate(game.last_played_at)}
            </p>
          </div>
        </div>
        <IconButton
          aria-label={game.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className={game.is_favorite ? "border-ludex-pink/40 bg-ludex-pink/20 text-ludex-pink" : ""}
          onClick={() => onToggleFavorite(game)}
        >
          <Heart fill={game.is_favorite ? "currentColor" : "none"} size={18} />
        </IconButton>
      </div>

      <div className="mt-5">
        <PrimaryButton
          className="w-full py-3.5 text-base uppercase tracking-wide"
          disabled={Boolean(activeSessionId) || isLaunching}
          onClick={() => onLaunchGame(game)}
        >
          <Play size={18} />
          {isLaunching ? "Abrindo..." : "Jogar"}
        </PrimaryButton>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <SecondaryButton disabled={isRevealing} onClick={() => onRevealFolder(game)}>
          <FolderOpen size={16} />
          {isRevealing ? "Abrindo..." : "Abrir pasta"}
        </SecondaryButton>
        <SecondaryButton
          className={
            game.is_favorite ? "border-ludex-pink/40 text-ludex-pink" : "border-ludex-pink/25"
          }
          onClick={() => onToggleFavorite(game)}
        >
          <Heart fill={game.is_favorite ? "currentColor" : "none"} size={16} />
          {game.is_favorite ? "Desfavoritar" : "Favoritar"}
        </SecondaryButton>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                activeSessionId ? "bg-emerald-300" : "bg-ludex-muted/50"
              }`}
            />
            <p className="text-sm font-semibold text-white">
              {activeSessionId ? "Sessão ativa" : "Nenhuma sessão ativa"}
            </p>
          </div>
          <SecondaryButton
            className="px-3 py-2 text-xs uppercase tracking-wide"
            disabled={!activeSessionId}
            onClick={() => onFinishSession(game)}
          >
            <Square size={14} />
            Finalizar sessão
          </SecondaryButton>
        </div>
      </div>

      <dl className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-black/12 text-sm">
        {details.map(([label, value]) => (
          <DetailRow key={label} label={label} value={value} />
        ))}
      </dl>

      <details className="mt-3 rounded-2xl border border-white/10 bg-black/18 p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white">
          <span className="flex items-center gap-2">
            <Database size={15} />
            Metadata
          </span>
          <Tag size={15} className="text-ludex-muted" />
        </summary>
        <pre className="mt-3 max-h-36 overflow-auto whitespace-pre-wrap text-xs leading-5 text-ludex-text">
          {JSON.stringify(game.metadata ?? {}, null, 2)}
        </pre>
      </details>
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 px-3 py-2.5">
      <dt className="text-ludex-muted">{label}</dt>
      <dd className="truncate font-medium text-ludex-text" title={value}>
        {value}
      </dd>
    </div>
  );
}
