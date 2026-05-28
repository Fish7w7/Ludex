import { describe, expect, it } from "vitest";
import {
  buildManualSyncGame,
  deriveGameName,
  deriveInstallPath,
  isWindowsExecutablePath
} from "./manualGame";

describe("manual game helpers", () => {
  it("accepts only Windows exe-like paths", () => {
    expect(isWindowsExecutablePath("D:\\Games\\LudexTest\\game.exe")).toBe(true);
    expect(isWindowsExecutablePath("D:\\Games\\LudexTest\\game.txt")).toBe(false);
  });

  it("derives name and install path from executable path", () => {
    expect(deriveGameName("D:\\Games\\Pixel-Shrine\\pixel_shrine.exe")).toBe(
      "pixel shrine"
    );
    expect(deriveInstallPath("D:\\Games\\Pixel-Shrine\\pixel_shrine.exe")).toBe(
      "D:\\Games\\Pixel-Shrine"
    );
  });

  it("builds the manual sync payload", () => {
    expect(
      buildManualSyncGame({
        name: "Meu Jogo",
        executablePath: "D:\\Games\\Meu Jogo\\game.exe",
        libraryPath: "D:\\Games\\Meu Jogo"
      })
    ).toEqual({
      name: "Meu Jogo",
      platform: "manual",
      install_path: "D:\\Games\\Meu Jogo",
      executable_path: "D:\\Games\\Meu Jogo\\game.exe",
      metadata: {
        added_by: "manual",
        scanner: "ManualScanner"
      }
    });
  });
});

