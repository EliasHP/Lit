import { LitElement, html, css } from 'lit';

class TranscriptionSection extends LitElement {
  static properties = {
    fileName: { type: String },
  };

  static styles = css`
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
  `;

  render() {
    return html`
      <div class="transcription-section">
        <h4>Transcription for: ${this.fileName || 'No file loaded'}</h4>
        <div class="write-section">
          <div class="time-inputs">
            <div class="time-input">
              <label>From:</label>
              <input type="text" />
            </div>
            <div class="time-input">
              <label>To:</label>
              <input type="text" />
            </div>
          </div>
        </div>
        <div class="textarea-section">
          <textarea placeholder="Write what you hear"></textarea>
        </div>
        <div class="whisper-section">
          <textarea placeholder="What Whisper heard" readonly></textarea>
        </div>
      </div>
    `;
  }
}

customElements.define('transcription-section', TranscriptionSection);
