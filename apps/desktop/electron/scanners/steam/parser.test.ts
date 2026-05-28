import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseAppManifestAcf, parseLibraryFoldersVdf } from "./parser";
import { collectManifestPaths, normalizeSteamGame } from "./steamScanner";

describe("Steam VDF parser", () => {
  it("parses libraryfolders.vdf with multiple libraries", () => {
    const paths = parseLibraryFoldersVdf(`
      "libraryfolders"
      {
        "0"
        {
          "path" "C:\\\\Program Files (x86)\\\\Steam"
        }
        "1"
        {
          "path" "D:\\\\SteamLibrary"
        }
        "2" "E:\\\\Games\\\\SteamLibrary"
      }
    `);

    expect(paths).toContain(path.normalize("D:\\SteamLibrary"));
    expect(paths).toContain(path.normalize("E:\\Games\\SteamLibrary"));
  });

  it("parses appmanifest_*.acf", () => {
    const manifest = parseAppManifestAcf(`
      "AppState"
      {
        "appid" "730"
        "name" "Counter-Strike 2"
        "installdir" "Counter-Strike Global Offensive"
        "StateFlags" "4"
      }
    `);

    expect(manifest).toEqual({
      appid: "730",
      name: "Counter-Strike 2",
      installdir: "Counter-Strike Global Offensive",
      stateFlags: "4"
    });
  });

  it("normalizes a Steam game for API sync", () => {
    const game = normalizeSteamGame(
      "D:\\SteamLibrary",
      "D:\\SteamLibrary\\steamapps\\appmanifest_730.acf",
      {
        appid: "730",
        name: "Counter-Strike 2",
        installdir: "Counter-Strike Global Offensive"
      }
    );

    expect(game.platform).toBe("steam");
    expect(game.external_id).toBe("730");
    expect(game.executable_path).toBeNull();
    expect(game.metadata.launch_command).toBe("steam://rungameid/730");
  });

  it("only collects appmanifest files and does not inspect executables", async () => {
    const tempDir = await import("node:fs/promises").then(async (fs) => {
      const os = await import("node:os");
      const prefix = path.join(os.tmpdir(), "ludex-steam-manifests-");
      return fs.mkdtemp(prefix);
    });
    const fs = await import("node:fs/promises");

    await fs.writeFile(path.join(tempDir, "appmanifest_730.acf"), "");
    await fs.writeFile(path.join(tempDir, "game.exe"), "");
    await fs.writeFile(path.join(tempDir, "notes.txt"), "");

    await expect(collectManifestPaths(tempDir)).resolves.toEqual([
      path.join(tempDir, "appmanifest_730.acf")
    ]);

    await fs.rm(tempDir, { recursive: true, force: true });
  });
});
