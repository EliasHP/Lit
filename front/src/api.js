const API_BASE_URL = 'http://localhost:8080/api/audio'; // Backend API URL

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
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

// Other API methods gona be added later
