import WaveSurfer from 'wavesurfer.js';
import { LitElement, html, css } from 'lit';

class UnifiedAudioPlayer extends LitElement {
  static properties = {
    src: { type: String }, // Audio file path
  };

  static styles = css`
    .player-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .waveform-container {
      width: 100%;
      height: 100px;
      margin-bottom: 10px;
    }
    .controls {
      margin-top: 60px;
      display: flex;
      gap: 10px;
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
    this.src = '';
    this.waveSurfer = null;
  }

  firstUpdated() {
    // Initialize WaveSurfer
    this.waveSurfer = WaveSurfer.create({
      container: this.shadowRoot.querySelector('.waveform-container'),
      waveColor: '#ddd',
      progressColor: '#007bff',
      backend: 'MediaElement', // Use MediaElement backend for native <audio> support
    });

    if (this.src) {
      this.loadAudio();
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('src')) {
      if (this.src) {
        console.log('Audio source updated:', this.src);
        this.loadAudio();
      } else if (this.waveSurfer) {
        console.log('Clearing waveform, no audio source provided');
        this.waveSurfer.empty(); // Clear waveform when no audio source
      }
    }
  }

  loadAudio() {
    if (this.waveSurfer) {
      this.waveSurfer.load(this.src);
    }
  }

  playAudio() {
    this.waveSurfer.play();
  }

  pauseAudio() {
    this.waveSurfer.pause();
  }

  stopAudio() {
    this.waveSurfer.stop();
  }

  rewindAudio() {
    const currentTime = this.waveSurfer.getCurrentTime();
    this.waveSurfer.setCurrentTime(Math.max(0, currentTime - 5));
  }

  render() {
    return html`
      <div class="player-container">
        <div class="waveform-container"></div>
        <div class="controls">
          <button @click="${this.playAudio}">Play</button>
          <button @click="${this.pauseAudio}">Pause</button>
          <button @click="${this.stopAudio}">Stop</button>
          <button @click="${this.rewindAudio}">Rewind 5s</button>
        </div>
      </div>
    `;
  }
}

customElements.define('unified-audio-player', UnifiedAudioPlayer);
