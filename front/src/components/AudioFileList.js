import { LitElement, html, css } from 'lit';

class AudioFileList extends LitElement {
  static properties = {
    audioFiles: { type: Array },
  };

  static styles = css`
    .audio-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
      .audio-list-container {
      max-height: 80vh; /* Adjust the height relative to the viewport */
      overflow-y: auto; /* Enable vertical scrolling if content exceeds height */
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 10px;
      background-color: #fff;
    }
    .audio-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    .audio-item span {
      font-size: 16px;
    }
  `;

  constructor() {
    super();
    this.audioFiles = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('audioFiles')) {
      // Optional: Add any preprocessing of audioFiles here if needed
      console.log('Audio files updated:', this.audioFiles);
    }
  }
  handleFileClick(file) {
    console.log('File clicked:', file); // Debug log
    this.dispatchEvent(new CustomEvent('file-selected', { detail: file }));
  }
  
  
  generateFileList() {
    if (!this.audioFiles || this.audioFiles.length === 0) {
      return html`<li>No audio files found.</li>`;
    }

    return this.audioFiles.map(
      (file) => html`
        <li class="audio-item" @click="${() => this.handleFileClick(file)}">
          <span>${file.name}</span>
          <span>${file.path}</span>
        </li>
      `
    );
  }

  render() {
    return html`
    <div class="audio-list-container">
      <ul class="audio-list">
        ${this.generateFileList()}
      </ul>
    </div>
    `;
  }
}

customElements.define('audio-file-list', AudioFileList);