import type { EpicDetectedGame } from "../../lib/desktopCommands";
import type { SyncDetectedGame } from "../../types/api";

export function epicGameToSyncGame(game: EpicDetectedGame): SyncDetectedGame {
  return {
    name: game.name,
    platform: "epic",
    install_path: game.install_path,
    executable_path: game.executable_path,
    external_id: game.external_id ?? undefined,
    metadata: game.metadata
  };
}

export function epicGameSelectionId(game: EpicDetectedGame): string {
  return game.external_id ?? game.executable_path ?? game.install_path;
}
