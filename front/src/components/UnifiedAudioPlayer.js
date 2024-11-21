import WaveSurfer from 'wavesurfer.js';
import './AudioTuner.js';
import { LitElement, html, css } from 'lit';

class UnifiedAudioPlayer extends LitElement {
  static properties = {
    src: { type: String },
    isLooping: { type: Boolean },
    playbackRate: { type: Number },
    volume: { type: Number },
    startPoint: { type: Number },
    endPoint: { type: Number },
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
    .waveform-overlay {
      position: absolute;
      top: 0;
      bottom: 0;
      background-color: rgba(0, 123, 255, 0.2);
      pointer-events: none;
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
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

connectedCallback() {
    super.connectedCallback();

    // Add keydown listener
    if (!this.boundHandleKeyPress) {
        this.boundHandleKeyPress = this.handleKeyPress.bind(this);
        document.addEventListener('keydown', this.boundHandleKeyPress);
    }

    // Add file-processed listener
    if (!this.boundHandleFileProcessed) {
        this.boundHandleFileProcessed = this.handleFileProcessed.bind(this);
        document.addEventListener('file-processed', this.boundHandleFileProcessed);
    }
}

disconnectedCallback() {
    // Remove keydown listener
    if (this.boundHandleKeyPress) {
        document.removeEventListener('keydown', this.boundHandleKeyPress);
        this.boundHandleKeyPress = null;
    }

    // Remove file-processed listener
    if (this.boundHandleFileProcessed) {
        document.removeEventListener('file-processed', this.boundHandleFileProcessed);
        this.boundHandleFileProcessed = null;
    }

    super.disconnectedCallback();
}

  firstUpdated() {
    this.waveSurfer = WaveSurfer.create({
      container: this.shadowRoot.querySelector('.waveform-container'),
      waveColor: '#757575',
      progressColor: '#007bff',
      backend: 'WebAudio',
    });

    if (this.src) {
      this.loadAudio();
    }

    this.waveSurfer.on('audioprocess', () => {
      if (
        this.isLooping &&
        this.endPoint !== null &&
        this.waveSurfer.getCurrentTime() > this.endPoint
      ) {
        this.waveSurfer.seekTo(this.startPoint / this.waveSurfer.getDuration());
        this.waveSurfer.play();
      }
    });

    this.waveSurfer.on('ready', () => {
      this.endPoint = this.waveSurfer.getDuration();
      this.requestUpdate();
    });
  }


  handleFileProcessed(event) {
    console.log('File-processed event received:', event);
    const newFilePath = event.detail?.newFilePath;

    if (!newFilePath) {
        console.error('No new file path provided in file-processed event');
        return;
    }

    console.log(`Processed file path received: ${newFilePath}`);
    this.updateFileSource(newFilePath);
}



  updated(changedProperties) {
    if (changedProperties.has('src')) {
      if (this.src) {
        this.loadAudio();
      } else if (this.waveSurfer) {
        this.waveSurfer.empty();
      }
    }
  }

  loadAudio() {
    this.waveSurfer.load(this.src);
    this.waveSurfer.on('ready', () => {
      this.endPoint = this.waveSurfer.getDuration();
      this.requestUpdate();
    });
  }
  // Swap the file dynamically after processing
  updateFileSource(newSrc) {
    if (!newSrc) {
        console.error('No source provided to updateFileSource!');
        return;
    }

    console.log(`Updating file source to: ${newSrc}`);
    this.src = newSrc;
    this.waveSurfer.empty(); 
    this.waveSurfer.load(this.src); 
}
  
  playAudio() {
    this.waveSurfer.play(this.startPoint, this.endPoint);
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
    this.startPoint = Math.min(
      parseFloat(event.target.value),
      this.endPoint || this.waveSurfer.getDuration()
    );
  }

  setEndPoint(event) {
    this.endPoint = Math.max(
      parseFloat(event.target.value),
      this.startPoint
    );
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
    const waveformWidth = this.waveSurfer?.getDuration()
      ? (this.startPoint / this.waveSurfer.getDuration()) * 100
      : 0;

    const endWidth = this.waveSurfer?.getDuration()
      ? ((this.endPoint || this.waveSurfer.getDuration()) /
          this.waveSurfer.getDuration()) *
        100
      : 100;

    return html`
      <div class="player-container">
        <div class="waveform-container">
          <div
            class="waveform-overlay"
            style="left: ${waveformWidth}%; right: ${100 - endWidth}%;"
          ></div>
          <div class="start-end-labels">
            <span>Start: ${this.startPoint.toFixed(2)}s</span>
            <span>End: ${this.endPoint
              ? this.endPoint.toFixed(2) + 's'
              : 'Full Length'}</span>
          </div>
        </div>
        <div class="controls">
          <button @click="${this.playAudio}">Play</button>
          <button @click="${this.pauseAudio}">Pause</button>
          <button @click="${this.stopAudio}">Stop</button>
          <button @click="${this.rewindAudio}">Rewind 5s</button>
          <button
            @click="${this.toggleLoop}"
            style="background-color: ${this.isLooping ? '#28a745' : '#007bff'}"
          >
            Loop: ${this.isLooping ? 'On' : 'Off'}
          </button>
        </div>
        <div class="sliders">
          <div class="slider-container">
            <label>Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              .value="${this.volume}"
              @input="${this.setVolume}"
            />
          </div>
          <div class="slider-container">
            <label>Speed</label>
            <input
              class="numeric-input"
              type="number"
              min="0.5"
              max="2"
              step="0.1"
              .value="${this.playbackRate}"
              @input="${this.setPlaybackRate}"
            />
          </div>
        </div>
        <div class="sliders">
          <div class="slider-container">
            <label>Start</label>
            <input
              type="range"
              min="0"
              max="${this.waveSurfer?.getDuration() || 0}"
              step="0.1"
              .value="${this.startPoint}"
              @input="${this.setStartPoint}"
            />
            <input
              class="numeric-input"
              type="number"
              min="0"
              max="${this.waveSurfer?.getDuration() || 0}"
              step="0.1"
              .value="${this.startPoint}"
              @input="${this.setStartPoint}"
            />
          </div>
          <div class="slider-container">
            <label>End</label>
            <input
              type="range"
              min="0"
              max="${this.waveSurfer?.getDuration() || 0}"
              step="0.1"
              .value="${this.endPoint || this.waveSurfer?.getDuration()}"
              @input="${this.setEndPoint}"
            />
            <input
              class="numeric-input"
              type="number"
              min="0"
              max="${this.waveSurfer?.getDuration() || 0}"
              step="0.1"
              .value="${this.endPoint || this.waveSurfer?.getDuration()}"
              @input="${this.setEndPoint}"
            />
            
          </div>

        </div>
        <audio-tuner
          .filePath="${this.src}" 
        ></audio-tuner>
    `;
  }
}

customElements.define('unified-audio-player', UnifiedAudioPlayer);