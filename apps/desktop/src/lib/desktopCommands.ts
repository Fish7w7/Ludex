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

export type EpicDetectedGame = {
  name: string;
  platform: "epic";
  source: "epic";
  external_id: string | null;
  install_path: string;
  executable_path: string | null;
  launch_command: null;
  metadata: Record<string, string>;
};

export type EpicScanResult = {
  manifests_path: string;
  manifests_found: number;
  ignored_manifests: number;
  games: EpicDetectedGame[];
};

export type LudexDesktopApi = {
  selectManualExecutable: () => Promise<ManualExecutableSelection | null>;
  validateExecutablePath: (executablePath: string) => Promise<ExecutableValidation>;
  launchGame: (executablePath: string) => Promise<string>;
  revealGameInFolder: (path: string) => Promise<string>;
  scanSteamGames: () => Promise<SteamScanResult>;
  scanEpicGames: () => Promise<EpicScanResult>;
};

declare global {
  interface Window {
    ludexDesktop?: LudexDesktopApi;
  }
}

function desktopApi(): LudexDesktopApi {
  if (!window.ludexDesktop) {
    throw new Error("Este recurso só funciona no app desktop do Ludex.");
  }

  return window.ludexDesktop;
}

export const desktopCommands = {
  selectManualExecutable(): Promise<ManualExecutableSelection | null> {
    return desktopApi().selectManualExecutable();
  },

  validateExecutablePath(executablePath: string): Promise<ExecutableValidation> {
    return desktopApi().validateExecutablePath(executablePath);
  },

  launchGame(executablePath: string): Promise<string> {
    return desktopApi().launchGame(executablePath);
  },

  revealGameInFolder(path: string): Promise<string> {
    return desktopApi().revealGameInFolder(path);
  },

  scanSteamGames(): Promise<SteamScanResult> {
    return desktopApi().scanSteamGames();
  },

  scanEpicGames(): Promise<EpicScanResult> {
    return desktopApi().scanEpicGames();
  }
};
