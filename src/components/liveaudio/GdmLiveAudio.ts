import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Theme } from '../../../types';

// WebKit compatibility
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
  interface HTMLElementTagNameMap {
    'gdm-live-audio': GdmLiveAudio;
  }
}

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  @property({ type: String }) theme: Theme = Theme.LIGHT;
  @state() status = 'Live audio is currently disabled.';

  override render() {
    return html`
      <div class="gdm-live-audio ${this.theme}">
        <div class="status">Live audio is currently <b>disabled</b> (feature parked for now).</div>
      </div>
    `;
  }

  static override styles = css`
    :host { display: block; }
    .gdm-live-audio { padding: 1rem; }
    .status { margin-bottom: 0.5rem; color: #f97316; }
  `;
}

export default GdmLiveAudio;
