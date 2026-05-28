import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { SteamDetectedGame, SteamLibrary, SteamScanResult } from "../../types.js";
import {
  parseAppManifestAcf,
  parseLibraryFoldersVdf,
  type SteamManifest
} from "./parser.js";

const execFileAsync = promisify(execFile);

export class SteamScanner {
  constructor(private readonly candidates = defaultSteamCandidates()) {}

  async scanInstalledGames(): Promise<SteamScanResult> {
    const candidatePaths = await this.candidates;
    const steamPath = candidatePaths.find((candidate) =>
      existsSync(path.join(candidate, "steamapps"))
    );

    if (!steamPath) {
      throw new Error("Steam não encontrada neste computador.");
    }

    return scanSteamRoot(steamPath);
  }
}

export async function scanSteamRoot(steamPath: string): Promise<SteamScanResult> {
  const libraryFile = path.join(steamPath, "steamapps", "libraryfolders.vdf");
  let libraryContent: string;

  try {
    libraryContent = await readFile(libraryFile, "utf-8");
  } catch {
    throw new Error("libraryfolders.vdf não encontrado ou ilegível.");
  }

  const parsedLibraryPaths = parseLibraryFoldersVdf(libraryContent);
  const libraryPaths = uniquePaths([steamPath, ...parsedLibraryPaths]);
  const libraries: SteamLibrary[] = [];
  const games: SteamDetectedGame[] = [];

  for (const libraryPath of libraryPaths) {
    if (!existsSync(libraryPath)) {
      continue;
    }

    const steamappsPath = path.join(libraryPath, "steamapps");
    if (!existsSync(steamappsPath)) {
      continue;
    }

    const manifestPaths = await collectManifestPaths(steamappsPath);
    libraries.push({
      path: libraryPath,
      manifest_count: manifestPaths.length
    });

    for (const manifestPath of manifestPaths) {
      const manifest = parseAppManifestAcf(await readFile(manifestPath, "utf-8"));
      games.push(normalizeSteamGame(libraryPath, manifestPath, manifest));
    }
  }

  if (libraries.length === 0) {
    throw new Error("Nenhuma biblioteca Steam válida foi encontrada.");
  }

  if (games.length === 0) {
    throw new Error("Nenhum jogo instalado da Steam foi encontrado.");
  }

  return {
    steam_path: steamPath,
    libraries,
    games
  };
}

export async function collectManifestPaths(steamappsPath: string): Promise<string[]> {
  const entries = await readdir(steamappsPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /^appmanifest_\d+\.acf$/i.test(name))
    .sort((left, right) => left.localeCompare(right))
    .map((name) => path.join(steamappsPath, name));
}

export function normalizeSteamGame(
  libraryPath: string,
  manifestPath: string,
  manifest: SteamManifest
): SteamDetectedGame {
  const installPath = path.join(
    libraryPath,
    "steamapps",
    "common",
    manifest.installdir
  );
  const launchCommand = `steam://rungameid/${manifest.appid}`;
  const metadata: Record<string, string> = {
    appid: manifest.appid,
    library_path: libraryPath,
    manifest_path: manifestPath,
    installdir: manifest.installdir,
    launch_command: launchCommand
  };

  if (manifest.stateFlags) {
    metadata.state_flags = manifest.stateFlags;
  }

  return {
    name: manifest.name,
    platform: "steam",
    source: "steam",
    external_id: manifest.appid,
    install_path: installPath,
    executable_path: null,
    launch_command: launchCommand,
    metadata
  };
}

export async function defaultSteamCandidates(): Promise<string[]> {
  const registryPaths = os.platform() === "win32" ? await steamPathsFromRegistry() : [];
  const envPaths = ["ProgramFiles(x86)", "ProgramFiles"]
    .map((key) => process.env[key])
    .filter((value): value is string => Boolean(value))
    .map((value) => path.join(value, "Steam"));

  return uniquePaths([
    ...registryPaths,
    ...envPaths,
    "C:\\Program Files (x86)\\Steam",
    "C:\\Program Files\\Steam"
  ]);
}

async function steamPathsFromRegistry(): Promise<string[]> {
  const probes = [
    ["HKCU\\Software\\Valve\\Steam", "SteamPath"],
    ["HKCU\\Software\\Valve\\Steam", "InstallPath"],
    ["HKLM\\Software\\WOW6432Node\\Valve\\Steam", "SteamPath"],
    ["HKLM\\Software\\WOW6432Node\\Valve\\Steam", "InstallPath"],
    ["HKLM\\Software\\Valve\\Steam", "SteamPath"],
    ["HKLM\\Software\\Valve\\Steam", "InstallPath"]
  ];
  const paths: string[] = [];

  for (const [key, value] of probes) {
    try {
      const { stdout } = await execFileAsync("reg", ["query", key, "/v", value], {
        windowsHide: true
      });
      const parsed = parseRegistryValue(stdout, value);
      if (parsed) {
        paths.push(path.normalize(parsed.replace(/\//g, "\\")));
      }
    } catch {
      // Missing registry keys are expected on machines without Steam.
    }
  }

  return paths;
}

function parseRegistryValue(output: string, valueName: string): string | null {
  const line = output
    .split(/\r?\n/)
    .map((value) => value.trim())
    .find((value) => value.toLowerCase().startsWith(valueName.toLowerCase()));

  if (!line) {
    return null;
  }

  const match = line.match(/REG_\w+\s+(.+)$/);
  return match?.[1]?.trim() ?? null;
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
