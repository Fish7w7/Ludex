import { describe, expect, it } from "vitest";
import { epicGameSelectionId, epicGameToSyncGame } from "./epicScanner";

describe("epic scanner mapping", () => {
  it("maps Epic detected games to sync payload without launch_command", () => {
    const game = {
      name: "Fortnite",
      platform: "epic" as const,
      source: "epic" as const,
      external_id: "catalog-123",
      install_path: "D:\\Epic Games\\Fortnite",
      executable_path:
        "D:\\Epic Games\\Fortnite\\FortniteGame\\Binaries\\Win64\\Fortnite.exe",
      launch_command: null,
      metadata: {
        app_name: "Fortnite",
        catalog_item_id: "catalog-123",
        manifest_path:
          "C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests\\fortnite.item",
        install_location: "D:\\Epic Games\\Fortnite",
        launch_executable: "FortniteGame\\Binaries\\Win64\\Fortnite.exe"
      }
    };

    expect(epicGameToSyncGame(game)).toEqual({
      name: "Fortnite",
      platform: "epic",
      install_path: "D:\\Epic Games\\Fortnite",
      executable_path:
        "D:\\Epic Games\\Fortnite\\FortniteGame\\Binaries\\Win64\\Fortnite.exe",
      external_id: "catalog-123",
      metadata: game.metadata
    });
  });

  it("uses install path as selection fallback when external ID is missing", () => {
    expect(
      epicGameSelectionId({
        name: "Local Epic Game",
        platform: "epic",
        source: "epic",
        external_id: null,
        install_path: "D:\\Epic Games\\Local",
        executable_path: null,
        launch_command: null,
        metadata: {}
      })
    ).toBe("D:\\Epic Games\\Local");
  });
});
