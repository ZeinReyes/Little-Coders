import { createSlot } from '../utils/slot';
import { makeDraggable } from '../utils/draggable';
import { makeMovable } from '../utils/movable';
import { attachTooltip } from '../utils/helpers';
import { makeId } from '../utils/id';

export function createLoopNode(type, whiteboard, codeArea, dimOverlay) {
  // ---------------- WHILE ----------------
  if (type === 'while') {
    const whileNode = document.createElement('div');
    whileNode.className = 'while-node';
    whileNode.id = makeId('while');
    whileNode.dataset.type = `loops ${type}`;

    const header = document.createElement('div');
    header.className = 'while-header';

    const labelWhile = document.createElement('span');
    labelWhile.className = 'while-label';
    labelWhile.textContent = 'while (';

    const condSlot = createSlot(whiteboard, codeArea, dimOverlay);
    condSlot.classList.add('while-cond');

    const closeParen = document.createElement('span');
    closeParen.className = 'while-close';
    closeParen.textContent = ') ->';

    const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
    bodySlot.classList.add('while-body');

    header.appendChild(labelWhile);
    header.appendChild(condSlot);
    header.appendChild(closeParen);
    header.appendChild(bodySlot);

    whileNode.appendChild(header);

    makeDraggable(whileNode);
    makeMovable(whileNode, whiteboard, codeArea, dimOverlay);
    attachTooltip(
      whileNode,
      "While loop: executes body repeatedly while the condition is true."
    );

    return whileNode;
  }

  // ---------------- FOR (optional) ----------------
  if (type === 'for') {
    const forNode = document.createElement('div');
    forNode.className = 'for-node';
    forNode.id = makeId('for');
    forNode.dataset.type = `loops ${type}`;

    const header = document.createElement('div');
    header.className = 'for-header';

    const labelFor = document.createElement('span');
    labelFor.className = 'for-label';
    labelFor.textContent = 'for (';

    const initSlot = createSlot(whiteboard, codeArea, dimOverlay);
    initSlot.classList.add('for-init');

    const semi1 = document.createElement('span');
    semi1.textContent = ';';

    const condSlot = createSlot(whiteboard, codeArea, dimOverlay);
    condSlot.classList.add('for-cond');

    const semi2 = document.createElement('span');
    semi2.textContent = ';';

    const stepSlot = createSlot(whiteboard, codeArea, dimOverlay);
    stepSlot.classList.add('for-step');

    const closeParen = document.createElement('span');
    closeParen.textContent = ') ->';

    const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
    bodySlot.classList.add('for-body');

    header.appendChild(labelFor);
    header.appendChild(initSlot);
    header.appendChild(semi1);
    header.appendChild(condSlot);
    header.appendChild(semi2);
    header.appendChild(stepSlot);
    header.appendChild(closeParen);
    header.appendChild(bodySlot);

    forNode.appendChild(header);

    makeDraggable(forNode);
    makeMovable(forNode, whiteboard, codeArea, dimOverlay);
    attachTooltip(forNode, "For loop: initialization, condition, step, and body.");

    return forNode;
  }
}
