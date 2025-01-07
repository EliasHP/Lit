import { LitElement, html, css } from "lit";
import { uploadAudioFiles } from "./../api.js";

class FileUpload extends LitElement {
  static styles = css`
    .upload-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 20px;
      background-color: #f9f9f9;
      width: 100%;
      box-sizing: border-box;
      cursor: pointer;
    }

    .upload-container:hover {
      background-color: #e9e9e9;
    }

    .upload-text {
      font-size: 16px;
      color: #666;
    }

    .file-input {
      display: none;
    }
  `;

  handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    this.uploadFiles(files);
  }

  handleFileInput(event) {
    const files = event.target.files;
    this.uploadFiles(files);
  }

  async uploadFiles(files) {
    try {
      await uploadAudioFiles(files);
      alert("Files uploaded successfully!");
      this.dispatchEvent(
        new CustomEvent("files-uploaded", {
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      console.error("Error uploading files:", error);
      if (error instanceof Response) {
        try {
          const errorData = await error.json(); // Parse the JSON error response
          alert(`File upload failed: ${errorData.error}`);
        } catch (parsingError) {
          console.error("Error parsing JSON error response:", parsingError);
          alert("File upload failed with an unknown error.");
        }
      } else {
        alert("File upload failed: " + error.message || "Unknown error.");
      }
    }
  }

  render() {
    return html`
      <div
        class="upload-container"
        @dragover="${this.handleDragOver}"
        @drop="${this.handleDrop}"
        @click="${() => this.shadowRoot.querySelector("input").click()}"
      >
        <p class="upload-text">Drag & Drop MP3 files here, or click to select</p>
        <input
          type="file"
          class="file-input"
          accept=".mp3"
          multiple
          @change="${this.handleFileInput}"
        />
      </div>
    `;
  }
}

customElements.define("file-upload", FileUpload);
