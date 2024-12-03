import { LitElement, html, css } from "lit";

import "./components/UnifiedAudioPlayer.js";
import "./components/SearchBar.js";
import "./components/App.css";
import "./components/CategorizedFileList.js";
import { fetchAudioFiles } from "./api.js";

class App extends LitElement {
  static properties = {
    selectedFile: { type: Object },
  };

  static styles = css`
    .search-bar-container {
      margin-bottom: 20px;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f9;
    }

    .main-content {
      display: flex;
    }
    .transcription-section {
      display: flex;
    }
    #app-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      box-sizing: border-box;
    }

    .file-list-container {
    }

    .audio-player-container {
      width: 100%;
      border: 1px solid #ddd;
      padding: 10px;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .left-container {
      width: 40%;
    }
    .right-container {
      width: 60%;
    }
    .audio-player-container unified-audio-player {
      width: 100%;
    }

    #header {
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    #folder {
      width: 80%;
      max-width: 1200px;
      background: #ffffff;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    }

    #folder-title {
      font-size: 20px;
      margin-bottom: 10px;
      font-weight: bold;
      color: #555;
    }
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
    .file-lists-container {
      display: flex;
      gap: 1rem; /* Space between the two lists */
    }

    audio-file-list,
    categorized-file-list {
      flex: 1; /* Distribute available space equally */
      max-height: 80vh;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 10px;
      background-color: #fff;
    }
  `;

  constructor() {
    super();
    this.selectedFile = null;

    this.addEventListener("file-updated", () => this.handleFileUpdated());
  }

  handleFileSelection(file) {
    const backendBaseUrl = "http://localhost:8080";
    this.selectedFile = {
      ...file,
      url: `${backendBaseUrl}/${decodeURIComponent(file.fileName || file.name)}`, // Ensure proper URL formatting
    };
  }

  handleFileUpdated() {
    const categorizedFileList = this.shadowRoot.querySelector(
      "categorized-file-list",
    );
    if (categorizedFileList) {
      categorizedFileList.refetchFiles();
    }
  }

  render() {
    return html`
      <div id="header">Lit Listener</div>
      <div class="layout-container">
        <div class="main-content">
          <div class="left-container">
            <div class="search-container">
              <search-bar
                @search="${(e) => this.handleSearch(e.detail)}"
              ></search-bar>
            </div>
            <div class="file-lists-container">
              <categorized-file-list
                .categorizedFiles="${this.categorizedFiles}"
                .newAudioFiles="${this.newAudioFiles}"
                @file-selected="${(e) => this.handleFileSelection(e.detail)}"
                @file-updated="${(e) => this.handleFileUpdate(e.detail)}"
              ></categorized-file-list>
            </div>
          </div>
          <div class="right-container">
            <div class="audio-player-container">
              <unified-audio-player
                .src="${this.selectedFile ? this.selectedFile.url : ""}"
              ></unified-audio-player>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define("app-root", App);
