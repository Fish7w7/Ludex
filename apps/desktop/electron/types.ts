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

export type SteamLibrary = {
  path: string;
  manifest_count: number;
};

export type SteamScanResult = {
  steam_path: string;
  libraries: SteamLibrary[];
  games: SteamDetectedGame[];
};
