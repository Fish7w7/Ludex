import { spawn } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";
import { shell } from "electron";
import { assertLocalPathExists, validateExecutablePath } from "./security.js";

export function launchGame(executablePath: string): string {
  const validation = validateExecutablePath(executablePath);

  const child = spawn(validation.executable_path, [], {
    cwd: validation.install_path,
    detached: true,
    stdio: "ignore",
    shell: false,
    windowsHide: false
  });

  child.unref();

  return "Jogo iniciado pelo Ludex.";
}

export async function revealGameInFolder(candidate: string): Promise<string> {
  const safePath = assertLocalPathExists(candidate);
  const stats = statSync(safePath);

  if (stats.isFile()) {
    shell.showItemInFolder(safePath);
    return "Pasta aberta pelo Ludex.";
  }

  if (stats.isDirectory()) {
    const errorMessage = await shell.openPath(safePath);
    if (errorMessage) {
      throw new Error(`Não foi possível abrir a pasta: ${errorMessage}`);
    }
    return "Pasta aberta pelo Ludex.";
  }

  throw new Error("O caminho informado não é um arquivo ou pasta existente.");
}

export function folderFromExecutable(executablePath: string): string {
  return path.dirname(validateExecutablePath(executablePath).executable_path);
}
