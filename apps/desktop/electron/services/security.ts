import { existsSync, statSync } from "node:fs";
import path from "node:path";
import type { ExecutableValidation } from "../types.js";

export function validateLocalPathCandidate(candidate: string): string {
  const trimmed = candidate.trim();

  if (!trimmed) {
    throw new Error("Informe um caminho local válido.");
  }

  if (trimmed.includes("://")) {
    throw new Error("URLs não são permitidas para jogos locais.");
  }

  if (trimmed.startsWith("\\\\")) {
    throw new Error("Caminhos remotos ou de rede não são permitidos nesta fase.");
  }

  if (!path.isAbsolute(trimmed)) {
    throw new Error("Use um caminho local absoluto para o executável.");
  }

  if (!existsSync(trimmed)) {
    throw new Error("O caminho informado não existe.");
  }

  return trimmed;
}

export function validateExecutablePath(executablePath: string): ExecutableValidation {
  const safePath = validateLocalPathCandidate(executablePath);
  const stats = statSync(safePath);

  if (!stats.isFile()) {
    throw new Error("O caminho informado não é um arquivo.");
  }

  if (path.extname(safePath).toLowerCase() !== ".exe") {
    throw new Error("Selecione um arquivo .exe válido.");
  }

  return {
    executable_path: safePath,
    install_path: path.dirname(safePath),
    file_name: path.basename(safePath)
  };
}

export function suggestedGameName(executablePath: string): string {
  const parsed = path.parse(executablePath);
  const readable = parsed.name.replace(/[-_]+/g, " ").trim();

  return readable || "Jogo manual";
}

export function assertLocalPathExists(candidate: string): string {
  return validateLocalPathCandidate(candidate);
}
