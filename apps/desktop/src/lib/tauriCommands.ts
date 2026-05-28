import { invoke } from "@tauri-apps/api/core";

export type ManualExecutableSelection = {
  executable_path: string;
  install_path: string;
  suggested_name: string;
};

export type ExecutableValidation = {
  executable_path: string;
  install_path: string;
  file_name: string;
};

export type SteamDetectedGame = {
  name: string;
  platform: "steam";
  source: "steam";
  external_id: string | null;
  install_path: string;
  executable_path: string | null;
  launch_command: string | null;
  metadata: Record<string, string>;
};

export type SteamScanResult = {
  steam_path: string;
  libraries: Array<{
    path: string;
    manifest_count: number;
  }>;
  games: SteamDetectedGame[];
};

function isTauriRuntime(): boolean {
  return (
    typeof window !== "undefined" &&
    "__TAURI_INTERNALS__" in (window as typeof window & { __TAURI_INTERNALS__?: unknown })
  );
}

async function invokeTauri<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauriRuntime()) {
    throw new Error("Este recurso só funciona no app desktop do Ludex.");
  }

  return invoke<T>(command, args);
}

export const tauriCommands = {
  selectManualExecutable(): Promise<ManualExecutableSelection | null> {
    return invokeTauri<ManualExecutableSelection | null>("select_manual_executable");
  },

  validateExecutablePath(executablePath: string): Promise<ExecutableValidation> {
    return invokeTauri<ExecutableValidation>("validate_executable_path", {
      executablePath
    });
  },

  launchGame(executablePath: string): Promise<string> {
    return invokeTauri<string>("launch_game", {
      executablePath
    });
  },

  revealGameInFolder(path: string): Promise<string> {
    return invokeTauri<string>("reveal_game_in_folder", {
      path
    });
  },

  scanSteamGames(): Promise<SteamScanResult> {
    return invokeTauri<SteamScanResult>("scan_steam_games");
  }
};
