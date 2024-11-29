const API_BASE_URL = "http://localhost:8080/api/audio"; // Backend API URL

// Fetch all audio files from the backend
export async function fetchAudioFiles() {
  try {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) {
      throw new Error(`Error fetching audio files: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Rename an audio file
export async function renameAudioFile(id, newName) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (!response.ok) {
      throw new Error(`Error renaming audio file: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

// Process an audio file
export async function processAudio(params) {
  try {
    const response = await fetch(`${API_BASE_URL}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Audio processing failed.");
    }

    const data = await response.json(); // Parse the JSON response
    console.log("Processed file URL:", data.url);
    return data.url; // Extract the URL
  } catch (error) {
    console.error("Error processing audio file:", error);
    throw error;
  }
}

export async function saveTranscription({ fileName, from, to, text }) {
  const response = await fetch("/api/transcription/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName,
      from,
      to,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save transcription: ${response.statusText}`);
  }

  return response.json();
}
