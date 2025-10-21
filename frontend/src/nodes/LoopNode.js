import { createSlot } from '../utils/slot';
import { makeDraggable } from '../utils/draggable';
import { makeMovable } from '../utils/movable';
import { attachTooltip } from '../utils/helpers';
import { makeId } from '../utils/id';
import { playObjectSound } from '../utils/sfx';

export function createLoopNode(type, whiteboard, codeArea, dimOverlay) {
  // ---------------- WHILE ----------------
  if (type === 'while') {
    playObjectSound();
    const whileNode = document.createElement('div');
    whileNode.className = 'while-node';
    whileNode.id = makeId('while');
    whileNode.dataset.type = `${type}`;

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

  // ---------------- FOR ----------------
if (type === 'for') {
  playObjectSound();
  const forNode = document.createElement('div');
  forNode.className = 'for-node';
  forNode.id = makeId('for');
  forNode.dataset.type = `${type}`;

  const header = document.createElement('div');
  header.className = 'for-header';

  // "for" keyword
  const labelFor = document.createElement('span');
  labelFor.className = 'for-label';
  labelFor.textContent = 'for ';

  // variable slot
  const varSlot = createSlot(whiteboard, codeArea, dimOverlay);
  varSlot.classList.add('for-var');

  const inLabel = document.createElement('span');
  inLabel.textContent = ' in range(';

  // range start
  const startSlot = createSlot(whiteboard, codeArea, dimOverlay);
  startSlot.classList.add('for-start');

  const comma1 = document.createElement('span');
  comma1.textContent = ', ';

  // range end
  const endSlot = createSlot(whiteboard, codeArea, dimOverlay);
  endSlot.classList.add('for-end');

  const comma2 = document.createElement('span');
  comma2.textContent = ', ';

  // range step
  const stepSlot = createSlot(whiteboard, codeArea, dimOverlay);
  stepSlot.classList.add('for-step');

  const closeParen = document.createElement('span');
  closeParen.textContent = ') ->';

  // body (multi)
  const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
  bodySlot.classList.add('for-body');

  // assemble
  header.appendChild(labelFor);
  header.appendChild(varSlot);
  header.appendChild(inLabel);
  header.appendChild(startSlot);
  header.appendChild(comma1);
  header.appendChild(endSlot);
  header.appendChild(comma2);
  header.appendChild(stepSlot);
  header.appendChild(closeParen);
  header.appendChild(bodySlot);

  forNode.appendChild(header);

  makeDraggable(forNode);
  makeMovable(forNode, whiteboard, codeArea, dimOverlay);
  attachTooltip(
    forNode,
    "For loop (Python style): iterates over a range(start, end, step)."
  );

  return forNode;
}


  // ---------------- DO WHILE ----------------
  if (type === 'do-while') {
    playObjectSound();
    const doWhileNode = document.createElement('div');
    doWhileNode.className = 'do-while-node';
    doWhileNode.id = makeId('doWhile');
    doWhileNode.dataset.type = `${type}`;

    const header = document.createElement('div');
    header.className = 'do-while-header';

    const labelDo = document.createElement('span');
    labelDo.className = 'do-label';
    labelDo.textContent = 'do ->';

    const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
    bodySlot.classList.add('do-while-body');

    const footer = document.createElement('div');
    footer.className = 'do-while-footer';

    const labelWhile = document.createElement('span');
    labelWhile.className = 'while-label';
    labelWhile.textContent = 'while (';

    const condSlot = createSlot(whiteboard, codeArea, dimOverlay);
    condSlot.classList.add('do-while-cond');

    const closeParen = document.createElement('span');
    closeParen.className = 'while-close';
    closeParen.textContent = ')';

    header.appendChild(labelDo);
    header.appendChild(bodySlot);
    footer.appendChild(labelWhile);
    footer.appendChild(condSlot);
    footer.appendChild(closeParen);

    doWhileNode.appendChild(header);
    doWhileNode.appendChild(footer);

    makeDraggable(doWhileNode);
    makeMovable(doWhileNode, whiteboard, codeArea, dimOverlay);
    attachTooltip(
      doWhileNode,
      "Do-While loop: executes the body at least once, then repeats while the condition is true."
    );

    return doWhileNode;
  }
}
