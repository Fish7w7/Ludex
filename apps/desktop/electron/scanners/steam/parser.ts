import path from "node:path";
import { parseFlatVdfPairs, tokenizeVdf } from "./vdf.js";

export type SteamManifest = {
  appid: string;
  name: string;
  installdir: string;
  stateFlags?: string;
};

export function parseLibraryFoldersVdf(content: string): string[] {
  const tokens = tokenizeVdf(content);
  const paths: string[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const value = tokens[index + 1];

    if (token === "path" && value) {
      pushUniquePath(paths, value);
    }

    if (/^\d+$/.test(token) && value && looksLikeWindowsPath(value)) {
      pushUniquePath(paths, value);
    }
  }

  if (paths.length === 0) {
    throw new Error("Nenhuma biblioteca Steam foi encontrada no libraryfolders.vdf.");
  }

  return paths;
}

export function parseAppManifestAcf(content: string): SteamManifest {
  const pairs = parseFlatVdfPairs(content);

  return {
    appid: requiredPair(pairs, "appid"),
    name: requiredPair(pairs, "name"),
    installdir: requiredPair(pairs, "installdir"),
    stateFlags: pairs.StateFlags
  };
}

function pushUniquePath(paths: string[], value: string): void {
  const normalized = path.normalize(value);

  if (!paths.some((existing) => samePath(existing, normalized))) {
    paths.push(normalized);
  }
}

function samePath(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

function looksLikeWindowsPath(value: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(value);
}

function requiredPair(pairs: Record<string, string>, key: string): string {
  const value = pairs[key]?.trim();

  if (!value) {
    throw new Error(`Manifest Steam inválido: campo ${key} ausente.`);
  }

  return value;
}
