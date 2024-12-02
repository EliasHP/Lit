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
    this.categorizedFiles = {};
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
    return html`
      <ul class="category-list">
        ${Object.keys(this.categorizedFiles).map(
          (tag) => html`
            <li>
              <div
                class="category"
                @click="${() => this.toggleCategory(tag)}"
              >
                ${tag} (${Object.keys(this.categorizedFiles[tag].fields).length})
              </div>
              ${this.categorizedFiles[tag].expanded
                ? html`
                    <ul>
                      ${Object.keys(this.categorizedFiles[tag].fields).map(
                        (field) => html`
                          <li>
                            <div
                              class="subcategory"
                              @click="${() =>
                                this.toggleSubcategory(tag, field)}"
                            >
                              ${field}
                            </div>
                            ${this.categorizedFiles[tag].fields[field].expanded
                              ? html`
                                  <ul>
                                    ${this.categorizedFiles[tag].fields[
                                      field
                                    ].files.map(
                                      (file) => html`
                                        <li
                                          class="file-item"
                                          @click="${() =>
                                            this.handleFileClick(file)}"
                                        >
                                          ${file.name} FROM: ${file.from} TO:
                                          ${file.to}
                                        </li>
                                      `,
                                    )}
                                  </ul>
                                `
                              : ""}
                          </li>
                        `,
                      )}
                    </ul>
                  `
                : ""}
            </li>
          `,
        )}
      </ul>
    `;
  }
}

customElements.define("categorized-file-list", CategorizedFileList);
