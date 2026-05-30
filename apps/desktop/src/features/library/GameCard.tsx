import { Clock3, Heart } from "lucide-react";
import { IconButton, StatusBadge } from "../../components/ui";
import { formatPlaytime, gameName, platformName } from "../../lib/gameUtils";
import type { UserGame } from "../../types/api";
import { GameCover } from "./GameCover";

export function GameCard({
  isSelected,
  onSelect,
  onToggleFavorite,
  userGame
}: {
  isSelected: boolean;
  onSelect: (id: number) => void;
  onToggleFavorite: (game: UserGame) => void;
  userGame: UserGame;
}) {
  const name = gameName(userGame);
  const platform = platformName(userGame);

  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-[#101524]/92 shadow-[0_20px_52px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-1 hover:border-ludex-cyan/35 hover:shadow-[0_22px_64px_rgba(40,244,255,0.12)] ${
        isSelected
          ? "border-ludex-violet shadow-[0_0_0_1px_rgba(155,92,255,0.55),0_0_34px_rgba(155,92,255,0.24)]"
          : "border-white/10"
      }`}
    >
      <button
        className="relative block w-full text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ludex-cyan/60"
        onClick={() => onSelect(userGame.id)}
        type="button"
      >
        <GameCover
          className="h-40 w-full"
          coverUrl={userGame.game?.cover_url}
          name={name}
          platform={platform}
        />
        <div className="absolute bottom-3 left-3">
          <StatusBadge tone="violet">{platform}</StatusBadge>
        </div>
      </button>

      <div className="relative p-3.5">
        <IconButton
          aria-label={userGame.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className={`absolute -top-[9.35rem] right-3 h-9 w-9 rounded-xl ${
            userGame.is_favorite
              ? "border-ludex-pink/40 bg-ludex-pink/25 text-ludex-pink"
              : "bg-black/30 text-white/75 backdrop-blur hover:text-ludex-pink"
          }`}
          onClick={() => onToggleFavorite(userGame)}
        >
          <Heart fill={userGame.is_favorite ? "currentColor" : "none"} size={16} />
        </IconButton>

        <button
          className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-ludex-cyan/60"
          onClick={() => onSelect(userGame.id)}
          type="button"
        >
          <h3 className="truncate text-base font-semibold text-white" title={name}>
            {name}
          </h3>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-ludex-muted">
            <Clock3 size={13} />
            <span>{formatPlaytime(userGame.total_playtime_seconds)}</span>
          </div>
        </button>
      </div>
    </article>
  );
}
