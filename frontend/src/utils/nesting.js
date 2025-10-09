// src/utils/nesting.js

export function canNest(slot, node) {
  if (!slot || !node) return false;

  const parent = slot.closest('.variable, .operator, .print-node, .if-node, .elif-node, .else-node, .while-node, .dowhile-node');
  const nodeType = node.dataset.type;

  // 🟦 No parent found (free slot) — allow most top-level blocks
  if (!parent) {
    return ['variable', 'print', 'if', 'elif', 'else', 'while', 'dowhile'].includes(nodeType);
  }

  const parentType = parent.dataset.type;

  // --- Rules by parent type ---
  switch (parentType) {
    case 'variable':
      // variable var1 = [allowed here]
      return ['operator', 'variable', 'value'].includes(nodeType);

    case 'print':
      // print([allowed here])
      return ['operator', 'variable', 'value'].includes(nodeType);

    case 'operator':
      // (left op right)
      return ['operator', 'value'].includes(nodeType);

    case 'if':
    case 'elif':
    case 'else':
    case 'while':
    case 'dowhile':
      // body of conditional or loop
      return ['variable', 'operator', 'print', 'if', 'elif', 'else', 'while', 'dowhile', 'value'].includes(nodeType);

    default:
      return false;
  }
}

// --- Existing functions below ---

export function nestElement(el) {
  if (!el) return;
  el.dataset.nested = 'true';
  el.style.position = 'static';
  el.style.removeProperty('left');
  el.style.removeProperty('top');

  const parentSlot = el.parentElement;
  if (parentSlot && parentSlot.classList.contains('slot')) {
    parentSlot.classList.remove('empty');
  }
}

export function freeElement(el, x = 24, y = 24) {
  if (!el) return;
  el.dataset.nested = 'false';
  el.style.position = 'absolute';
  el.style.left = x + 'px';
  el.style.top = y + 'px';

  const prevParent = el.parentElement;
  if (prevParent && prevParent.classList.contains('slot')) {
    prevParent.classList.add('empty');
  }
}

export function tryAttachConnectorToIf(el, whiteboard) {
  const ifNodes = Array.from(whiteboard.querySelectorAll('.if-node'));
  if (!ifNodes.length) return false;

  let targetIf = null;
  let minDist = Infinity;
  const elRect = el.getBoundingClientRect();

  ifNodes.forEach(ifNode => {
    const rect = ifNode.getBoundingClientRect();
    const dx = (rect.left + rect.width / 2) - (elRect.left + elRect.width / 2);
    const dy = (rect.top + rect.height / 2) - (elRect.top + elRect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      targetIf = ifNode;
    }
  });

  if (!targetIf) return false;

  const connectors = targetIf.querySelector('.if-connectors');
  if (!connectors) return false;

  connectors.appendChild(el);

  el.dataset.nested = 'true';
  el.style.position = 'relative';
  el.style.left = '0px';
  el.style.top = '0px';

  return true;
}

export function showNestNotification(message) {
  let notif = document.getElementById('nestNotif');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'nestNotif';
    notif.style.position = 'fixed';
    notif.style.bottom = '12px';
    notif.style.left = '50%';
    notif.style.transform = 'translateX(-50%)';
    notif.style.padding = '8px 14px';
    notif.style.background = '#ffcccc';
    notif.style.color = '#333';
    notif.style.border = '1px solid #ff6666';
    notif.style.borderRadius = '6px';
    notif.style.fontSize = '14px';
    notif.style.zIndex = '10000';
    notif.style.display = 'none';
    document.body.appendChild(notif);
  }

  notif.textContent = message;
  notif.style.display = 'block';

  clearTimeout(notif._hideTimer);
  notif._hideTimer = setTimeout(() => {
    notif.style.display = 'none';
  }, 3000);
}

export function isOperator(el) { return el && el.classList.contains('operator'); }
export function isVariable(el) { return el && el.classList.contains('variable'); }
