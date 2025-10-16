import { makeDraggable, getDragState, clearDragSource, clearDragType } from '../utils/draggable';
import { makeMovable } from '../utils/movable';
import { attachTooltip } from '../utils/helpers';
import { makeId } from '../utils/id';
import { canNest, nestElement, showNestNotification } from '../utils/nesting.js';
import { updateCode, updateVariableTooltips } from '../utils/codeGen';
import { playVariableSound } from '../utils/sfx';

// ✅ Global counter for variable naming
let variableCounter = 1;

export function createVariableNode(whiteboard, codeArea, dimOverlay) {
  playVariableSound();
  const v = document.createElement('div');
  v.className = 'variable-node variable card-style';
  v.id = makeId('variable');
  v.dataset.type = "variable";

  // ✅ Generate unique variable name
  const defaultName = `var${variableCounter++}`;
  v.dataset.varName = defaultName;
  v.dataset.value = '';

  // Variable name label
  const nameLabel = document.createElement('div');
  nameLabel.className = 'variable-name';
  nameLabel.textContent = v.dataset.varName;
  v.appendChild(nameLabel);

  // Lid image
  const lid = document.createElement('img');
  lid.src = '/assets/images/container-lid1.png';
  lid.alt = 'Variable Lid';
  lid.className = 'variable-lid';
  lid.style.width = '130px';
  lid.style.height = 'auto';
  v.appendChild(lid);

  // Slot
  const slot = document.createElement('div');
  slot.className = 'variable-slot slot hidden empty';
  slot.textContent = 'No content yet';
  slot.dataset.type = 'slot';
  v.appendChild(slot);

  // Container image
  const container = document.createElement('img');
  container.src = '/assets/images/container-body1.png';
  container.alt = 'Variable Container';
  container.className = 'variable-container';
  container.style.width = '170px';
  container.style.height = '90px';
  v.appendChild(container);

  let editing = false;
  let dragOver = false;
  let hovering = false;

  // ✅ Update slot visibility
function updateSlotVisibility() {
  const hasActiveInput = slot.querySelector('input');
  const isFocusedInside = slot.contains(document.activeElement);
  const operatorsInside = v.querySelectorAll('.operator, .variable, .print-node, .if-node');

  // only show while hovered, dragging, or editing
  const shouldShow = hovering || dragOver || editing || (hasActiveInput && isFocusedInside);

  if (shouldShow) {
    // ✅ Show slot and its contents
    slot.classList.remove('hidden');
    slot.style.visibility = 'visible';
    slot.style.opacity = '1';

    [...slot.children].forEach(c => {
      c.style.visibility = 'visible';
      c.style.opacity = '1';
    });

    operatorsInside.forEach(op => {
      op.style.visibility = 'visible';
      op.style.opacity = '1';
      op.style.pointerEvents = 'auto';
    });
  } else {
    // ❌ Hide slot and all internal operators
    console.log('Hiding slot and operators');
    slot.classList.add('hidden');
    slot.style.visibility = 'hidden';
    slot.style.opacity = '0';

    [...slot.children].forEach(c => {
      c.style.visibility = 'hidden';
      c.style.opacity = '0';
    });

    operatorsInside.forEach(op => {
      op.style.visibility = 'hidden';
      op.style.opacity = '0';
      op.style.pointerEvents = 'none';
    });
  }
}


  v.addEventListener('mouseenter', () => {
    hovering = true;
    updateSlotVisibility();
  });
  v.addEventListener('mouseleave', () => {
    hovering = false;
    updateSlotVisibility();
  });

  // ✅ Editable variable name
  nameLabel.addEventListener('dblclick', e => {
    e.stopPropagation();
    if (nameLabel.querySelector('input')) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = v.dataset.varName;
    input.className = 'varname-input';
    nameLabel.replaceChildren(input);
    input.focus();

    function finish(save = true) {
      if (save) v.dataset.varName = input.value.trim() || defaultName;
      nameLabel.textContent = v.dataset.varName;
    }

    input.addEventListener('blur', () => finish(true), { once: true });
    input.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') finish(true);
      if (ev.key === 'Escape') finish(false);
    });
  });

  // ✅ Enable manual typing in slot
  function enableTyping() {
    if (editing) return;
    if (slot.querySelector('.node') || slot.querySelector('.operator')) return;

    editing = true;
    slot.classList.add('editing');

    const input = document.createElement('input');
    input.type = 'text';
    input.value = v.dataset.value || '';
    input.className = 'slot-input';
    slot.replaceChildren(input);
    input.focus();

    function finish(save = true) {
      if (save) v.dataset.value = input.value.trim();

      if (!slot.querySelector('.node') && !slot.querySelector('.operator')) {
        slot.textContent = v.dataset.value || 'No content yet';
        slot.classList.add('empty');
      }

      editing = false;
      slot.classList.remove('editing');
      updateSlotVisibility();
      document.removeEventListener('click', handleClickOutside, true);
    }

    function handleClickOutside(e) {
      if (!v.contains(e.target)) finish(true);
    }

    setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    });

    input.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') finish(true);
      if (ev.key === 'Escape') finish(false);
    });
  }

  slot.addEventListener('click', e => {
    e.stopPropagation();
    enableTyping();
  });

  // ✅ Universal drop handler
  function handleDropToSlotFromEvent(e) {
    e.preventDefault();

    let node = null;
    try {
      const ds = getDragState();
      if (ds && ds._dragSource) node = ds._dragSource;
    } catch (_) {}

    if (!node && e.dataTransfer) {
      const nodeId = e.dataTransfer.getData('text/plain');
      if (nodeId) node = document.getElementById(nodeId);
    }

    if (!node) return;

    if (!canNest(slot, node)) {
      showNestNotification("You can’t drop that here!");
      return;
    }

    v.dataset.value = '';
    slot.classList.remove('empty');
    slot.textContent = '';

    const existingInput = slot.querySelector('input');
    if (existingInput) existingInput.remove();

    nestElement(node);
    slot.replaceChildren(node);

    try { clearDragSource(); } catch (_) {}
    try { clearDragType(); } catch (_) {}

    updateSlotVisibility();
    try { updateCode(whiteboard, codeArea); } catch (_) {}
    try { updateVariableTooltips(whiteboard); } catch (_) {}
  }

  // ✅ Keep slot visible on dragover
  slot.addEventListener('dragover', e => {
    e.preventDefault();
    dragOver = true;
    updateSlotVisibility();
  });
  slot.addEventListener('dragleave', () => {
    dragOver = false;
    updateSlotVisibility();
  });
  slot.addEventListener('drop', e => {
    e.stopPropagation();
    handleDropToSlotFromEvent(e);
  });

  // ✅ Capture drag events on entire variable node
  v.addEventListener(
    'dragover',
    e => {
      e.preventDefault();
      dragOver = true;
      updateSlotVisibility();
    },
    { capture: true }
  );

  v.addEventListener(
    'dragleave',
    () => {
      dragOver = false;
      updateSlotVisibility();
    },
    { capture: true }
  );

  v.addEventListener(
    'drop',
    e => {
      e.preventDefault();
      e.stopPropagation();
      dragOver = false;
      updateSlotVisibility();
      handleDropToSlotFromEvent(e);
    },
    { capture: true }
  );

  // ✅ Make draggable and movable
  makeDraggable(v);
  makeMovable(v, whiteboard, codeArea);

  attachTooltip(
    v,
    'Variable: Double-click name to rename, hover to show slot, click slot to type or drop nodes.'
  );

  return v;
}
