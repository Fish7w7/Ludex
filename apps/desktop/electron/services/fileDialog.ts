import { dialog } from "electron";
import type { ManualExecutableSelection } from "../types.js";
import { suggestedGameName, validateExecutablePath } from "./security.js";

export async function selectManualExecutable(): Promise<ManualExecutableSelection | null> {
  const result = await dialog.showOpenDialog({
    title: "Selecionar executável do jogo",
    properties: ["openFile"],
    filters: [{ name: "Windows executable", extensions: ["exe"] }]
  });

  if (result.canceled || !result.filePaths[0]) {
    return null;
  }

  const validation = validateExecutablePath(result.filePaths[0]);

  return {
    executable_path: validation.executable_path,
    install_path: validation.install_path,
    suggested_name: suggestedGameName(validation.executable_path)
  };
}
