import { createSlot } from '../utils/slot';
import { makeDraggable } from '../utils/draggable';
import { makeMovable } from '../utils/movable';
import { attachTooltip } from '../utils/helpers';
import { makeId } from '../utils/id';
import { playObjectSound } from '../utils/sfx';

export function createConditionalNode(type, whiteboard, codeArea, dimOverlay) {
  // ---------------- IF ----------------
  if (type === 'if') {
    playObjectSound();
    const ifNode = document.createElement('div');
    ifNode.className = 'if-node';
    ifNode.id = makeId('if');
    ifNode.dataset.type = `conditional ${type}`;

    // header holds: label + cond slot + colon + body (body is to the right)
    const header = document.createElement('div');
    header.className = 'if-header';

    const labelIf = document.createElement('span');
    labelIf.className = 'if-label';

    const condSlot = createSlot(whiteboard, codeArea, dimOverlay);
    condSlot.classList.add('if-cond');

    const labelArrow = document.createElement('span');
    labelArrow.className = 'if-colon';
    labelArrow.textContent = '->';

    // body should accept multiple statements -> vertical stack
    const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
    bodySlot.classList.add('if-body');

    header.appendChild(labelIf);
    header.appendChild(condSlot);
    header.appendChild(labelArrow);
    header.appendChild(bodySlot);

    // connectors container (holds elif/else nodes stacked vertically)
    const connectors = document.createElement('div');
    connectors.className = 'if-connectors';
    connectors.textContent = 'Drop elif/else here';

    ifNode.appendChild(header);
    ifNode.appendChild(connectors);

    makeDraggable(ifNode);
    makeMovable(ifNode, whiteboard, codeArea, dimOverlay);
    attachTooltip(ifNode, "If statement: condition slot + body slot. Add elif/else below.");
    return ifNode;
  }

  // ---------------- ELIF ----------------
  if (type === 'elif') {
    playObjectSound();
    const ifNode = whiteboard.querySelector('.if-node');
    if (!ifNode) {
      alert("You need an IF block first before adding ELIF!");
      return undefined;
    }

    const elifNode = document.createElement('div');
    elifNode.className = 'elif-node';
    elifNode.id = makeId('elif');
    elifNode.dataset.type = `conditional ${type}`;

    const header = document.createElement('div');
    header.className = 'elif-header';

    const labelElif = document.createElement('span');
    labelElif.className = 'elif-label';

    const condSlot = createSlot(whiteboard, codeArea, dimOverlay);
    condSlot.classList.add('elif-cond');

    const labelArrow = document.createElement('span');
    labelArrow.className = 'elif-colon';
    labelArrow.textContent = '->';

    const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
    bodySlot.classList.add('elif-body');

    header.appendChild(labelElif);
    header.appendChild(condSlot);
    header.appendChild(labelArrow);
    header.appendChild(bodySlot);

    elifNode.appendChild(header);

    // Insert into the if-node connectors; keep ELSE always at bottom
    const connector = ifNode.querySelector('.if-connectors');
    const existingElse = connector.querySelector('.else-node');

    if (existingElse) connector.insertBefore(elifNode, existingElse);
    else connector.appendChild(elifNode);

    makeDraggable(elifNode);
    makeMovable(elifNode, whiteboard, codeArea, dimOverlay);
    attachTooltip(elifNode, "Elif: drag under an IF node connector to add another condition.");

    return elifNode;
  }

  // ---------------- ELSE ----------------
if (type === 'else') {
  playObjectSound();
  const ifNode = whiteboard.querySelector('.if-node');
  if (!ifNode) {
    alert("You need an IF block first before adding ELSE!");
    return null;
  }

  const connector = ifNode.querySelector('.if-connectors');
  if (!connector) {
    alert("Connector section missing in IF node!");
    return null;
  }

  // ✅ Guard: only one ELSE allowed
  const existingElse = connector.querySelector('.else-node');
  if (existingElse) {
    alert("Only one ELSE is allowed per IF!");
    return null;
  }

  // Create ELSE node
  const elseNode = document.createElement('div');
  elseNode.className = 'else-node';
  elseNode.id = makeId('else');
  elseNode.dataset.type = `conditional ${type}`;

  const header = document.createElement('div');
  header.className = 'else-header';

  const labelElse = document.createElement('span');
  labelElse.className = 'else-label';
  labelElse.textContent = 'else ->';

  const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
  bodySlot.classList.add('else-body');

  header.appendChild(labelElse);
  header.appendChild(bodySlot);
  elseNode.appendChild(header);

  // ✅ Always append ELSE to the bottom — even if user later adds more ELIFs
  connector.appendChild(elseNode);

  // ✅ MutationObserver ensures ELSE stays last if user drags/creates more ELIFs
  const observer = new MutationObserver(() => {
    const els = Array.from(connector.children);
    const currentElse = connector.querySelector('.else-node');
    if (currentElse && els.indexOf(currentElse) !== els.length - 1) {
      connector.appendChild(currentElse); // move ELSE to the bottom
    }
  });
  observer.observe(connector, { childList: true });

  makeDraggable(elseNode);
  makeMovable(elseNode, whiteboard, codeArea, dimOverlay);
  attachTooltip(elseNode, "Else: default branch at the end of the conditional chain.");

  return elseNode;
}

}
