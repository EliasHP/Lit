import WaveSurfer from 'wavesurfer.js';
import { LitElement, html, css } from 'lit';

class UnifiedAudioPlayer extends LitElement {
  static properties = {
    src: { type: String }, // Audio file path
    isLooping: { type: Boolean },
    playbackRate: { type: Number }, // Speed control
    volume: { type: Number }, // Volume control
    startPoint: { type: Number }, // Start point for playback
    endPoint: { type: Number }, // End point for playback
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
      position: relative;
    }
    .controls {
      margin-top: 10px;
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
    .sliders {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      width: 100%;
    }
    input[type='range'] {
      width: 100%;
    }
    .slider-container {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 10px;
    }
    .numeric-input {
      width: 50px;
      text-align: center;
    }
    .start-end-labels {
      position: absolute;
      display: flex;
      justify-content: space-between;
      width: 100%;
      top: -20px;
    }
    .start-end-labels span {
      font-size: 12px;
      color: #555;
    }
  `;

  constructor() {
    super();
    this.src = '';
    this.isLooping = false;
    this.playbackRate = 1.0;
    this.volume = 1.0;
    this.startPoint = 0;
    this.endPoint = null;
    this.waveSurfer = null;

    // Bind key events for spacebar
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.handleKeyPress);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeyPress);
    super.disconnectedCallback();
  }

  firstUpdated() {
    // Initialize WaveSurfer
    this.waveSurfer = WaveSurfer.create({
      container: this.shadowRoot.querySelector('.waveform-container'),
      waveColor: '#ddd',
      progressColor: '#007bff',
      backend: 'WebAudio', // WebAudio backend is required for setCurrentTime
    });

    if (this.src) {
      this.loadAudio();
    }

    // Listen to playback progress to handle looping
    this.waveSurfer.on('audioprocess', () => {
      if (this.isLooping && this.endPoint !== null && this.waveSurfer.getCurrentTime() > this.endPoint) {
        this.waveSurfer.seekTo(this.startPoint / this.waveSurfer.getDuration());
        this.waveSurfer.play();
      }
    });
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
      this.waveSurfer.on('ready', () => {
        this.endPoint = this.waveSurfer.getDuration(); // Set endPoint to full duration
      });
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
    this.waveSurfer.setTime(Math.max(0, currentTime - 5));
  }

  toggleLoop() {
    this.isLooping = !this.isLooping;
  }

  setVolume(event) {
    this.volume = event.target.value;
    this.waveSurfer.setVolume(this.volume);
  }

  setPlaybackRate(event) {
    this.playbackRate = parseFloat(event.target.value);
    this.waveSurfer.setPlaybackRate(this.playbackRate);
  }

  setStartPoint(event) {
    this.startPoint = parseFloat(event.target.value);
  }

  setEndPoint(event) {
    this.endPoint = parseFloat(event.target.value);
  }

  handleKeyPress(event) {
    if (event.code === 'Space') {
      event.preventDefault();
      if (this.waveSurfer.isPlaying()) {
        this.pauseAudio();
      } else {
        this.playAudio();
      }
    }
  }

  render() {
    return html`
      <div class="player-container">
        <div class="waveform-container">
          <div class="start-end-labels">
            <span>Start: ${this.startPoint.toFixed(2)}s</span>
            <span>End: ${this.endPoint ? this.endPoint.toFixed(2) + 's' : 'Full Length'}</span>
          </div>
        </div>
        <div class="controls">
          <button @click="${this.playAudio}">Play</button>
          <button @click="${this.pauseAudio}">Pause</button>
          <button @click="${this.stopAudio}">Stop</button>
          <button @click="${this.rewindAudio}">Rewind 5s</button>
          <button @click="${this.toggleLoop}" style="background-color: ${this.isLooping ? '#28a745' : '#007bff'}">
            Loop: ${this.isLooping ? 'On' : 'Off'}
          </button>
        </div>
        <div class="sliders">
          <div class="slider-container">
            <label>Volume</label>
            <input type="range" min="0" max="1" step="0.01" .value="${this.volume}" @input="${this.setVolume}" />
          </div>
          <div class="slider-container">
            <label>Speed</label>
            <input class="numeric-input" type="number" min="0.5" max="2" step="0.1" .value="${this.playbackRate}" @input="${this.setPlaybackRate}" />
          </div>
        </div>
        <div class="sliders">
          <div class="slider-container">
            <label>Start</label>
            <input type="range" min="0" max="${this.waveSurfer?.getDuration() || 0}" step="0.1" .value="${this.startPoint}" @input="${this.setStartPoint}" />
          </div>
          <div class="slider-container">
            <label>End</label>
            <input type="range" min="0" max="${this.waveSurfer?.getDuration() || 0}" step="0.1" .value="${this.endPoint || this.waveSurfer?.getDuration()}" @input="${this.setEndPoint}" />
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('unified-audio-player', UnifiedAudioPlayer);
