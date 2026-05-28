import { describe, expect, it } from "vitest";
import { steamGameToSyncGame } from "./steamScanner";

describe("steam scanner mapping", () => {
  it("maps detected Steam games to sync payload without top-level launch_command", () => {
    expect(
      steamGameToSyncGame({
        name: "Counter-Strike 2",
        platform: "steam",
        source: "steam",
        external_id: "730",
        install_path:
          "D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive",
        executable_path: null,
        launch_command: "steam://rungameid/730",
        metadata: {
          appid: "730",
          library_path: "D:\\SteamLibrary",
          manifest_path: "D:\\SteamLibrary\\steamapps\\appmanifest_730.acf",
          installdir: "Counter-Strike Global Offensive"
        }
      })
    ).toEqual({
      name: "Counter-Strike 2",
      platform: "steam",
      install_path:
        "D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive",
      executable_path: null,
      external_id: "730",
      metadata: {
        appid: "730",
        library_path: "D:\\SteamLibrary",
        manifest_path: "D:\\SteamLibrary\\steamapps\\appmanifest_730.acf",
        installdir: "Counter-Strike Global Offensive",
        launch_command: "steam://rungameid/730"
      }
    });
  });
});
