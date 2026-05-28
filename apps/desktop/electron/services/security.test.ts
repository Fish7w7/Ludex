import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { suggestedGameName, validateExecutablePath } from "./security";

describe("Electron desktop security helpers", () => {
  it("rejects non-exe files", () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), "ludex-security-"));
    const file = path.join(tempDir, "readme.txt");
    writeFileSync(file, "not executable");

    expect(() => validateExecutablePath(file)).toThrow("Selecione um arquivo .exe");

    rmSync(tempDir, { recursive: true, force: true });
  });

  it("rejects directories passed as executables", () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), "ludex-security-"));
    const directory = path.join(tempDir, "NotAGame.exe");
    mkdirSync(directory);

    expect(() => validateExecutablePath(directory)).toThrow(
      "O caminho informado não é um arquivo."
    );

    rmSync(tempDir, { recursive: true, force: true });
  });

  it("accepts local exe files", () => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), "ludex-security-"));
    const file = path.join(tempDir, "pixel-shrine.exe");
    writeFileSync(file, "stub");

    expect(validateExecutablePath(file)).toMatchObject({
      executable_path: file,
      install_path: tempDir,
      file_name: "pixel-shrine.exe"
    });
    expect(suggestedGameName(file)).toBe("pixel shrine");

    rmSync(tempDir, { recursive: true, force: true });
  });

  it("rejects URLs and network paths", () => {
    expect(() => validateExecutablePath("https://example.com/game.exe")).toThrow(
      "URLs não são permitidas"
    );
    expect(() => validateExecutablePath("\\\\server\\share\\game.exe")).toThrow(
      "Caminhos remotos"
    );
  });
});
