import { slotToCode } from './helpers';

let definedVariables = []; // Track declared variable names

export function detectTypeAndFormat(value, definedVars = []) {
  if (value == null || value === "") return { code: "None", type: "unknown" };

  if (definedVars.includes(value)) {
    return { code: value, type: "variable" };
  }

  if (/^-?\d+$/.test(value)) return { code: value, type: "int" };
  if (/^-?\d*\.\d+$/.test(value)) return { code: value, type: "float" };
  if (value.length === 1) return { code: `'${value}'`, type: "char" };
  if (value.toLowerCase() === "true" || value.toLowerCase() === "false") {
    return { code: value.toLowerCase() === "true" ? "True" : "False", type: "bool" };
  }
  return { code: `"${value}"`, type: "string" };
}

const NODE_CLASSES = [
  "operator", "variable", "print-node",
  "if-node", "elif-node", "else-node",
  "while-node", "do-while-node", "for-node"
];

function isNodeElement(el) {
  return NODE_CLASSES.some(cls => el.classList.contains(cls));
}

export function exprFromSlot(slot) {
  if (!slot) return { code: "0", type: "unknown" };

  // PRIORITY 1: If slot directly contains a known node, generate code from it
  const nodeChildren = Array.from(slot.children).filter(isNodeElement);
  if (nodeChildren.length > 0) {
    const codes = nodeChildren.map(child => generateNodeCode(child).code).filter(Boolean);
    return { code: codes.join(" "), type: "mixed" };
  }

  // PRIORITY 2: data-value on the slot itself
  if (slot.dataset?.value && slot.dataset.value.trim() !== "") {
    let val = slot.dataset.value.trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    // If it looks like an expression (has operators), tokenize and preserve variable names
    if (/[+\-*/<>=]/.test(val)) {
      const tokens = val.match(/([a-zA-Z_]\w*|\d+\.?\d*|[+\-*/<>=!]+)/g) || [val];
      const formatted = tokens.map(t => {
        const trimmed = t.trim();
        if (!trimmed) return "";
        if (/^[+\-*/<>=!]+$/.test(trimmed)) return ` ${trimmed} `;
        return detectTypeAndFormat(trimmed, definedVariables).code;
      }).join("").replace(/\s+/g, " ").trim();
      return { code: formatted, type: "mixed" };
    }

    return detectTypeAndFormat(val, definedVariables);
  }

  // PRIORITY 3: direct input inside slot
  const input = slot.querySelector("input");
  if (input && input.value.trim() !== "") {
    return detectTypeAndFormat(input.value.trim(), definedVariables);
  }

  return { code: "0", type: "unknown" };
}


export function generateNodeCode(node) {
  if (!node) return { code: "", type: "unknown" };

  // ---- Operator ----
  if (node.classList.contains("operator")) {
    const op = node.dataset.op;

    // Get the two slots
    const slots = Array.from(node.querySelectorAll(':scope > .slot, :scope > [class*="slot"]'));
    const left  = slots[0] ? exprFromSlot(slots[0]) : { code: "0", type: "unknown" };
    const right = slots[1] ? exprFromSlot(slots[1]) : { code: "0", type: "unknown" };

    const opMap = {
      add: "+", subtract: "-", multiply: "*", divide: "/",
      equal: "==", notequal: "!=", less: "<", lessequal: "<=",
      greater: ">", greaterequal: ">="
    };
    const pyOp = opMap[op] || "+";

    return {
      code: `${left.code} ${pyOp} ${right.code}`,
      type: ["equal","notequal","less","lessequal","greater","greaterequal"].includes(op)
        ? "bool"
        : left.type === right.type
        ? left.type
        : "mixed"
    };
  }

  // ---- Variable ----
  if (node.classList.contains("variable")) {
    const varName = node.dataset.varName?.trim() || "result";
    if (!definedVariables.includes(varName)) definedVariables.push(varName);

    const slot = node.querySelector(".variable-slot");
    const rhs = exprFromSlot(slot);

    const typedValue = node.dataset.value?.trim();
    if (typedValue && (!slot || slot.children.length === 0)) {
      const detected = detectTypeAndFormat(typedValue, definedVariables);
      return { code: `${varName} = ${detected.code}  # ${detected.type}`, type: detected.type };
    }
    return { code: `${varName} = ${rhs.code}  # ${rhs.type}`, type: rhs.type };
  }

  // ---- Print ----
  if (node.classList.contains("print-node")) {
    const slot = node.querySelector(".print-slot");

    if (slot) {
      const expr = exprFromSlot(slot);
      if (expr.code && expr.code !== "0" && expr.type !== "unknown") {
        return { code: `print(${expr.code})`, type: "print" };
      }
    }

    // Fallback: node-level data-value
    if (node.dataset?.value && node.dataset.value.trim() !== "") {
      const detected = detectTypeAndFormat(node.dataset.value.trim(), definedVariables);
      return { code: `print(${detected.code})`, type: "print" };
    }

    return { code: "print()", type: "print" };
  }

  // ---- While Loop ----
  if (node.classList.contains("while-node")) {
    const condSlot = node.querySelector('.while-cond');
    const bodySlot = node.querySelector('.while-body');

    const condExpr = exprFromSlot(condSlot);
    const bodyCode = bodySlot ? slotToCode(bodySlot, 1) : '    pass';

    return { code: `while ${condExpr.code}:\n${bodyCode}`, type: "loop" };
  }

  // ---- Do While Loop ----
  if (node.classList.contains("do-while-node")) {
    const condSlot = node.querySelector('.do-while-cond');
    const bodySlot = node.querySelector('.do-while-body');

    const condExpr = exprFromSlot(condSlot);
    const bodyCode = bodySlot ? slotToCode(bodySlot, 1) : '    pass';

    const code =
`while True:
${bodyCode}
    if not (${condExpr.code}):
        break`;

    return { code, type: "loop" };
  }

  // ---- For Loop ----
  if (node.classList.contains("for-node")) {
    const varSlot = node.querySelector(".for-var");
    const startSlot = node.querySelector(".for-start");
    const endSlot = node.querySelector(".for-end");
    const stepSlot = node.querySelector(".for-step");
    const bodySlot = node.querySelector(".for-body");

    let varName = varSlot?.querySelector("input")?.value?.trim();
    if (!varName) {
      varName = definedVariables.length > 0 ? definedVariables[0] : "i";
    }

    if (!definedVariables.includes(varName)) definedVariables.push(varName);

    const startVal = startSlot?.querySelector("input")?.value?.trim() || "";
    const endVal = endSlot?.querySelector("input")?.value?.trim() || "";
    const stepVal = stepSlot?.querySelector("input")?.value?.trim() || "";

    let rangeArgs = "";
    if (startVal && !endVal && !stepVal) {
      rangeArgs = startVal;
    } else if (startVal && endVal && !stepVal) {
      rangeArgs = `${startVal}, ${endVal}`;
    } else if (startVal && endVal && stepVal) {
      rangeArgs = `${startVal}, ${endVal}, ${stepVal}`;
    } else {
      rangeArgs = "5";
    }

    const bodyCode = bodySlot ? slotToCode(bodySlot, 1) : "    pass";

    const code = `for ${varName} in range(${rangeArgs}):\n${bodyCode}`;
    return { code, type: "loop" };
  }

  // ---- If / Elif / Else ----
  if (node.classList.contains("if-node")) {
    const condExpr = exprFromSlot(node.querySelector('.if-cond'));
    const bodySlot = node.querySelector('.if-body');
    const bodyCode = bodySlot ? slotToCode(bodySlot, 1) : '    pass';

    let code = `if ${condExpr.code}:\n${bodyCode}`;

    const connectors = node.querySelectorAll('.if-connectors > .elif-node, .if-connectors > .else-node');
    connectors.forEach(c => {
      if (c.classList.contains('elif-node')) {
        const elifCondExpr = exprFromSlot(c.querySelector('.elif-cond'));
        const elifBodySlot = c.querySelector('.elif-body');
        const elifBodyCode = elifBodySlot ? slotToCode(elifBodySlot, 1) : '    pass';
        code += `\nelif ${elifCondExpr.code}:\n${elifBodyCode}`;
      }
      if (c.classList.contains('else-node')) {
        const elseBodySlot = c.querySelector('.else-body');
        const elseBodyCode = elseBodySlot ? slotToCode(elseBodySlot, 1) : '    pass';
        code += `\nelse:\n${elseBodyCode}`;
      }
    });

    return { code, type: "conditional" };
  }

  if (node.tagName === "INPUT") return detectTypeAndFormat(node.value.trim(), definedVariables);
  return { code: "", type: "unknown" };
}


export function updateVariableTooltips(whiteboard) {
  const vars = whiteboard.querySelectorAll(".variable");
  vars.forEach(v => {
    const slot = v.querySelector(".variable-slot");
    const rhs = exprFromSlot(slot);
    let tooltipText = "Empty variable";
    if (rhs.code !== "0" && rhs.type !== "unknown")
      tooltipText = `This variable contains: ${rhs.type}`;
    v.setAttribute("title", tooltipText);
  });
}

export function updateCode(whiteboard, codeArea) {
  definedVariables = [];

  const nodes = Array.from(whiteboard.children).filter(child =>
    child.classList.contains("variable") ||
    child.classList.contains("print-node") ||
    child.classList.contains("operator") ||
    child.classList.contains("if-node") ||
    child.classList.contains("elif-node") ||
    child.classList.contains("else-node") ||
    child.classList.contains("while-node") ||
    child.classList.contains("do-while-node") ||
    child.classList.contains("for-node")
  );

  let code = "";
  nodes.forEach(n => {
    const { code: line } = generateNodeCode(n);
    if (line.trim()) code += line + "\n";
  });

  codeArea.textContent = code.trim() || "# Drag elements to build code";
  updateVariableTooltips(whiteboard);
}