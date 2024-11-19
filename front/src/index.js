import { LitElement, html, css } from 'lit';
import './components/AudioFileList.js';
import './components/SearchBar.js';
import './components/App.css';
import { fetchAudioFiles } from './api.js';

class App extends LitElement {
  static properties = {
    audioFiles: { type: Array },
    filteredFiles: { type: Array }
  };

  static styles = css`
    .search-bar-container {
      margin-bottom: 20px;
    }
  `;

  constructor() {
    super();
    this.audioFiles = [];
    this.filteredFiles = [];
  }

  async connectedCallback() {
    super.connectedCallback();
    this.audioFiles = await fetchAudioFiles();
    this.filteredFiles = [...this.audioFiles];
  }

  handleSearch(query) {
    const lowerQuery = query.toLowerCase();
    this.filteredFiles = this.audioFiles.filter((file) =>
      file.name.toLowerCase().includes(lowerQuery)
    );
  }

  render() {
    return html`
      <div class="search-bar-container">
        <search-bar
          @search="${(e) => this.handleSearch(e.detail)}"
        ></search-bar>
      </div>
      <audio-file-list .audioFiles="${this.filteredFiles}"></audio-file-list>
    `;
  }
}

customElements.define('app-root', App);