import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { EpicDetectedGame, EpicScanResult } from "../../types.js";
import { parseEpicManifest, type EpicManifest } from "./parser.js";

export class EpicScanner {
  constructor(private readonly candidates = defaultEpicManifestCandidates()) {}

  async scanInstalledGames(): Promise<EpicScanResult> {
    const manifestPaths = this.candidates;
    const manifestsPath = manifestPaths.find((candidate) => existsSync(candidate));

    if (!manifestsPath) {
      throw new Error("Pasta de manifests da Epic Games não encontrada.");
    }

    return scanEpicManifests(manifestsPath);
  }
}

export async function scanEpicManifests(manifestsPath: string): Promise<EpicScanResult> {
  const manifestFiles = await collectEpicManifestPaths(manifestsPath);

  if (manifestFiles.length === 0) {
    throw new Error("Nenhum manifest da Epic Games foi encontrado.");
  }

  const games: EpicDetectedGame[] = [];
  let ignoredManifests = 0;

  for (const manifestPath of manifestFiles) {
    try {
      const manifest = parseEpicManifest(await readFile(manifestPath, "utf-8"));
      const game = normalizeEpicGame(manifestPath, manifest);

      if (game) {
        games.push(game);
      } else {
        ignoredManifests += 1;
      }
    } catch {
      ignoredManifests += 1;
    }
  }

  if (games.length === 0) {
    throw new Error("Nenhum jogo instalado da Epic Games foi encontrado.");
  }

  return {
    manifests_path: manifestsPath,
    manifests_found: manifestFiles.length,
    ignored_manifests: ignoredManifests,
    games
  };
}

export async function collectEpicManifestPaths(manifestsPath: string): Promise<string[]> {
  const entries = await readdir(manifestsPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.item$/i.test(name))
    .sort((left, right) => left.localeCompare(right))
    .map((name) => path.join(manifestsPath, name));
}

export function normalizeEpicGame(
  manifestPath: string,
  manifest: EpicManifest
): EpicDetectedGame | null {
  const installPath = manifest.installLocation
    ? path.normalize(manifest.installLocation)
    : null;

  if (!installPath || !existsSync(installPath)) {
    return null;
  }

  const name =
    manifest.displayName ??
    manifest.appName ??
    manifest.mainGameAppName ??
    manifest.mandatoryAppFolderName;

  if (!name) {
    return null;
  }

  const executablePath = resolveEpicExecutablePath(
    installPath,
    manifest.launchExecutable
  );
  const metadata: Record<string, string> = {
    manifest_path: manifestPath,
    install_location: installPath
  };

  addMetadata(metadata, "app_name", manifest.appName);
  addMetadata(metadata, "catalog_item_id", manifest.catalogItemId);
  addMetadata(metadata, "launch_executable", manifest.launchExecutable);
  addMetadata(metadata, "main_game_app_name", manifest.mainGameAppName);
  addMetadata(metadata, "mandatory_app_folder_name", manifest.mandatoryAppFolderName);

  return {
    name,
    platform: "epic",
    source: "epic",
    external_id: manifest.catalogItemId ?? manifest.appName,
    install_path: installPath,
    executable_path: executablePath,
    launch_command: null,
    metadata
  };
}

export function resolveEpicExecutablePath(
  installPath: string,
  launchExecutable: string | null
): string | null {
  if (!launchExecutable) {
    return null;
  }

  if (launchExecutable.includes("://") || launchExecutable.startsWith("\\\\")) {
    return null;
  }

  const normalizedInstallPath = path.normalize(installPath);
  const candidatePath = path.isAbsolute(launchExecutable)
    ? path.normalize(launchExecutable)
    : path.resolve(normalizedInstallPath, launchExecutable);

  if (!isPathInside(candidatePath, normalizedInstallPath)) {
    return null;
  }

  if (path.extname(candidatePath).toLowerCase() !== ".exe") {
    return null;
  }

  if (!existsSync(candidatePath)) {
    return null;
  }

  return candidatePath;
}

export function defaultEpicManifestCandidates(): string[] {
  const programData = process.env.ProgramData ?? "C:\\ProgramData";

  return uniquePaths([
    path.join(programData, "Epic", "EpicGamesLauncher", "Data", "Manifests"),
    "C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests"
  ]);
}

function addMetadata(
  metadata: Record<string, string>,
  key: string,
  value: string | null
): void {
  if (value) {
    metadata[key] = value;
  }
}

function isPathInside(candidatePath: string, parentPath: string): boolean {
  const relative = path.relative(parentPath, candidatePath);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function uniquePaths(paths: string[]): string[] {
  return paths.reduce<string[]>((result, currentPath) => {
    const normalized = path.normalize(currentPath);
    const exists = result.some(
      (existing) => existing.toLowerCase() === normalized.toLowerCase()
    );

    if (!exists) {
      result.push(normalized);
    }

    return result;
  }, []);
}
