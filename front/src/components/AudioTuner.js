import { LitElement, html, css } from 'lit';

class AudioTuner extends LitElement {
  static properties = {
    audioContext: { type: Object },
    sourceNode: { type: Object },
    gainValue: { type: Number }, // For volume
    compressionActive: { type: Boolean }, // Toggle for compression
  };

  static styles = css`
    .tuner-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }

    .slider-container {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    label {
      font-size: 0.9rem;
      color: #333;
    }

    input[type='range'] {
      width: 100%;
    }

    button {
      padding: 5px 10px;
      border: none;
      border-radius: 3px;
      background-color: #007bff;
      color: white;
      cursor: pointer;
    }

    button:disabled {
      background-color: #ccc;
    }
  `;

  constructor() {
    super();
    this.audioContext = null;
    this.sourceNode = null;
    this.gainValue = 1.0;
    this.compressionActive = false;
    this.gainNode = null;
    this.compressorNode = null;
  }

  firstUpdated() {
    // Initialize audio nodes
    if (this.audioContext && this.sourceNode) {
      this.setupAudioChain();
    }
  }

  setupAudioChain() {
    // Create GainNode for volume adjustment
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.gainValue;

    // Create DynamicsCompressorNode for noise capping
    this.compressorNode = this.audioContext.createDynamicsCompressor();
    this.compressorNode.threshold.value = -30; // Adjust based on requirements
    this.compressorNode.knee.value = 40;
    this.compressorNode.ratio.value = 12;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;

    // Connect nodes in the audio chain
    this.sourceNode.connect(this.gainNode);
    this.gainNode.connect(this.compressorNode);
    this.compressorNode.connect(this.audioContext.destination);
  }

  handleVolumeChange(event) {
    const newValue = parseFloat(event.target.value);
    this.gainValue = newValue;
    if (this.gainNode) {
      this.gainNode.gain.value = newValue;
    }
  }

  toggleCompression() {
    this.compressionActive = !this.compressionActive;
    if (this.compressorNode) {
      this.compressorNode.threshold.value = this.compressionActive ? -30 : 0; // Adjust threshold
    }
  }

  render() {
    return html`
      <div class="tuner-container">
        <div class="slider-container">
          <label for="volume">Volume</label>
          <input
            id="volume"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value="${this.gainValue}"
            @input="${this.handleVolumeChange}"
          />
        </div>
        <button @click="${this.toggleCompression}">
          ${this.compressionActive ? 'Disable' : 'Enable'} Compression
        </button>
      </div>
    `;
  }
}

customElements.define('audio-tuner', AudioTuner);
