import { LitElement, html, css } from 'lit';

export class SideMenu extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    
    .side-menu {
      width: 250px;
      height: 100%;
      background: #fff;
      border-right: 1px solid #e0e0e0;
      transition: transform 0.3s ease;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      padding-top: 60px;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    }

    .side-menu.collapsed {
      transform: translateX(-220px);
    }

    .toggle-button {
      position: absolute;
      right: -15px;
      top: 70px;
      width: 30px;
      height: 30px;
      background: #007bff;
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .menu-content {
      padding: 1rem;
    }
  `;

  static properties = {
    collapsed: { type: Boolean },
  };

  constructor() {
    super();
    this.collapsed = false;
  }

  toggleMenu() {
    this.collapsed = !this.collapsed;
  }

  render() {
    return html`
      <div class="side-menu ${this.collapsed ? 'collapsed' : ''}">
        <button class="toggle-button" @click="${this.toggleMenu}">
          ${this.collapsed ? '→' : '←'}
        </button>
        <div class="menu-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('side-menu', SideMenu);