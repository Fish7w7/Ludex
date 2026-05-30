export const ipcChannels = {
  selectManualExecutable: "select_manual_executable",
  validateExecutablePath: "validate_executable_path",
  launchGame: "launch_game",
  revealGameInFolder: "reveal_game_in_folder",
  scanSteamGames: "scan_steam_games",
  scanEpicGames: "scan_epic_games"
} as const;

export const desktopApiKeys = [
  "selectManualExecutable",
  "validateExecutablePath",
  "launchGame",
  "revealGameInFolder",
  "scanSteamGames",
  "scanEpicGames"
] as const;

export function requireStringArgument(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} deve ser uma string.`);
  }

  return value;
}
