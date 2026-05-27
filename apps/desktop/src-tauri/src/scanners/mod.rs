use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct ScannedGame {
    pub external_id: Option<String>,
    pub title: String,
    pub source: ScannerSource,
    pub install_path: String,
    pub executable_path: Option<String>,
    pub detected_at: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ScannerSource {
    Steam,
    Epic,
    Xbox,
    Manual,
    Mock,
}

pub trait GameScanner {
    fn source(&self) -> ScannerSource;
    fn scan(&self) -> Vec<ScannedGame>;
}

pub struct ScannerManager {
    scanners: Vec<Box<dyn GameScanner>>,
}

impl ScannerManager {
    pub fn new(scanners: Vec<Box<dyn GameScanner>>) -> Self {
        Self { scanners }
    }

    pub fn scan_all(&self) -> Vec<ScannedGame> {
        self.scanners
            .iter()
            .flat_map(|scanner| scanner.scan())
            .collect()
    }
}

pub struct MockScanner;
pub struct SteamScanner;
pub struct EpicGamesScanner;
pub struct XboxScanner;
pub struct ManualScanner;

impl GameScanner for MockScanner {
    fn source(&self) -> ScannerSource {
        ScannerSource::Mock
    }

    fn scan(&self) -> Vec<ScannedGame> {
        vec![ScannedGame {
            external_id: Some("mock-neon-runner".to_string()),
            title: "Neon Runner".to_string(),
            source: self.source(),
            install_path: "D:\\Games\\SteamLibrary\\steamapps\\common\\Neon Runner".to_string(),
            executable_path: None,
            detected_at: "2026-05-27T00:00:00Z".to_string(),
        }]
    }
}

impl GameScanner for SteamScanner {
    fn source(&self) -> ScannerSource {
        ScannerSource::Steam
    }

    fn scan(&self) -> Vec<ScannedGame> {
        Vec::new()
    }
}

impl GameScanner for EpicGamesScanner {
    fn source(&self) -> ScannerSource {
        ScannerSource::Epic
    }

    fn scan(&self) -> Vec<ScannedGame> {
        Vec::new()
    }
}

impl GameScanner for XboxScanner {
    fn source(&self) -> ScannerSource {
        ScannerSource::Xbox
    }

    fn scan(&self) -> Vec<ScannedGame> {
        Vec::new()
    }
}

impl GameScanner for ManualScanner {
    fn source(&self) -> ScannerSource {
        ScannerSource::Manual
    }

    fn scan(&self) -> Vec<ScannedGame> {
        Vec::new()
    }
}
