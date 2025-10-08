import { detectTypeAndFormat, exprFromSlot, generateNodeCode } from './codeGen'; 

export function attachTooltip(el, defaultText) {
  if (!el) return;
  const globalTooltip = document.getElementById("globalTooltip");

  el.dataset.tooltip = defaultText;

  el.addEventListener("mouseenter", () => {
    if (!globalTooltip) return;
    globalTooltip.textContent = el.dataset.tooltip || defaultText;
    globalTooltip.style.display = "block";
  });
  el.addEventListener("mousemove", (e) => {
    if (!globalTooltip) return;
    globalTooltip.style.left = e.pageX + 12 + "px";
    globalTooltip.style.top = e.pageY - 28 + "px";
  });
  el.addEventListener("mouseleave", () => {
    if (!globalTooltip) return;
    globalTooltip.style.display = "none";
  });
}

export function createAutoResizeInput() {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter value';
  input.className = 'typed-input';

  input.style.width = '78px';
  input.style.minWidth = '38px';

  input.addEventListener('input', () => {
    input.style.width = '70px';
    input.style.width = Math.max(38, input.scrollWidth + 8) + 'px';
  });

  return input;
}

export function slotToCode(slot, indentLevel = 0) {
  if (!slot) return 'pass';

  const indent = '    '.repeat(indentLevel);
  const lines = [];

  const children = Array.from(slot.childNodes); // include text nodes

  for (let child of children) {
    let line = '';

    // ---- Operator ----
    if (child.classList && child.classList.contains('operator')) {
      const slots = Array.from(child.querySelectorAll('.slot'));
      const left = slots[0] ? slotToCode(slots[0], 0).trim() : '0';
      const right = slots[1] ? slotToCode(slots[1], 0).trim() : '0';
      const opMap = {
        add: "+", subtract: "-", multiply: "*", divide: "/",
        equal: "==", notequal: "!=", less: "<", lessequal: "<=",
        greater: ">", greaterequal: ">="
      };
      const op = opMap[child.dataset.op] || child.dataset.op || '+';
      line = indent + `${left} ${op} ${right}`;
    }

    // ---- Variable ----
    else if (child.classList && child.classList.contains('variable')) {
      const varName = child.dataset.varName?.trim() || 'result';
      const rhsSlot = child.querySelector('.variable-slot');
      const rhs = rhsSlot ? slotToCode(rhsSlot, 0).trim() : 'None';
      line = indent + `${varName} = ${rhs}`;
    }

    // ---- Print ----
    else if (child.classList && child.classList.contains('print-node')) {
      // ✅ Use generateNodeCode to properly extract dataset.value
      const { code: printCode } = generateNodeCode(child);
      line = indent + printCode;
    }

    // ---- If / Elif / Else ----
    else if (child.classList && child.classList.contains('if-node')) {
      const condExpr = exprFromSlot(child.querySelector('.if-cond'));
      const bodySlot = child.querySelector('.if-body');
      const body = bodySlot ? slotToCode(bodySlot, indentLevel + 1) : indent + '    pass';

      line = indent + `if ${condExpr.code}:\n${body}`;

      const connectors = child.querySelector('.if-connectors');
      if (connectors) {
        for (let sub of connectors.children) {
          if (sub.classList.contains('elif-node')) {
            const elifCond = exprFromSlot(sub.querySelector('.elif-cond'));
            const elifBodySlot = sub.querySelector('.elif-body');
            const elifBody = elifBodySlot ? slotToCode(elifBodySlot, indentLevel + 1) : indent + '    pass';
            line += `\nelif ${elifCond.code}:\n${elifBody}`;
          } else if (sub.classList.contains('else-node')) {
            const elseBodySlot = sub.querySelector('.else-body');
            const elseBody = elseBodySlot ? slotToCode(elseBodySlot, indentLevel + 1) : indent + '    pass';
            line += `\nelse:\n${elseBody}`;
          }
        }
      }
    }

    // ---- Input ----
    else if (child.tagName === 'INPUT') {
      line = indent + (child.value.trim() || '0');
    }

    // ---- Text fallback ----
    else {
      const text = child.textContent?.trim();
      line = indent + (text || 'pass');
    }

    if (line) lines.push(line);
  }

  return lines.join('\n');
}




// 💡 Child-friendly notifications
export function showNestNotification(message) {
  const notif = document.createElement('div');
  notif.textContent = message;
  notif.className = 'nest-notif';
  notif.style.position = 'fixed';
  notif.style.bottom = '20px';
  notif.style.left = '50%';
  notif.style.transform = 'translateX(-50%)';
  notif.style.background = '#fffae6';
  notif.style.color = '#333';
  notif.style.border = '1px solid #f2c94c';
  notif.style.padding = '8px 12px';
  notif.style.borderRadius = '8px';
  notif.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
  notif.style.fontSize = '14px';
  notif.style.zIndex = 9999;

  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2500);
}
