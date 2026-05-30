import { describe, expect, it } from "vitest";
import { desktopApiKeys, ipcChannels, requireStringArgument } from "./ipc";

describe("Electron IPC contract", () => {
  it("exposes only the expected desktop API surface", () => {
    expect(desktopApiKeys).toEqual([
      "selectManualExecutable",
      "validateExecutablePath",
      "launchGame",
      "revealGameInFolder",
      "scanSteamGames",
      "scanEpicGames"
    ]);
  });

  it("keeps IPC channels explicit", () => {
    expect(Object.values(ipcChannels)).toEqual([
      "select_manual_executable",
      "validate_executable_path",
      "launch_game",
      "reveal_game_in_folder",
      "scan_steam_games",
      "scan_epic_games"
    ]);
  });

  it("rejects non-string IPC arguments for path commands", () => {
    expect(() => requireStringArgument({ path: "D:\\Game\\game.exe" }, "path")).toThrow(
      "path deve ser uma string."
    );
  });
});
