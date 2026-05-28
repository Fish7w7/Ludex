import type { SyncDetectedGame } from "../../types/api";

export type ManualGameDraft = {
  name: string;
  executablePath: string;
  libraryPath?: string;
};

export function isWindowsExecutablePath(path: string): boolean {
  return path.trim().toLowerCase().endsWith(".exe");
}

export function deriveInstallPath(executablePath: string): string {
  const normalized = executablePath.trim();
  const separatorIndex = Math.max(
    normalized.lastIndexOf("\\"),
    normalized.lastIndexOf("/")
  );

  return separatorIndex > 0 ? normalized.slice(0, separatorIndex) : normalized;
}

export function deriveGameName(executablePath: string): string {
  const normalized = executablePath.trim();
  const separatorIndex = Math.max(
    normalized.lastIndexOf("\\"),
    normalized.lastIndexOf("/")
  );
  const fileName =
    separatorIndex >= 0 ? normalized.slice(separatorIndex + 1) : normalized;
  const withoutExtension = fileName.replace(/\.exe$/i, "");
  const readable = withoutExtension.replace(/[-_]+/g, " ").trim();

  return readable || "Jogo manual";
}

export function buildManualSyncGame(draft: ManualGameDraft): SyncDetectedGame {
  const executablePath = draft.executablePath.trim();
  const installPath = draft.libraryPath?.trim() || deriveInstallPath(executablePath);

  return {
    name: draft.name.trim(),
    platform: "manual",
    install_path: installPath,
    executable_path: executablePath,
    metadata: {
      added_by: "manual",
      scanner: "ManualScanner"
    }
  };
}

