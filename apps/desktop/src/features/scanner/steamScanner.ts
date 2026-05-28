import type { SteamDetectedGame } from "../../lib/desktopCommands";
import type { SyncDetectedGame } from "../../types/api";

export function steamGameToSyncGame(game: SteamDetectedGame): SyncDetectedGame {
  return {
    name: game.name,
    platform: "steam",
    install_path: game.install_path,
    executable_path: game.executable_path,
    external_id: game.external_id ?? undefined,
    metadata: {
      ...game.metadata,
      launch_command: game.launch_command ?? game.metadata.launch_command
    }
  };
}
