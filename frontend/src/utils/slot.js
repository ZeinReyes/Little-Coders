import { updateVariableState } from './state';
import { updateCode, updateVariableTooltips } from './codeGen';
import { nestElement, canNest, showNestNotification, isOperator } from './nesting';
import { createAutoResizeInput } from './helpers';
import { getDragState, clearDragSource, clearDragType } from './draggable';
import { createElement } from './elementFactory';
import { makeId } from './id';   // ✅ import id generator

export function createSlot(whiteboard, codeArea, dimOverlay) {
  const slot = document.createElement('div');
  slot.className = 'slot empty';
  slot.dataset.type = 'slot';
  slot.id = makeId('slot');    // ✅ unique slot id

  function ensureInput() {
    // Only add input if truly empty (no children)
    if (!slot.querySelector('input') && slot.children.length === 0) {
      const input = createAutoResizeInput();
      input.id = makeId('input'); // ✅ unique input id
      input.dataset.type = 'value';
      input.dataset.source = 'input';

      input.addEventListener('input', () => {
        // keep slot dataset updated
        slot.dataset.value = input.value.trim();
        updateCode(whiteboard, codeArea);
        updateVariableTooltips(whiteboard);
      });

      slot.appendChild(input);
    }
  }

  // 🧠 Prevent clicking from reverting to input if already filled
  slot.addEventListener('click', () => {
    const hasChild = slot.querySelector('.operator, .variable');
    if (hasChild) return; // don’t show input again
    const input = slot.querySelector('input');
    if (input) input.focus();
  });

  slot.addEventListener('dragover', e => {
    e.preventDefault();
    slot.classList.add('over');
  });

  slot.addEventListener('dragleave', () => slot.classList.remove('over'));

// slot.js - Fixed nested operator handling

// slot.js - Fixed nested operator handling

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
      // Restore input to the previous parent slot
      prevParent.replaceChildren();
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

    nestElement(_dragSource);
    
    // Clear the target slot completely before nesting
    const existingInput = slot.querySelector('input');
    if (existingInput) {
      existingInput.remove();
    }
    
    slot.replaceChildren(_dragSource);
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
        // Clear any existing content in the nested operator's slots
        childSlot.replaceChildren();
        childSlot.classList.add('empty');
        
        // Ensure each slot gets a fresh input
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

    // -------- Nest the new element in the target slot --------
    nestElement(newEl);
    
    // CRITICAL: Remove any existing inputs before placing the nested element
    const existingInput = slot.querySelector('input');
    if (existingInput) {
      existingInput.remove();
    }
    
    slot.replaceChildren(newEl);
    slot.classList.remove('empty');

    clearDragType();
    updateVariableState(whiteboard, dimOverlay);
    updateCode(whiteboard, codeArea);
    updateVariableTooltips(whiteboard);
  }
});

  const observer = new MutationObserver(() => {
    // Restore input only if truly empty (no operators/variables)
    const hasChild = slot.querySelector('.operator, .variable');
    if (!hasChild && slot.children.length === 0) ensureInput();
  });
  observer.observe(slot, { childList: true });

  ensureInput();
  return slot;
}
