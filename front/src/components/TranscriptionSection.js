import { LitElement, html, css } from 'lit';

class TranscriptionSection extends LitElement {
  static properties = {
    fileName: { type: String },
    fromTime: { type: String },
    toTime: { type: String },
    transcriptionText: { type: String },
    whisperText: { type: String },
  };

  constructor() {
    super();
    this.fileName = '';
    this.fromTime = '';
    this.toTime = '';
    this.transcriptionText = '';
    this.whisperText = '';
  }

  static styles = css`
    /* Keep the existing styles */
    .transcription-section {
      gap: 1.5rem;
      width: 100%;
      display: flex;
      flex-wrap: wrap;
    }

    .write-section {
      width: 100%;
    }

    .time-inputs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .time-input {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .time-input input {
      width: 100px;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .textarea-section,
    .whisper-section {
      margin-right: 20px;
      width: 40%;
    }

    textarea {
      width: 100%;
      min-height: 150px;
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      resize: vertical;
      padding-left: 20px;
    }

    .save-button {
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .save-button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `;

  // Fetch transcription data from the backend
  async fetchTranscription() {
    if (!this.fileName || this.fileName === 'No file loaded') {
      console.warn('No valid file name provided for fetching transcription.');
      return; // Skip fetching if no valid file name
    }
  
    try {
      const response = await fetch(`http://localhost:8080/api/transcriptions/${this.fileName}`);
      if (!response.ok) {
        throw new Error(`Error fetching transcription: ${response.status}`);
      }
  
      const data = await response.json();
      this.fromTime = data.from;
      this.toTime = data.to;
      this.transcriptionText = data.transcription;
      this.whisperText = data.whisper || '';
    } catch (error) {
      console.error('Error fetching transcription:', error);
    }
  }
  

  // Save transcription data to the backend
  async saveTranscription() {
    if (!this.fileName) {
      alert('No file selected');
      return;
    }

    const payload = {
      fileName: this.fileName.replace('_pitch.mp3', '.mp3'), // Remove _pitch suffix
      from: this.fromTime,
      to: this.toTime,
      transcription: this.transcriptionText,
    };

    try {
      const response = await fetch('http://localhost:8080/api/transcriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      alert('Transcription saved successfully!');
    } catch (error) {
      console.error('Error saving transcription:', error);
      alert('Failed to save transcription. Check the logs for details.');
    }
  }

  // Trigger fetching when `fileName` changes
  updated(changedProperties) {
    if (changedProperties.has('fileName')) {
      this.fetchTranscription();
    }
  }

  render() {
    return html`
      <div class="transcription-section">
        <h4>Transcription for: ${this.fileName || 'No file loaded'}</h4>
        <div class="write-section">
          <div class="time-inputs">
            <div class="time-input">
              <label>From:</label>
              <input
                type="text"
                .value="${this.fromTime}"
                @input="${(e) => (this.fromTime = e.target.value)}"
              />
            </div>
            <div class="time-input">
              <label>To:</label>
              <input
                type="text"
                .value="${this.toTime}"
                @input="${(e) => (this.toTime = e.target.value)}"
              />
            </div>
          </div>
        </div>
        <div class="textarea-section">
          <textarea
            placeholder="Write what you hear"
            .value="${this.transcriptionText}"
            @input="${(e) => (this.transcriptionText = e.target.value)}"
          ></textarea>
        </div>
        <div class="whisper-section">
          <textarea
            placeholder="What Whisper heard"
            readonly
            .value="${this.whisperText}"
          ></textarea>
        </div>
        <button
          class="save-button"
          @click="${this.saveTranscription}"
          ?disabled="${!this.fileName}"
        >
          Save Transcription
        </button>
      </div>
    `;
  }
}

customElements.define('transcription-section', TranscriptionSection);
