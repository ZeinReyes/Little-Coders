// src/utils/tooltip.js
// Self-contained kid-friendly tooltip — no dependency on helpers.js
// Usage: import { addNodeTooltip } from '../utils/tooltip';
//        addNodeTooltip(element, { emoji, title, desc, example });

(function injectStyles() {
  if (document.getElementById('lc-node-tooltip-styles')) return;
  const s = document.createElement('style');
  s.id = 'lc-node-tooltip-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

    #lc-node-tooltip {
      position: fixed;
      z-index: 99999;
      pointer-events: none;
      font-family: 'Nunito', 'Comic Sans MS', cursive, sans-serif;

      background: #fff;
      border-radius: 18px;
      padding: 11px 14px 11px;
      min-width: 165px;
      max-width: 215px;

      border: 3px solid #FFD93D;
      box-shadow:
        0 0 0 5px rgba(255, 217, 61, 0.18),
        0 10px 28px rgba(0, 0, 0, 0.16);

      opacity: 0;
      transform: translateY(6px) scale(0.95);
      transition: opacity 0.15s ease, transform 0.15s ease;
    }

    #lc-node-tooltip.lc-nt-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .lc-nt-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .lc-nt-emoji {
      font-size: 26px;
      line-height: 1;
      display: inline-block;
      animation: lc-nt-bob 1.9s ease-in-out infinite;
    }

    @keyframes lc-nt-bob {
      0%, 100% { transform: translateY(0) rotate(0deg);   }
      40%       { transform: translateY(-5px) rotate(-6deg); }
      70%       { transform: translateY(-3px) rotate(4deg);  }
    }

    .lc-nt-title {
      font-size: 13.5px;
      font-weight: 900;
      color: #1a1a1a;
      line-height: 1.15;
    }

    .lc-nt-divider {
      height: 2.5px;
      border-radius: 99px;
      background: linear-gradient(90deg, #FFD93D 0%, #FF6B6B 33%, #6BCB77 66%, #4D96FF 100%);
      margin: 5px 0 7px;
    }

    .lc-nt-desc {
      font-size: 11.5px;
      font-weight: 700;
      color: #3a3a3a;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .lc-nt-example {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
      border: 2px solid #4DD0E1;
      border-radius: 9px;
      padding: 3px 9px;
      font-size: 10.5px;
      font-weight: 800;
      color: #00838F;
      font-family: 'Courier New', monospace;
    }

    .lc-nt-example::before {
      content: '👉';
      font-size: 11px;
    }
  `;
  document.head.appendChild(s);
})();

// ── singleton DOM element ─────────────────────────────────────────────────────
function getEl() {
  let el = document.getElementById('lc-node-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'lc-node-tooltip';
    document.body.appendChild(el);
  }
  return el;
}

function buildHTML({ emoji = '💡', title = '', desc = '', example = '' }) {
  return `
    <div class="lc-nt-header">
      <span class="lc-nt-emoji">${emoji}</span>
      <span class="lc-nt-title">${title}</span>
    </div>
    <div class="lc-nt-divider"></div>
    <div class="lc-nt-desc">${desc}</div>
    ${example ? `<span class="lc-nt-example">${example}</span>` : ''}
  `;
}

function place(e) {
  const el = getEl();
  const w = el.offsetWidth || 215;
  let x = e.clientX + 16;
  if (x + w > window.innerWidth - 12) x = e.clientX - w - 12;
  el.style.left = `${x}px`;
  el.style.top  = `${e.clientY - 16}px`;
}

/**
 * Attach a kid-friendly tooltip to a node element.
 * @param {HTMLElement} el
 * @param {{ emoji: string, title: string, desc: string, example?: string }} data
 */
export function addNodeTooltip(el, data) {
  if (!el || !data) return;

  el.addEventListener('mouseenter', (e) => {
    const tip = getEl();
    tip.innerHTML = buildHTML(data);
    tip.classList.add('lc-nt-visible');
    place(e);
  });

  el.addEventListener('mousemove', place);

  el.addEventListener('mouseleave', () => {
    getEl().classList.remove('lc-nt-visible');
  });

  el.addEventListener('dragstart', () => {
    getEl().classList.remove('lc-nt-visible');
  });
}