export type EpicManifest = {
  displayName: string | null;
  appName: string | null;
  catalogItemId: string | null;
  installLocation: string | null;
  launchExecutable: string | null;
  launchCommand: string | null;
  mainGameAppName: string | null;
  mandatoryAppFolderName: string | null;
};

export function parseEpicManifest(content: string): EpicManifest {
  const parsed = JSON.parse(content) as Record<string, unknown>;

  return {
    displayName: optionalString(parsed.DisplayName),
    appName: optionalString(parsed.AppName),
    catalogItemId: optionalString(parsed.CatalogItemId),
    installLocation: optionalString(parsed.InstallLocation),
    launchExecutable: optionalString(parsed.LaunchExecutable),
    launchCommand: optionalString(parsed.LaunchCommand),
    mainGameAppName: optionalString(parsed.MainGameAppName),
    mandatoryAppFolderName: optionalString(parsed.MandatoryAppFolderName)
  };
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
