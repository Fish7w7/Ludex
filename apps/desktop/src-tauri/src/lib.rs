mod commands;
mod scanners;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::scan_games_mock,
            commands::launch_game_stub
        ])
        .run(tauri::generate_context!())
        .expect("error while running Ludex");
}

