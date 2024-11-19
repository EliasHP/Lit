import { LitElement, html, css } from 'lit';

class SearchBar extends LitElement {
  static properties = {
    placeholder: { type: String },
    onSearch: { type: Function },
  };

  static styles = css`
    .search-bar {
      width: 100%;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    }
  `;

  constructor() {
    super();
    this.placeholder = 'Search audio files...';
    this.onSearch = () => {};
  }

  handleInput(event) {
    this.onSearch(event.target.value);
  }

  render() {
    return html`
      <input
        class="search-bar"
        type="text"
        placeholder="${this.placeholder}"
        @input="${this.handleInput}"
      />
    `;
  }
}

customElements.define('search-bar', SearchBar);
