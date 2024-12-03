import { LitElement, html, css } from "lit";
import { fetchAudioFiles } from "./../api.js";

class CategorizedFileList extends LitElement {
  static properties = {
    categorizedFiles: { type: Object },
    newAudioFiles: { type: Array },
  };

  static styles = css`
    .list-container {
      display: flex;
      gap: 2px;
      height: 80vh;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }

    .category-list,
    .new-audio-list {
      flex: 1;
      max-height: 100%;
      overflow-y: auto;
      border: 1px solid #ddd;
      padding: 10px;
      background-color: #dd;
      box-sizing: border-box;
    }

    .category-box,
    .new-audio-box {
      margin-bottom: 10px;
    }

    .category-title,
    .field-title {
      font-weight: bold;
      border-bottom: 1px solid #ddd;
      padding: 5px 0;
      cursor: pointer;
    }

    .field-title {
      margin-left: 5px;
      font-style: italic;
    }

    .audio-file {
      margin-left: 5px;
      cursor: pointer;
      padding: 2px 0;
      margin-bottom: 5px;
    }

    .audio-file:hover {
      text-decoration: underline;
      color: #007bff;
    }
  `;

  constructor() {
    super();
    this.categorizedFiles = {};
    this.newAudioFiles = [];
  }

  async fetchTranscription(fileName) {
    try {
      const response = await fetch(
        `http://localhost:8080/api/transcriptions/${encodeURIComponent(fileName)}`,
      );
      if (!response.ok) {
        console.warn(`Failed to fetch transcription for ${fileName}`);
        return { from: "", to: "" };
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching transcription for ${fileName}:`, error);
      return { from: "", to: "" };
    }
  }

  async refreshFiles() {
    try {
      const audioFiles = await fetchAudioFiles();

      const categorizedFiles = {};
      const newAudioFiles = [];

      for (const file of audioFiles) {
        // Skip files with both TAG and FIELD empty
        if (!file.tag && !file.field) {
          newAudioFiles.push(file); // Push to "New Audio"
          continue;
        }

        // Fetch transcription data to get `FROM` and `TO` values
        const transcriptionData = await this.fetchTranscription(file.name);
        file.from = transcriptionData.from || "";
        file.to = transcriptionData.to || "";

        const tag = file.tag || "UNKNOWN"; // Use "UNKNOWN" for missing TAG
        const field = file.field || "UNKNOWN"; // Use "UNKNOWN" for missing FIELD

        if (!categorizedFiles[tag]) {
          categorizedFiles[tag] = { fields: {}, expanded: true };
        }

        if (!categorizedFiles[tag].fields[field]) {
          categorizedFiles[tag].fields[field] = { files: [], expanded: true };
        }

        categorizedFiles[tag].fields[field].files.push(file);
      }

      this.categorizedFiles = categorizedFiles;
      this.newAudioFiles = newAudioFiles;
    } catch (error) {
      console.error("Error refreshing files:", error);
    }
  }
  async refetchFiles() {
    this.categorizedFiles = {};
    this.newAudioFiles = [];
    this.audioFiles = await fetchAudioFiles(); // Re-fetch from backend

    // Rebuild categorized and new lists
    this.audioFiles.forEach((file) => {
      if (file.tag) {
        const tag = file.tag;
        const field = file.field || "UNKNOWN";

        if (!this.categorizedFiles[tag]) {
          this.categorizedFiles[tag] = { fields: {}, expanded: true };
        }

        if (!this.categorizedFiles[tag].fields[field]) {
          this.categorizedFiles[tag].fields[field] = {
            files: [],
            expanded: true,
          };
        }

        this.categorizedFiles[tag].fields[field].files.push(file);
      } else {
        this.newAudioFiles.push(file);
      }
    });

    this.requestUpdate();
  }

  toggleCategory(tag) {
    if (this.categorizedFiles[tag]) {
      this.categorizedFiles[tag].expanded =
        !this.categorizedFiles[tag].expanded;
      this.requestUpdate();
    }
  }

  toggleField(tag, field) {
    if (
      this.categorizedFiles[tag] &&
      this.categorizedFiles[tag].fields[field]
    ) {
      this.categorizedFiles[tag].fields[field].expanded =
        !this.categorizedFiles[tag].fields[field].expanded;
      this.requestUpdate();
    }
  }

  handleFileClick(file) {
    this.dispatchEvent(new CustomEvent("file-selected", { detail: file }));
  }

  connectedCallback() {
    super.connectedCallback();
    this.refreshFiles();
  }

  renderCategorizedFiles() {
    return html`
      <div class="category-box">
        ${Object.keys(this.categorizedFiles).map((tag) => {
          const category = this.categorizedFiles[tag];
          return html`
            <div>
              <div
                class="category-title"
                @click="${() => this.toggleCategory(tag)}"
              >
                ${tag} (${Object.keys(category.fields).length})
              </div>
              ${category.expanded
                ? html`
                    ${Object.keys(category.fields).map((field) => {
                      const subcategory = category.fields[field];
                      return html`
                        <div>
                          <div
                            class="field-title"
                            @click="${(e) => {
                              e.stopPropagation();
                              this.toggleField(tag, field);
                            }}"
                          >
                            ${field} (${subcategory.files.length})
                          </div>
                          ${subcategory.expanded
                            ? html`
                                ${subcategory.files.map(
                                  (file) => html`
                                    <div
                                      class="audio-file"
                                      @click="${() =>
                                        this.handleFileClick(file)}"
                                    >
                                      ${file.name}
                                      ${file.from ? `FROM: ${file.from}` : ""}
                                      ${file.to ? `TO: ${file.to}` : ""}
                                    </div>
                                  `,
                                )}
                              `
                            : null}
                        </div>
                      `;
                    })}
                  `
                : null}
            </div>
          `;
        })}
      </div>
    `;
  }

  renderNewAudioFiles() {
    return html`
      <div class="new-audio-box">
        <div class="category-title">
          New Audio (${this.newAudioFiles.length})
        </div>
        ${this.newAudioFiles.map(
          (file) => html`
            <div
              class="audio-file"
              @click="${() => this.handleFileClick(file)}"
            >
              ${file.name} ${file.from ? `FROM: ${file.from}` : ""}
              ${file.to ? `TO: ${file.to}` : ""}
            </div>
          `,
        )}
      </div>
    `;
  }

  render() {
    return html`
      <div class="list-container">
        <div class="category-list">${this.renderCategorizedFiles()}</div>
        <div class="new-audio-list">${this.renderNewAudioFiles()}</div>
      </div>
    `;
  }
}

customElements.define("categorized-file-list", CategorizedFileList);
