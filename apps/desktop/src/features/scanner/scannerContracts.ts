export type ScannerSource = "steam" | "epic" | "xbox" | "manual" | "mock";

export type ScannedGame = {
  externalId?: string;
  title: string;
  source: ScannerSource;
  installPath: string;
  executablePath?: string;
  detectedAt: string;
};

export interface GameScanner {
  source: ScannerSource;
  scan(): Promise<ScannedGame[]>;
}

export class ScannerManager {
  constructor(private readonly scanners: GameScanner[]) {}

  async scanAll(): Promise<ScannedGame[]> {
    const results = await Promise.all(this.scanners.map((scanner) => scanner.scan()));
    return results.flat();
  }
}

