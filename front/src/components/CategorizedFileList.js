import { LitElement, html, css } from "lit";

class CategorizedFileList extends LitElement {
  static properties = {
    categorizedFiles: { type: Object },
  };

  static styles = css`
    .category-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .category {
      font-weight: bold;
      cursor: pointer;
      margin-top: 10px;
    }

    .subcategory {
      margin-left: 20px;
      font-style: italic;
    }

    .file-item {
      margin-left: 40px;
      cursor: pointer;
    }
  `;
 
  constructor() {
    super();
    this.categorizedFiles = {}; // Default to an empty object
  }
  
  toggleCategory(tag) {
    this.categorizedFiles[tag].expanded = !this.categorizedFiles[tag].expanded;
    this.requestUpdate();
  }

  toggleSubcategory(tag, field) {
    this.categorizedFiles[tag].fields[field].expanded =
      !this.categorizedFiles[tag].fields[field].expanded;
    this.requestUpdate();
  }

  handleFileClick(file) {
    this.dispatchEvent(new CustomEvent("file-selected", { detail: file }));
  }
  
  render() {
    if (!this.categorizedFiles || Object.keys(this.categorizedFiles).length === 0) {
      return html`<div>No categorized files available.</div>`;
    }
  
    return html`
      <ul>
        ${Object.keys(this.categorizedFiles).map(
          (tag) => html`
            <li>
              <div>${tag} (${Object.keys(this.categorizedFiles[tag].fields).length})</div>
              <ul>
                ${Object.keys(this.categorizedFiles[tag].fields).map(
                  (field) => html`
                    <li>
                      <div>${field}</div>
                      <ul>
                        ${this.categorizedFiles[tag].fields[field].files.map(
                          (file) => html`
                            <li
                              @click="${() =>
                                this.handleFileSelection(file)}"
                            >
                              ${file.name} FROM: ${file.from || ""} TO: ${file.to || ""}
                            </li>
                          `,
                        )}
                      </ul>
                    </li>
                  `,
                )}
              </ul>
            </li>
          `,
        )}
      </ul>
    `;
    }
}
customElements.define("categorized-file-list", CategorizedFileList);
