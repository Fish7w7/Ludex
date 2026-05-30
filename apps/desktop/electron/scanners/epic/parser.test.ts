import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseEpicManifest } from "./parser";
import {
  collectEpicManifestPaths,
  normalizeEpicGame,
  resolveEpicExecutablePath,
  scanEpicManifests
} from "./epicScanner";

async function createTempGame() {
  const root = await mkdtemp(path.join(os.tmpdir(), "ludex-epic-"));
  const installPath = path.join(root, "Fortnite");
  const executablePath = path.join(
    installPath,
    "FortniteGame",
    "Binaries",
    "Win64",
    "FortniteClient-Win64-Shipping.exe"
  );

  await mkdir(path.dirname(executablePath), { recursive: true });
  await writeFile(executablePath, "");

  return { root, installPath, executablePath };
}

describe("Epic manifest parser", () => {
  it("parses a valid Epic manifest", () => {
    const manifest = parseEpicManifest(
      JSON.stringify({
        DisplayName: "Fortnite",
        AppName: "Fortnite",
        CatalogItemId: "catalog-123",
        InstallLocation: "D:\\Epic Games\\Fortnite",
        LaunchExecutable:
          "FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe",
        MainGameAppName: "FortniteMain"
      })
    );

    expect(manifest.displayName).toBe("Fortnite");
    expect(manifest.catalogItemId).toBe("catalog-123");
    expect(manifest.launchExecutable).toContain("FortniteClient");
  });

  it("ignores invalid manifests while scanning", async () => {
    const { root, installPath } = await createTempGame();
    const manifestDir = path.join(root, "Manifests");
    await mkdir(manifestDir);
    await writeFile(path.join(manifestDir, "broken.item"), "{ nope");
    await writeFile(
      path.join(manifestDir, "valid.item"),
      JSON.stringify({
        DisplayName: "Fortnite",
        AppName: "Fortnite",
        CatalogItemId: "catalog-123",
        InstallLocation: installPath
      })
    );

    const result = await scanEpicManifests(manifestDir);

    expect(result.ignored_manifests).toBe(1);
    expect(result.games).toHaveLength(1);

    await rm(root, { recursive: true, force: true });
  });

  it("ignores manifests without a valid InstallLocation", async () => {
    const game = normalizeEpicGame("C:\\manifest.item", {
      displayName: "Fortnite",
      appName: "Fortnite",
      catalogItemId: "catalog-123",
      installLocation: null,
      launchExecutable: null,
      launchCommand: null,
      mainGameAppName: null,
      mandatoryAppFolderName: null
    });

    expect(game).toBeNull();
  });

  it("builds executablePath when LaunchExecutable stays inside InstallLocation", async () => {
    const { root, installPath, executablePath } = await createTempGame();

    expect(
      resolveEpicExecutablePath(
        installPath,
        "FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe"
      )
    ).toBe(executablePath);

    await rm(root, { recursive: true, force: true });
  });

  it("rejects LaunchExecutable paths that escape InstallLocation", async () => {
    const { root, installPath } = await createTempGame();

    expect(resolveEpicExecutablePath(installPath, "..\\outside.exe")).toBeNull();

    await rm(root, { recursive: true, force: true });
  });

  it("normalizes an Epic game for API sync", async () => {
    const { root, installPath, executablePath } = await createTempGame();
    const game = normalizeEpicGame(path.join(root, "fortnite.item"), {
      displayName: "Fortnite",
      appName: "Fortnite",
      catalogItemId: "catalog-123",
      installLocation: installPath,
      launchExecutable:
        "FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe",
      launchCommand: "-AUTH_LOGIN=unused",
      mainGameAppName: "FortniteMain",
      mandatoryAppFolderName: "Fortnite"
    });

    expect(game?.platform).toBe("epic");
    expect(game?.external_id).toBe("catalog-123");
    expect(game?.executable_path).toBe(executablePath);
    expect(game?.launch_command).toBeNull();
    expect(game?.metadata.launch_executable).toContain("FortniteClient");

    await rm(root, { recursive: true, force: true });
  });

  it("only collects .item manifests", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "ludex-epic-items-"));

    await writeFile(path.join(tempDir, "game.item"), "{}");
    await writeFile(path.join(tempDir, "notes.txt"), "");

    await expect(collectEpicManifestPaths(tempDir)).resolves.toEqual([
      path.join(tempDir, "game.item")
    ]);

    await rm(tempDir, { recursive: true, force: true });
  });
});
