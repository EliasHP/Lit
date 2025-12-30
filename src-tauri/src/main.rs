use std::{
    collections::HashMap,
    net::SocketAddr,
    path::{Path, PathBuf},
    sync::Arc,
};

use anyhow::Result;
use axum::{
    extract::{Multipart, Path as AxumPath, State},
    http::{Method, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tokio::{fs, net::TcpListener, sync::RwLock};
use tower::ServiceBuilder;
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeDir,
    trace::TraceLayer,
};
use tracing::{error, info};
use uuid::Uuid;

const SERVER_PORT: u16 = 8080;

#[derive(Clone)]
struct AppState {
    audio_dir: PathBuf,
    inner: Arc<RwLock<InnerState>>,
}

#[derive(Default)]
struct InnerState {
    next_id: u64,
    audio_files: HashMap<String, AudioFileMetadata>,
    transcriptions: HashMap<String, TranscriptionResponse>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AudioFileMetadata {
    id: u64,
    name: String,
    file_name: String,
    path: String,
    to_field: Option<String>,
    from_field: Option<String>,
    transcript: Option<String>,
    whisper: Option<String>,
    tag: Option<String>,
    field: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AudioProcessingRequest {
    file_path: String,
    #[serde(rename = "type")]
    processing_type: String,
    pitch_factor: f64,
    amplification_factor: f64,
    compression_threshold: f64,
    compression_ratio: f64,
    filter_frequency: f64,
    filter_bandwidth: f64,
}

#[derive(Debug, Serialize)]
struct AudioProcessingResponse {
    url: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateAudioRequest {
    name: String,
    path: Option<String>,
    to_field: Option<String>,
    from_field: Option<String>,
    transcript: Option<String>,
    whisper: Option<String>,
    tag: Option<String>,
    field: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct TranscriptionRequest {
    file_name: String,
    from: String,
    to: String,
    transcription: String,
    tag: Option<String>,
    field: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct TranscriptionResponse {
    from: String,
    to: String,
    transcription: String,
    whisper: Option<String>,
    tag: Option<String>,
    field: Option<String>,
}

fn main() {
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .with_target(false)
        .init();

    tauri::Builder::default()
        .setup(|app| {
            let audio_dir = audio_directory();
            if let Err(err) = std::fs::create_dir_all(&audio_dir) {
                error!("Failed to create audio directory: {err}");
            }

            let state = AppState::new(audio_dir);

            tauri::async_runtime::spawn(async move {
                if let Err(err) = serve(state).await {
                    error!("Failed to launch Axum server: {err}");
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn audio_directory() -> PathBuf {
    std::env::current_dir()
        .map(|dir| dir.join("audio"))
        .unwrap_or_else(|_| PathBuf::from("audio"))
}

impl AppState {
    fn new(audio_dir: PathBuf) -> Self {
        let mut inner = InnerState::default();
        if let Ok(entries) = std::fs::read_dir(&audio_dir) {
            for entry in entries.flatten() {
                if let Ok(file_type) = entry.file_type() {
                    if file_type.is_file() {
                        if let Some(ext) = entry.path().extension() {
                            if ext == "mp3" {
                                if let Some(file_name) = entry.file_name().to_str() {
                                    inner.add_audio_file(
                                        &audio_dir,
                                        file_name.to_string(),
                                        None,
                                        None,
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }

        Self {
            audio_dir,
            inner: Arc::new(RwLock::new(inner)),
        }
    }

    fn audio_base_url(&self) -> String {
        format!("http://localhost:{SERVER_PORT}")
    }

    async fn register_audio_file(
        &self,
        file_name: String,
        tag: Option<String>,
        field: Option<String>,
    ) -> AudioFileMetadata {
        let mut inner = self.inner.write().await;
        inner.add_audio_file(&self.audio_dir, file_name, tag, field)
    }

    async fn list_audio_files(&self) -> Vec<AudioFileMetadata> {
        let inner = self.inner.read().await;
        let mut files: Vec<_> = inner.audio_files.values().cloned().collect();
        files.sort_by(|a, b| a.name.cmp(&b.name));
        files
    }

    async fn insert_transcription(
        &self,
        file_name: String,
        payload: TranscriptionRequest,
    ) -> TranscriptionResponse {
        let response = TranscriptionResponse {
            from: payload.from,
            to: payload.to,
            transcription: payload.transcription,
            whisper: None,
            tag: payload.tag.clone(),
            field: payload.field.clone(),
        };

        let mut inner = self.inner.write().await;
        if let Some(file) = inner.audio_files.get_mut(&file_name) {
            if let Some(tag) = payload.tag {
                file.tag = Some(tag);
            }
            if let Some(field) = payload.field {
                file.field = Some(field);
            }
        }
        inner.transcriptions.insert(file_name, response.clone());
        response
    }

    async fn remove_transcription(&self, file_name: &str) {
        let mut inner = self.inner.write().await;
        inner.transcriptions.remove(file_name);
        if let Some(file) = inner.audio_files.get_mut(file_name) {
            file.tag = None;
            file.field = None;
        }
    }

    async fn get_transcription(&self, file_name: &str) -> Option<TranscriptionResponse> {
        let inner = self.inner.read().await;
        inner.transcriptions.get(file_name).cloned()
    }
}

impl InnerState {
    fn add_audio_file(
        &mut self,
        audio_dir: &Path,
        file_name: String,
        tag: Option<String>,
        field: Option<String>,
    ) -> AudioFileMetadata {
        self.next_id += 1;
        let path = audio_dir.join(&file_name);

        let metadata = AudioFileMetadata {
            id: self.next_id,
            name: file_name.clone(),
            file_name: file_name.clone(),
            path: path.to_string_lossy().to_string(),
            to_field: None,
            from_field: None,
            transcript: None,
            whisper: None,
            tag,
            field,
        };

        self.audio_files.insert(file_name.clone(), metadata.clone());
        metadata
    }
}

async fn serve(state: AppState) -> Result<()> {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::DELETE, Method::OPTIONS])
        .allow_headers(Any);

    let api_router = Router::new()
        .route("/upload", post(upload_audio))
        .route("/audio", get(list_audio).post(create_audio))
        .route("/audio/process", post(process_audio))
        .route(
            "/transcriptions/:file_name",
            get(get_transcription).post(save_transcription),
        )
        .route("/transcriptions", post(save_transcription_without_path))
        .route(
            "/transcriptions/clear/:file_name",
            axum::routing::delete(clear_transcription),
        )
        .with_state(state.clone());

    let serve_dir = ServeDir::new(state.audio_dir.clone());
    let service_stack = ServiceBuilder::new()
        .layer(TraceLayer::new_for_http())
        .layer(cors);

    let app = Router::new()
        .nest("/api", api_router)
        .nest_service("/", serve_dir)
        .layer(service_stack);

    let addr: SocketAddr = ([0, 0, 0, 0], SERVER_PORT).into();
    let listener = TcpListener::bind(addr).await?;

    info!("Axum server listening on http://{addr}");
    axum::serve(listener, app.into_make_service()).await?;

    Ok(())
}

async fn upload_audio(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<HashMap<String, String>>, Response> {
    let mut saved_files = Vec::new();

    while let Some(field) = multipart.next_field().await.map_err(internal_error)? {
        let Some(file_name) = field.file_name().map(|name| name.to_string()) else {
            return Err(error_response(
                StatusCode::BAD_REQUEST,
                "Invalid file: no filename provided",
            ));
        };

        let sanitized_name = sanitize_file_name(&file_name);
        if !sanitized_name.to_lowercase().ends_with(".mp3") {
            return Err(error_response(
                StatusCode::BAD_REQUEST,
                "Only MP3 files are allowed.",
            ));
        }

        let target = state.audio_dir.join(&sanitized_name);
        if target.exists() {
            return Err(error_response(
                StatusCode::BAD_REQUEST,
                &format!(
                    "A file with the name '{sanitized_name}' already exists in the audio directory."
                ),
            ));
        }

        let data = field.bytes().await.map_err(internal_error)?;
        fs::create_dir_all(&state.audio_dir)
            .await
            .map_err(internal_error)?;
        fs::write(&target, data).await.map_err(internal_error)?;

        state
            .register_audio_file(sanitized_name.clone(), None, None)
            .await;
        saved_files.push(sanitized_name);
    }

    Ok(Json(HashMap::from([(
        "message".to_string(),
        format!("Uploaded {} file(s).", saved_files.len()),
    )])))
}

async fn list_audio(State(state): State<AppState>) -> Json<Vec<AudioFileMetadata>> {
    Json(state.list_audio_files().await)
}

async fn create_audio(
    State(state): State<AppState>,
    Json(payload): Json<CreateAudioRequest>,
) -> Result<Json<AudioFileMetadata>, Response> {
    let file_name = payload.name.clone();
    let mut inner = state.inner.write().await;
    if inner.audio_files.contains_key(&file_name) {
        return Err(error_response(
            StatusCode::BAD_REQUEST,
            "Audio entry already exists.",
        ));
    }

    inner.next_id += 1;
    let path = payload.path.unwrap_or_else(|| {
        state
            .audio_dir
            .join(&payload.name)
            .to_string_lossy()
            .to_string()
    });

    let metadata = AudioFileMetadata {
        id: inner.next_id,
        name: payload.name.clone(),
        file_name: payload.name,
        path,
        to_field: payload.to_field,
        from_field: payload.from_field,
        transcript: payload.transcript,
        whisper: payload.whisper,
        tag: payload.tag,
        field: payload.field,
    };

    inner
        .audio_files
        .insert(metadata.file_name.clone(), metadata.clone());

    Ok(Json(metadata))
}

async fn process_audio(
    State(state): State<AppState>,
    Json(payload): Json<AudioProcessingRequest>,
) -> Result<Json<AudioProcessingResponse>, Response> {
    if payload.file_path.trim().is_empty() {
        return Err(error_response(
            StatusCode::BAD_REQUEST,
            "File path is missing in the request.",
        ));
    }

    let source_path = resolve_audio_path(&state.audio_dir, &payload.file_path);
    if !source_path.exists() {
        return Err(error_response(
            StatusCode::BAD_REQUEST,
            &format!("File not found: {}", source_path.display()),
        ));
    }

    let stem = source_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("processed");
    let suffix = payload.processing_type.to_lowercase().replace(' ', "_");
    let new_file_name = format!("{stem}_{suffix}.mp3");
    let target_path = state.audio_dir.join(&new_file_name);

    fs::copy(&source_path, &target_path)
        .await
        .map_err(internal_error)?;

    state
        .register_audio_file(new_file_name.clone(), None, None)
        .await;

    let url = format!("{}/{}", state.audio_base_url(), new_file_name);
    Ok(Json(AudioProcessingResponse { url }))
}

async fn save_transcription(
    AxumPath(file_name): AxumPath<String>,
    State(state): State<AppState>,
    Json(payload): Json<TranscriptionRequest>,
) -> Result<Json<HashMap<String, String>>, Response> {
    let normalized = if payload.file_name.is_empty() {
        file_name
    } else {
        payload.file_name.clone()
    };

    let _ = state
        .insert_transcription(normalized.clone(), payload)
        .await;

    Ok(Json(HashMap::from([(
        "message".to_string(),
        "Transcription saved successfully!".to_string(),
    )])))
}

async fn save_transcription_without_path(
    State(state): State<AppState>,
    Json(payload): Json<TranscriptionRequest>,
) -> Result<Json<HashMap<String, String>>, Response> {
    let file_name = payload.file_name.clone();
    let _ = state.insert_transcription(file_name, payload).await;

    Ok(Json(HashMap::from([(
        "message".to_string(),
        "Transcription saved successfully!".to_string(),
    )])))
}

async fn get_transcription(
    AxumPath(file_name): AxumPath<String>,
    State(state): State<AppState>,
) -> Result<Json<TranscriptionResponse>, Response> {
    match state.get_transcription(&file_name).await {
        Some(data) => Ok(Json(data)),
        None => Err(StatusCode::NOT_FOUND.into_response()),
    }
}

async fn clear_transcription(
    AxumPath(file_name): AxumPath<String>,
    State(state): State<AppState>,
) -> Result<Json<HashMap<String, String>>, Response> {
    state.remove_transcription(&file_name).await;
    Ok(Json(HashMap::from([(
        "message".to_string(),
        "Transcription cleared.",
    )])))
}

fn sanitize_file_name(original: &str) -> String {
    let mut sanitized = original.replace(['\\', '/'], "-");
    if sanitized.len() > 30 {
        let extension = Path::new(&sanitized)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("");
        let base = Path::new(&sanitized)
            .file_stem()
            .and_then(|stem| stem.to_str())
            .unwrap_or("file");
        sanitized = if extension.is_empty() {
            format!("{}-{}", Uuid::new_v4(), base)
        } else {
            format!("{}-{}.{}", Uuid::new_v4(), base, extension)
        };
    }
    sanitized
}

fn resolve_audio_path(audio_dir: &Path, input: &str) -> PathBuf {
    if input.starts_with("http") {
        if let Some(file_name) = input.split('/').last() {
            return audio_dir.join(file_name);
        }
    }

    let candidate = PathBuf::from(input);
    if candidate.is_absolute() {
        candidate
    } else {
        audio_dir.join(candidate)
    }
}

fn internal_error<E: std::fmt::Display>(err: E) -> Response {
    error_response(
        StatusCode::INTERNAL_SERVER_ERROR,
        &format!("Internal server error: {err}"),
    )
}

fn error_response(status: StatusCode, message: &str) -> Response {
    let body = Json(HashMap::from([("error".to_string(), message.to_string())]));
    (status, body).into_response()
}
