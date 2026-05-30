import type { UserGame } from "../types/api";

export function formatPlaytime(seconds: number): string {
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

export function formatDate(value: string | null): string {
  if (!value) {
    return "Nunca";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function gameName(userGame: UserGame): string {
  return userGame.game?.name ?? `Game #${userGame.game_id}`;
}

export function platformName(userGame: UserGame): string {
  return userGame.platform?.name ?? userGame.source;
}

export function platformKey(userGame: UserGame): string {
  return userGame.platform?.scanner_key ?? userGame.platform?.slug ?? userGame.source;
}

export function platformTone(platform: string | null | undefined): string {
  const key = platform?.toLowerCase() ?? "";

  if (key.includes("steam")) {
    return "from-sky-500/80 to-cyan-300/80";
  }

  if (key.includes("epic")) {
    return "from-zinc-100/90 to-fuchsia-300/80";
  }

  if (key.includes("manual")) {
    return "from-ludex-violet to-ludex-pink";
  }

  return "from-ludex-cyan to-ludex-violet";
}

export function apiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";
}
