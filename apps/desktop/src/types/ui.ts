import type { EpicDetectedGame, SteamDetectedGame } from "../lib/desktopCommands";

export type ActiveView = "library" | "scanner" | "favorites" | "settings";

export type ScannerStatus = "idle" | "loading" | "success" | "error" | "importing";

export type SteamScannerState = {
  status: ScannerStatus;
  error: string | null;
  games: SteamDetectedGame[];
  selectedIds: string[];
  libraries: string[];
  steamPath: string | null;
  notice: string | null;
};

export type EpicScannerState = {
  status: ScannerStatus;
  error: string | null;
  games: EpicDetectedGame[];
  selectedIds: string[];
  manifestsPath: string | null;
  manifestsFound: number;
  ignoredManifests: number;
  notice: string | null;
};
