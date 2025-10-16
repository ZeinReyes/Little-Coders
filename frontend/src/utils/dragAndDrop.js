// src/utils/dragAndDrop.js
import { updateVariableState } from './state';
import { updateCode, updateVariableTooltips } from './codeGen';
import { freeElement, tryAttachConnectorToIf } from './nesting';
import {
  getDragState,
  setDragSource,
  clearDragSource,
  setDragType,
  clearDragType
} from './draggable';
import { createElement } from './elementFactory';

export function initDragAndDrop({
  paletteSelector = '.elements img',
  whiteboard,
  codeArea,
  dimOverlay,
  trashCan,
  notification
}) {
  if (!whiteboard) throw new Error('initDragAndDrop requires a whiteboard element');

  const paletteItems = Array.from(
    document.querySelectorAll(paletteSelector + ', .elements [data-type]')
  );

  // ---------- Palette items ----------
  function onPaletteDragStart(e) {
    setDragType(this.dataset?.type || e.target?.dataset?.type || null);
    clearDragSource();
    try {
      e.dataTransfer.setData('text/plain', this.dataset?.type || '');
    } catch {}
  }
  function onPaletteDragEnd() {
    clearDragType();
  }

  paletteItems.forEach(item => {
    item.addEventListener('dragstart', onPaletteDragStart);
    item.addEventListener('dragend', onPaletteDragEnd);
  });

  // ---------- Existing whiteboard items ----------
  function onDocDragStart(e) {
    const el = e.target.closest(
      '.variable, .operator, .print-node, .if-node, .if-else-node, .elif-node, .else-node'
    );
    if (!el) return;
    setDragSource(el);
    clearDragType();
    try {
      e.dataTransfer.setData('text/plain', el.id || '');
    } catch {}
  }
  function onDocDragEnd() {
    clearDragSource();
    clearDragType();
  }
  document.addEventListener('dragstart', onDocDragStart);
  document.addEventListener('dragend', onDocDragEnd);

  // ---------- Whiteboard drop zone ----------
  function onWhiteboardDragOver(e) {
    e.preventDefault();
  }

function onWhiteboardDrop(e) {
  if (e.target.closest('.slot') || e.target.closest('#trashCan')) return;
  e.preventDefault();

  const wbRect = whiteboard.getBoundingClientRect();
  const x = Math.max(8, e.clientX - wbRect.left - 40);
  const y = Math.max(8, e.clientY - wbRect.top - 16);

  const { _dragSource, _dragType } = getDragState();

  // --- Case 1: Moving an existing element ---
  if (_dragSource) {
    if (_dragSource.classList.contains('elif-node') || _dragSource.classList.contains('else-node')) {
      const attached = tryAttachConnectorToIf(_dragSource, whiteboard);
      if (attached) {
        clearDragSource();
        updateVariableState(whiteboard, dimOverlay);
        updateCode(whiteboard, codeArea);
        updateVariableTooltips(whiteboard);
        return;
      }
    }

    freeElement(_dragSource, x, y);
    if (_dragSource instanceof Node) {
      whiteboard.appendChild(_dragSource);
    }

    _dragSource.dataset.nested = 'false';
    _dragSource.removeAttribute('data-connector-target');
    _dragSource.style.position = 'absolute';

    updateVariableState(whiteboard, dimOverlay);
    updateCode(whiteboard, codeArea);
    updateVariableTooltips(whiteboard);
    clearDragSource();
    return;
  }

  // --- Case 2: Dropping a new palette item ---
  if (_dragType) {
    const el = createElement(_dragType, whiteboard, codeArea, dimOverlay);

    // 🧩 Safety check — skip if not a valid element
    if (!(el instanceof Node)) {
      console.warn('createElement() did not return a valid DOM node for type:', _dragType);
      clearDragType();
      return;
    }

    let attached = false;

    if (_dragType === 'elif' || _dragType === 'else') {
      attached = tryAttachConnectorToIf(el, whiteboard);
    }

    if (attached) {
      clearDragType();
      updateVariableState(whiteboard, dimOverlay);
      updateCode(whiteboard, codeArea);
      updateVariableTooltips(whiteboard);
      return;
    }

    freeElement(el, x, y);
    if (el instanceof Node) {
      whiteboard.appendChild(el);
    }

    el.dataset.nested = 'false';
    el.style.position = 'absolute';

    clearDragType();
    updateVariableState(whiteboard, dimOverlay);
    updateCode(whiteboard, codeArea);
    updateVariableTooltips(whiteboard);
  }
}



  whiteboard.addEventListener('dragover', onWhiteboardDragOver);
  whiteboard.addEventListener('drop', onWhiteboardDrop);

  // ---------- Trash Can ----------
  function onTrashDragOver(e) {
    e.preventDefault();
    if (trashCan) trashCan.classList.add('over');
  }
  function onTrashDragLeave() {
    if (trashCan) trashCan.classList.remove('over');
  }
  function onTrashDrop(e) {
    e.preventDefault();
    if (trashCan) trashCan.classList.remove('over');

    const { _dragSource } = getDragState();
    if (_dragSource) {
      const prevParent = _dragSource.parentElement;
      _dragSource.remove();
      if (prevParent && prevParent.classList.contains('slot')) {
        prevParent.classList.add('empty');
      }

      const globalTooltip = document.getElementById('globalTooltip');
      if (globalTooltip) {
        globalTooltip.style.display = 'none';
        globalTooltip.textContent = '';
      }

      if (notification) {
        notification.textContent = 'Element deleted 🗑️';
        notification.style.display = 'block';
        setTimeout(() => (notification.style.display = 'none'), 3200);
      }

      clearDragSource();
      clearDragType();
      updateVariableState(whiteboard, dimOverlay);
      updateCode(whiteboard, codeArea);
      updateVariableTooltips(whiteboard);
    }
  }

  if (trashCan) {
    trashCan.addEventListener('dragover', onTrashDragOver);
    trashCan.addEventListener('dragleave', onTrashDragLeave);
    trashCan.addEventListener('drop', onTrashDrop);
  }

  // ---------- Double-click to detach ----------
  function onWhiteboardDblClick(e) {
    if (e.target.tagName === 'INPUT') return; // allow text editing

    const clicked = e.target.closest(
      '.operator, .variable, .print-node, .if-node, .if-else-node, .elif-node, .else-node'
    );
    if (!clicked) return;

    if (clicked.dataset.nested === 'true') {
      const wbRect = whiteboard.getBoundingClientRect();
      const x = Math.max(12, e.clientX - wbRect.left - 30);
      const y = Math.max(12, e.clientY - wbRect.top - 12);

      // ✅ Fully detach
      freeElement(clicked, x, y);
      whiteboard.appendChild(clicked);

      clicked.dataset.nested = 'false';
      clicked.removeAttribute('data-connector-target');
      clicked.style.position = 'absolute';

      updateVariableState(whiteboard, dimOverlay);
      updateCode(whiteboard, codeArea);
      updateVariableTooltips(whiteboard);
    }
  }
  whiteboard.addEventListener('dblclick', onWhiteboardDblClick);

  // ---------- Cleanup ----------
  return function destroy() {
    paletteItems.forEach(item => {
      item.removeEventListener('dragstart', onPaletteDragStart);
      item.removeEventListener('dragend', onPaletteDragEnd);
    });
    document.removeEventListener('dragstart', onDocDragStart);
    document.removeEventListener('dragend', onDocDragEnd);
    whiteboard.removeEventListener('dragover', onWhiteboardDragOver);
    whiteboard.removeEventListener('drop', onWhiteboardDrop);
    if (trashCan) {
      trashCan.removeEventListener('dragover', onTrashDragOver);
      trashCan.removeEventListener('dragleave', onTrashDragLeave);
      trashCan.removeEventListener('drop', onTrashDrop);
    }
    whiteboard.removeEventListener('dblclick', onWhiteboardDblClick);
  };
}
