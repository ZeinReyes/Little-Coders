import { updateVariableState } from './state';
import { updateCode, updateVariableTooltips } from './codeGen';
import { nestElement, canNest, showNestNotification, isOperator } from './nesting';
import { createAutoResizeInput } from './helpers';
import { getDragState, clearDragSource, clearDragType } from './draggable';
import { createElement } from './elementFactory';
import { makeId } from './id';   // ✅ import id generator

export function createSlot(whiteboard, codeArea, dimOverlay, options = {}) {
  const multi = options.multi || false; // ✅ multi-slot flag
  const slot = document.createElement('div');
  slot.className = 'slot empty';
  slot.dataset.type = 'slot';
  slot.id = makeId('slot');

  // ------------------------------
  // 🔹 Create input for value slots
  // ------------------------------
  function ensureInput() {
    if (multi) return; // ⛔ no input for multi-slots
    if (!slot.querySelector('input') && slot.children.length === 0) {
      const input = createAutoResizeInput();
      input.id = makeId('input');
      input.dataset.type = 'value';
      input.dataset.source = 'input';

      input.addEventListener('input', () => {
        slot.dataset.value = input.value.trim();
        updateCode(whiteboard, codeArea);
        updateVariableTooltips(whiteboard);
      });

      slot.appendChild(input);
    }
  }

  // ------------------------------
  // 🔹 Focus behavior
  // ------------------------------
  slot.addEventListener('click', () => {
    if (multi) return; // multi-slots don't have inputs
    const hasChild = slot.querySelector('.operator, .variable');
    if (hasChild) return;
    const input = slot.querySelector('input');
    if (input) input.focus();
  });

  // ------------------------------
  // 🔹 Drag events
  // ------------------------------
  slot.addEventListener('dragover', e => {
    e.preventDefault();
    slot.classList.add('over');
  });

  slot.addEventListener('dragleave', () => slot.classList.remove('over'));

  // ------------------------------
  // 🔹 Drop event
  // ------------------------------
  slot.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    slot.classList.remove('over');

    const { _dragSource, _dragType } = getDragState();

    // -------- Case 1: Moving existing element --------
    if (_dragSource) {
      if (!canNest(slot, _dragSource)) {
        showNestNotification("You can't drop that here!");
        return;
      }

      if (slot.contains(_dragSource) || _dragSource.contains(slot)) return;

      const prevParent = _dragSource.parentElement;
      if (prevParent && prevParent.classList.contains('slot')) {
        prevParent.classList.add('empty');
        prevParent.replaceChildren();

        if (!prevParent.dataset.multi) {
          const newInput = createAutoResizeInput();
          newInput.id = makeId('input');
          newInput.dataset.type = 'value';
          newInput.dataset.source = 'input';
          newInput.addEventListener('input', () => {
            prevParent.dataset.value = newInput.value.trim();
            updateCode(whiteboard, codeArea);
            updateVariableTooltips(whiteboard);
          });
          prevParent.appendChild(newInput);
        }
      }

      nestElement(_dragSource);

      // 🧩 Multi-slot: append instead of replace
      if (multi) {
        slot.appendChild(_dragSource);
      } else {
        const existingInput = slot.querySelector('input');
        if (existingInput) existingInput.remove();
        slot.replaceChildren(_dragSource);
      }

      slot.classList.remove('empty');
      clearDragSource();
      updateVariableState(whiteboard, dimOverlay);
      updateCode(whiteboard, codeArea);
      updateVariableTooltips(whiteboard);
      return;
    }

    // -------- Case 2: Creating new element from palette --------
    if (_dragType) {
      const newEl = createElement(_dragType, whiteboard, codeArea, dimOverlay);
      if (!newEl) return;

      if (!canNest(slot, newEl)) {
        showNestNotification("You can't drop that here!");
        return;
      }

      // -------- Fixed: Ensure clean nested operators --------
      if (isOperator(newEl)) {
        const slots = Array.from(newEl.querySelectorAll('.slot'));
        slots.forEach((childSlot) => {
          childSlot.replaceChildren();
          childSlot.classList.add('empty');

          const input = createAutoResizeInput();
          input.id = makeId('input');
          input.dataset.type = 'value';
          input.dataset.source = 'input';
          input.addEventListener('input', () => {
            childSlot.dataset.value = input.value.trim();
            updateCode(whiteboard, codeArea);
            updateVariableTooltips(whiteboard);
          });
          childSlot.appendChild(input);
        });
      }

      nestElement(newEl);

      // 🧩 Multi-slot: append instead of replace
      if (multi) {
        slot.appendChild(newEl);
      } else {
        const existingInput = slot.querySelector('input');
        if (existingInput) existingInput.remove();
        slot.replaceChildren(newEl);
      }

      slot.classList.remove('empty');
      clearDragType();
      updateVariableState(whiteboard, dimOverlay);
      updateCode(whiteboard, codeArea);
      updateVariableTooltips(whiteboard);
    }
  });

  // ------------------------------
  // 🔹 Mutation observer
  // ------------------------------
  const observer = new MutationObserver(() => {
    if (multi) return; // skip input handling for multi-slots
    const hasChild = slot.querySelector('.operator, .variable');
    if (!hasChild && slot.children.length === 0) ensureInput();
  });
  observer.observe(slot, { childList: true });

  // ------------------------------
  // 🔹 Initialize
  // ------------------------------
  if (!multi) ensureInput();

  // Store multi-flag for reference
  if (multi) slot.dataset.multi = true;

  return slot;
}
