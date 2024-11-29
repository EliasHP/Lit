import { LitElement, html, css } from "lit";
import { processAudio } from "./../api";

class AudioTuner extends LitElement {
  static properties = {
    pitchFactor: { type: Number },
    amplificationFactor: { type: Number },
    compressionThreshold: { type: Number },
    compressionRatio: { type: Number },
    filterFrequency: { type: Number },
    filterBandwidth: { type: Number },
    processingType: { type: String },
    filePath: { type: String },
  };

  static styles = css`
    .tuner-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }

    .slider-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    label {
      font-size: 0.9rem;
      color: #333;
      width: 30%;
      text-align: right;
    }

    input[type="range"] {
      width: 60%;
    }

    .numeric-input {
      width: 50px;
      text-align: center;
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
    this.pitchFactor = 1.0;
    this.amplificationFactor = 1.0;
    this.compressionThreshold = -20;
    this.compressionRatio = 2.0;
    this.filterFrequency = 1000;
    this.filterBandwidth = 200;
    this.processingType = "pitch";
  }

  async processAudioFile() {
    try {
      console.log("Processing audio with params:", {
        type: this.processingType,
        filePath: this.filePath,
        pitchFactor: this.pitchFactor,
        amplificationFactor: this.amplificationFactor,
        compressionThreshold: this.compressionThreshold,
        compressionRatio: this.compressionRatio,
        filterFrequency: this.filterFrequency,
        filterBandwidth: this.filterBandwidth,
      });

      const params = {
        type: this.processingType,
        filePath: this.filePath,
        pitchFactor: this.pitchFactor,
        amplificationFactor: this.amplificationFactor,
        compressionThreshold: this.compressionThreshold,
        compressionRatio: this.compressionRatio,
        filterFrequency: this.filterFrequency,
        filterBandwidth: this.filterBandwidth,
      };
      // Stop playback if in progress
      const audioPlayer = document.querySelector("unified-audio-player");
      if (audioPlayer) {
        audioPlayer.pauseAudio(); // Assuming pauseAudio() exists
      }

      const response = await processAudio(params);
      const newFilePath = await response;

      console.log("Dispatching file-processed event with:", { newFilePath });
      this.dispatchEvent(
        new CustomEvent("file-processed", {
          detail: { newFilePath },
          bubbles: true,
          composed: true,
        }),
      );
    } catch (error) {
      console.error("Error processing audio:", error);
      alert("Error processing audio. Please check the logs.");
    }
  }

  render() {
    return html`
      <div class="tuner-container">
        <div class="slider-container">
          <label>Pitch Adjustment</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            .value="${this.pitchFactor}"
            @input="${(e) => (this.pitchFactor = parseFloat(e.target.value))}"
          />
          <input
            class="numeric-input"
            type="number"
            min="0.5"
            max="2"
            step="0.1"
            .value="${this.pitchFactor}"
            @input="${(e) => (this.pitchFactor = parseFloat(e.target.value))}"
          />
        </div>

        <div class="slider-container">
          <label>Amplification</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            .value="${this.amplificationFactor}"
            @input="${(e) =>
              (this.amplificationFactor = parseFloat(e.target.value))}"
          />
          <input
            class="numeric-input"
            type="number"
            min="0.1"
            max="3"
            step="0.1"
            .value="${this.amplificationFactor}"
            @input="${(e) =>
              (this.amplificationFactor = parseFloat(e.target.value))}"
          />
        </div>

        <div class="slider-container">
          <label>Compression Threshold (dB)</label>
          <input
            type="range"
            min="-50"
            max="0"
            step="1"
            .value="${this.compressionThreshold}"
            @input="${(e) =>
              (this.compressionThreshold = parseFloat(e.target.value))}"
          />
          <input
            class="numeric-input"
            type="number"
            min="-50"
            max="0"
            step="1"
            .value="${this.compressionThreshold}"
            @input="${(e) =>
              (this.compressionThreshold = parseFloat(e.target.value))}"
          />
        </div>

        <div class="slider-container">
          <label>Compression Ratio</label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            .value="${this.compressionRatio}"
            @input="${(e) =>
              (this.compressionRatio = parseFloat(e.target.value))}"
          />
          <input
            class="numeric-input"
            type="number"
            min="1"
            max="10"
            step="0.1"
            .value="${this.compressionRatio}"
            @input="${(e) =>
              (this.compressionRatio = parseFloat(e.target.value))}"
          />
        </div>

        <div class="slider-container">
          <label>Filter Frequency (Hz)</label>
          <input
            type="range"
            min="20"
            max="20000"
            step="100"
            .value="${this.filterFrequency}"
            @input="${(e) =>
              (this.filterFrequency = parseFloat(e.target.value))}"
          />
          <input
            class="numeric-input"
            type="number"
            min="20"
            max="20000"
            step="100"
            .value="${this.filterFrequency}"
            @input="${(e) =>
              (this.filterFrequency = parseFloat(e.target.value))}"
          />
        </div>

        <div class="slider-container">
          <label>Filter Bandwidth</label>
          <input
            type="range"
            min="10"
            max="5000"
            step="10"
            .value="${this.filterBandwidth}"
            @input="${(e) =>
              (this.filterBandwidth = parseFloat(e.target.value))}"
          />
          <input
            class="numeric-input"
            type="number"
            min="10"
            max="5000"
            step="10"
            .value="${this.filterBandwidth}"
            @input="${(e) =>
              (this.filterBandwidth = parseFloat(e.target.value))}"
          />
        </div>

        <button @click="${this.processAudioFile}">Process Audio</button>
      </div>
    `;
  }
}

customElements.define("audio-tuner", AudioTuner);
