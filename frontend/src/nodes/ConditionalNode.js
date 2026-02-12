import { createSlot } from '../utils/slot';
import { makeDraggable } from '../utils/draggable';
import { makeMovable } from '../utils/movable';
import { attachTooltip } from '../utils/helpers';
import { makeId } from '../utils/id';
import { playObjectSound } from '../utils/sfx';

export function createConditionalNode(type, whiteboard, codeArea, dimOverlay) {

  // ─── inject shared keyframes once ───────────────────────────────────────────
  if (!document.getElementById('cond-node-styles')) {
    const s = document.createElement('style');
    s.id = 'cond-node-styles';
    s.textContent = `
      @keyframes cond-bounce {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(-5px); }
      }
      @keyframes cond-wiggle {
        0%, 100% { transform: rotate(0deg); }
        25%       { transform: rotate(-8deg); }
        75%       { transform: rotate(8deg); }
      }
      @keyframes cond-pop {
        0%   { transform: scale(0.8); opacity: 0.4; }
        50%  { transform: scale(1.15); }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(s);
  }

  // ─── shared helper: make a label pill ───────────────────────────────────────
  function makeLabelPill(emoji, text, color) {
    const d = document.createElement('div');
    d.style.cssText = `
      display: flex; align-items: center; gap: 5px; margin-bottom: 6px;
    `;
    d.innerHTML = `
      <span style="font-size:14px;">${emoji}</span>
      <span style="font-weight:700; color:${color}; font-size:11px;
                   font-family:'Comic Sans MS',cursive;">${text}</span>
    `;
    return d;
  }

  // ─── shared helper: white section card ──────────────────────────────────────
  function makeCard(mb = '8px') {
    const d = document.createElement('div');
    d.style.cssText = `
      background: rgba(255,255,255,0.95);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: ${mb};
    `;
    return d;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // IF  ─ "The Fork in the Road" 🍦
  // ════════════════════════════════════════════════════════════════════════════
  if (type === 'if') {
    playObjectSound();

    const ifNode = document.createElement('div');
    ifNode.className = 'if-node';
    ifNode.id = makeId('if');
    ifNode.dataset.type = 'conditional if';

    ifNode.style.cssText = `
      background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
      border-radius: 15px;
      padding: 8px;
      box-shadow: 0 6px 18px rgba(247,151,30,0.45);
      border: 3px solid #ffffff;
      width: fit-content;
      min-width: 220px;
      max-width: max-content;
      position: absolute;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;

    // ── visual metaphor (hidden by default) ───────────────────────────────────
    const visualBox = document.createElement('div');
    visualBox.style.cssText = `
      background: white;
      border-radius: 10px;
      padding: 10px;
      text-align: center;
      border: 2px solid #f7971e;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.4s ease, opacity 0.3s ease, margin-bottom 0.4s ease;
    `;
    visualBox.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; gap:10px;
                  font-size:26px; margin-bottom:3px;">
        <span style="animation:cond-wiggle 2s ease-in-out infinite;display:inline-block;">🤔</span>
        <span style="font-size:16px;">→</span>
        <span style="animation:cond-bounce 1.2s ease-in-out infinite;display:inline-block;">✅</span>
        <span style="font-size:12px;color:#aaa;">or</span>
        <span style="animation:cond-bounce 1.2s ease-in-out infinite 0.3s;display:inline-block;">❌</span>
      </div>
      <div style="font-size:10px; font-weight:700; color:#f7971e;
                  font-family:'Comic Sans MS',cursive;">
        Is it TRUE? Take the YES road!
      </div>
    `;

    // ── title bar ─────────────────────────────────────────────────────────────
    const titleBar = makeCard('8px');
    titleBar.style.display = 'flex';
    titleBar.style.alignItems = 'center';
    titleBar.style.gap = '6px';
    titleBar.innerHTML = `
      <span style="font-size:18px; animation:cond-wiggle 3s ease-in-out infinite;display:inline-block;">🍦</span>
      <span style="font-weight:800; color:#f7971e; font-size:13px;
                   font-family:'Comic Sans MS',cursive;">IF</span>
      <span style="font-size:10px; color:#aaa; font-family:'Comic Sans MS',cursive;">
        ( is this true? )
      </span>
    `;

    // ── condition card ────────────────────────────────────────────────────────
    const condCard = makeCard('8px');
    condCard.appendChild(makeLabelPill('🧪', 'Question:', '#f7971e'));
    const condSlot = createSlot(whiteboard, codeArea, dimOverlay);
    condSlot.classList.add('if-cond');
    condSlot.style.cssText = `
      background: linear-gradient(135deg,#FFF9E6 0%,#FFE082 100%);
      border: 3px dashed #FFC107;
      border-radius: 10px;
      min-width: 140px; min-height: 35px;
      padding: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
    `;
    condCard.appendChild(condSlot);

    // ── flow arrow ────────────────────────────────────────────────────────────
    const arrow = document.createElement('div');
    arrow.style.cssText = `
      text-align:center; font-size:18px; margin:2px 0;
      animation: cond-bounce 1.5s ease-in-out infinite;
    `;
    arrow.innerHTML = `
      <span>⬇️</span>
      <div style="font-size:9px; font-weight:700; color:white;
                  font-family:'Comic Sans MS',cursive;">YES →</div>
    `;

    // ── body card ─────────────────────────────────────────────────────────────
    const bodyCard = makeCard('8px');
    bodyCard.appendChild(makeLabelPill('🌟', 'Then do:', '#4CAF50'));
    const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
    bodySlot.classList.add('if-body');
    bodySlot.style.cssText = `
      background: linear-gradient(135deg,#E8F5E9 0%,#A5D6A7 100%);
      border: 3px solid #4CAF50;
      border-radius: 10px;
      min-width: 140px; min-height: 50px;
      padding: 8px;
      display: flex; flex-direction: column; gap: 5px; font-size: 12px;
    `;
    bodyCard.appendChild(bodySlot);

    // ── connectors (elif / else drop zone) ────────────────────────────────────
    const connectors = document.createElement('div');
    connectors.className = 'if-connectors';
    connectors.style.cssText = `
      margin-top: 6px;
      min-height: 30px;
      border: 2px dashed rgba(255,255,255,0.5);
      border-radius: 10px;
      padding: 6px -100px;
      text-align: center;
      font-size: 10px;
      color: rgba(255,255,255,0.8);
      font-family: 'Comic Sans MS', cursive;
      transition: background 0.2s;
      width: 50px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    `;

    connectors.textContent = '⬇️ Drop ELIF or ELSE here';

    const connPlaceholderObserver = new MutationObserver(() => {
      if (connectors.childElementCount > 0) {
        connectors.style.border = '2px dashed rgba(255,255,255,0.2)';
        connectors.childNodes.forEach(n => {
          if (n.nodeType === Node.TEXT_NODE) n.remove();
        });
      } else {
        connectors.style.border = '2px dashed rgba(255,255,255,0.5)';
        connectors.textContent = '⬇️ Drop ELIF or ELSE here';
      }
    });
    connPlaceholderObserver.observe(connectors, { childList: true });

    ifNode.appendChild(visualBox);
    ifNode.appendChild(titleBar);
    ifNode.appendChild(condCard);
    ifNode.appendChild(arrow);
    ifNode.appendChild(bodyCard);
    ifNode.appendChild(connectors);

    // ── hover ─────────────────────────────────────────────────────────────────
    ifNode.addEventListener('mouseenter', () => {
      ifNode.style.transform = 'scale(1.04) rotate(-1deg)';
      ifNode.style.boxShadow = '0 12px 28px rgba(247,151,30,0.6)';
      visualBox.style.maxHeight = '90px';
      visualBox.style.opacity = '1';
      visualBox.style.marginBottom = '10px';
    });
    ifNode.addEventListener('mouseleave', () => {
      ifNode.style.transform = 'scale(1) rotate(0deg)';
      ifNode.style.boxShadow = '0 6px 18px rgba(247,151,30,0.45)';
      visualBox.style.maxHeight = '0';
      visualBox.style.opacity = '0';
      visualBox.style.marginBottom = '0';
    });

    makeDraggable(ifNode);
    makeMovable(ifNode, whiteboard, codeArea, dimOverlay);
    attachTooltip(ifNode, '🍦 IF: Ask a question — if TRUE, do the action inside!');

    return ifNode;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ELIF  ─ "Another chance!" 🍫
  // ════════════════════════════════════════════════════════════════════════════
  if (type === 'elif') {
    playObjectSound();

    const ifNode = whiteboard.querySelector('.if-node');
    if (!ifNode) {
      alert('You need an IF block first before adding ELIF!');
      return undefined;
    }

    const elifNode = document.createElement('div');
    elifNode.className = 'elif-node';
    elifNode.id = makeId('elif');
    elifNode.dataset.type = 'conditional elif';

    elifNode.style.cssText = `
      background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
      border-radius: 12px;
      padding: 7px;
      box-shadow: 0 4px 12px rgba(161,140,209,0.4);
      border: 2px solid #ffffff;
      min-width: 200px;
      margin-top: 6px;
      position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;

    // ── visual box ────────────────────────────────────────────────────────────
    const visualBox = document.createElement('div');
    visualBox.style.cssText = `
      background: white; border-radius: 10px; padding: 8px;
      text-align: center; border: 2px solid #a18cd1;
      max-height: 0; overflow: hidden; opacity: 0;
      transition: max-height 0.4s ease, opacity 0.3s ease, margin-bottom 0.4s ease;
    `;
    visualBox.innerHTML = `
      <div style="font-size:26px; margin-bottom:3px;
                  animation:cond-wiggle 2s ease-in-out infinite;display:inline-block;">🍫</div>
      <div style="font-size:10px; font-weight:700; color:#a18cd1;
                  font-family:'Comic Sans MS',cursive;">
        Nope? Try THIS instead!
      </div>
    `;

    // ── title bar ─────────────────────────────────────────────────────────────
    const titleBar = makeCard('6px');
    titleBar.style.display = 'flex';
    titleBar.style.alignItems = 'center';
    titleBar.style.gap = '6px';
    titleBar.innerHTML = `
      <span style="font-size:16px;">🔀</span>
      <span style="font-weight:800; color:#a18cd1; font-size:12px;
                   font-family:'Comic Sans MS',cursive;">ELIF</span>
      <span style="font-size:9px; color:#bbb; font-family:'Comic Sans MS',cursive;">
        ( else if… )
      </span>
    `;

    // ── condition ─────────────────────────────────────────────────────────────
    const condCard = makeCard('6px');
    condCard.appendChild(makeLabelPill('🔍', 'Or maybe:', '#a18cd1'));
    const condSlot = createSlot(whiteboard, codeArea, dimOverlay);
    condSlot.classList.add('elif-cond');
    condSlot.style.cssText = `
      background: linear-gradient(135deg,#F3E5F5 0%,#CE93D8 100%);
      border: 3px dashed #AB47BC;
      border-radius: 10px;
      min-width: 120px; min-height: 32px;
      padding: 5px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
    `;
    condCard.appendChild(condSlot);

    const arrow = document.createElement('div');
    arrow.style.cssText = `
      text-align:center; font-size:16px; margin:2px 0;
      animation: cond-bounce 1.5s ease-in-out infinite;
    `;
    arrow.innerHTML = `
      <span>⬇️</span>
      <div style="font-size:9px; font-weight:700; color:white;
                  font-family:'Comic Sans MS',cursive;">YES →</div>
    `;

    // ── body ──────────────────────────────────────────────────────────────────
    const bodyCard = makeCard('0');
    bodyCard.appendChild(makeLabelPill('✨', 'Then do:', '#4CAF50'));
    const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
    bodySlot.classList.add('elif-body');
    bodySlot.style.cssText = `
      background: linear-gradient(135deg,#E8F5E9 0%,#A5D6A7 100%);
      border: 3px solid #4CAF50; border-radius: 10px;
      min-width: 120px; min-height: 45px;
      padding: 8px; display: flex; flex-direction: column; gap: 5px; font-size: 12px;
    `;
    bodyCard.appendChild(bodySlot);

    elifNode.appendChild(visualBox);
    elifNode.appendChild(titleBar);
    elifNode.appendChild(condCard);
    elifNode.appendChild(arrow);
    elifNode.appendChild(bodyCard);

    // ── hover ─────────────────────────────────────────────────────────────────
    elifNode.addEventListener('mouseenter', () => {
      elifNode.style.transform = 'scale(1.04) rotate(1deg)';
      elifNode.style.boxShadow = '0 8px 20px rgba(161,140,209,0.6)';
      visualBox.style.maxHeight = '80px';
      visualBox.style.opacity = '1';
      visualBox.style.marginBottom = '8px';
    });
    elifNode.addEventListener('mouseleave', () => {
      elifNode.style.transform = 'scale(1) rotate(0deg)';
      elifNode.style.boxShadow = '0 4px 12px rgba(161,140,209,0.4)';
      visualBox.style.maxHeight = '0';
      visualBox.style.opacity = '0';
      visualBox.style.marginBottom = '0';
    });

    const connector = ifNode.querySelector('.if-connectors');
    const existingElse = connector.querySelector('.else-node');
    if (existingElse) connector.insertBefore(elifNode, existingElse);
    else connector.appendChild(elifNode);

    makeDraggable(elifNode);
    makeMovable(elifNode, whiteboard, codeArea, dimOverlay);
    attachTooltip(elifNode, '🍫 ELIF: "What if THAT wasn\'t true but THIS is?"');

    return elifNode;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ELSE  ─ "The Safety Net" 🪂
  // ════════════════════════════════════════════════════════════════════════════
  if (type === 'else') {
    playObjectSound();

    const ifNode = whiteboard.querySelector('.if-node');
    if (!ifNode) {
      alert('You need an IF block first before adding ELSE!');
      return null;
    }

    const connector = ifNode.querySelector('.if-connectors');
    if (!connector) {
      alert('Connector section missing in IF node!');
      return null;
    }

    const existingElse = connector.querySelector('.else-node');
    if (existingElse) {
      alert('Only one ELSE is allowed per IF!');
      return null;
    }

    const elseNode = document.createElement('div');
    elseNode.className = 'else-node';
    elseNode.id = makeId('else');
    elseNode.dataset.type = 'conditional else';

    elseNode.style.cssText = `
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      border-radius: 12px;
      padding: 7px;
      box-shadow: 0 4px 12px rgba(17,153,142,0.4);
      border: 2px solid #ffffff;
      min-width: 200px;
      margin-top: 6px;
      position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;

    // ── visual box ────────────────────────────────────────────────────────────
    const visualBox = document.createElement('div');
    visualBox.style.cssText = `
      background: white; border-radius: 10px; padding: 8px;
      text-align: center; border: 2px solid #11998e;
      max-height: 0; overflow: hidden; opacity: 0;
      transition: max-height 0.4s ease, opacity 0.3s ease, margin-bottom 0.4s ease;
    `;
    visualBox.innerHTML = `
      <div style="font-size:30px; margin-bottom:3px;
                  animation:cond-bounce 1.3s ease-in-out infinite;display:inline-block;">🪂</div>
      <div style="font-size:10px; font-weight:700; color:#11998e;
                  font-family:'Comic Sans MS',cursive;">
        Nothing matched? I got you!
      </div>
    `;

    // ── title bar ─────────────────────────────────────────────────────────────
    const titleBar = makeCard('6px');
    titleBar.style.display = 'flex';
    titleBar.style.alignItems = 'center';
    titleBar.style.gap = '6px';
    titleBar.innerHTML = `
      <span style="font-size:16px; animation:cond-bounce 2s ease-in-out infinite;display:inline-block;">🪂</span>
      <span style="font-weight:800; color:#11998e; font-size:12px;
                   font-family:'Comic Sans MS',cursive;">ELSE</span>
      <span style="font-size:9px; color:#bbb; font-family:'Comic Sans MS',cursive;">
        ( otherwise… )
      </span>
    `;

    // ── body ──────────────────────────────────────────────────────────────────
    const bodyCard = makeCard('0');
    bodyCard.appendChild(makeLabelPill('🎯', 'Default:', '#11998e'));
    const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
    bodySlot.classList.add('else-body');
    bodySlot.style.cssText = `
      background: linear-gradient(135deg,#E0F7FA 0%,#80DEEA 100%);
      border: 3px solid #11998e; border-radius: 10px;
      min-width: 130px; min-height: 45px;
      padding: 8px; display: flex; flex-direction: column; gap: 5px; font-size: 12px;
    `;
    bodyCard.appendChild(bodySlot);

    elseNode.appendChild(visualBox);
    elseNode.appendChild(titleBar);
    elseNode.appendChild(bodyCard);

    // ── hover ─────────────────────────────────────────────────────────────────
    elseNode.addEventListener('mouseenter', () => {
      elseNode.style.transform = 'scale(1.04) rotate(-1deg)';
      elseNode.style.boxShadow = '0 8px 20px rgba(17,153,142,0.6)';
      visualBox.style.maxHeight = '80px';
      visualBox.style.opacity = '1';
      visualBox.style.marginBottom = '8px';
    });
    elseNode.addEventListener('mouseleave', () => {
      elseNode.style.transform = 'scale(1) rotate(0deg)';
      elseNode.style.boxShadow = '0 4px 12px rgba(17,153,142,0.4)';
      visualBox.style.maxHeight = '0';
      visualBox.style.opacity = '0';
      visualBox.style.marginBottom = '0';
    });

    connector.appendChild(elseNode);

    // ── MutationObserver: keep ELSE pinned to bottom ──────────────────────────
    const observer = new MutationObserver(() => {
      const currentElse = connector.querySelector('.else-node');
      const els = Array.from(connector.children);
      if (currentElse && els.indexOf(currentElse) !== els.length - 1) {
        connector.appendChild(currentElse);
      }
    });
    observer.observe(connector, { childList: true });

    makeDraggable(elseNode);
    makeMovable(elseNode, whiteboard, codeArea, dimOverlay);
    attachTooltip(elseNode, '🪂 ELSE: The safety net — runs when nothing else matched!');

    return elseNode;
  }
}