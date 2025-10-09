import { slotToCode } from './helpers';

let definedVariables = []; // ✅ Track declared variable names

export function detectTypeAndFormat(value, definedVars = []) {
  if (value == null || value === "") return { code: "None", type: "unknown" };

  // ✅ Check if it's a variable name
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

export function exprFromSlot(slot) {
  if (!slot) return { code: "0", type: "unknown" };

  // --- If slot has dataset.value, always use it ---
  if (slot.dataset?.value && slot.dataset.value.trim() !== "") {
    let val = slot.dataset.value.trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    return detectTypeAndFormat(val, definedVariables);
  }

  // --- Process children recursively ---
  const children = Array.from(slot.children);
  if (children.length > 0) {
    const codes = children.map(child => {
      if (child.classList.contains("operator") ||
          child.classList.contains("variable") ||
          child.classList.contains("print-node") ||
          child.classList.contains("if-node") ||
          child.classList.contains("elif-node") ||
          child.classList.contains("else-node")) {
        return generateNodeCode(child).code;
      }

      if (child.tagName === "INPUT") return detectTypeAndFormat(child.value.trim(), definedVariables).code;

      if (child.dataset?.value && child.dataset.value.trim() !== "") {
        let val = child.dataset.value.trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        return detectTypeAndFormat(val, definedVariables).code;
      }

      return child.textContent.trim() || "";
    }).filter(Boolean);

    return { code: codes.join(" "), type: "mixed" };
  }

  // --- Fallback input inside slot ---
  const input = slot.querySelector("input");
  if (input) return detectTypeAndFormat(input.value.trim(), definedVariables);

  return { code: "0", type: "unknown" };
}


export function generateNodeCode(node) {
  if (!node) return { code: "", type: "unknown" };

  // ---- Operator ----
  if (node.classList.contains("operator")) {
    const op = node.dataset.op;
    const slots = Array.from(node.children).filter(c => c.classList?.contains('slot'));
    const left = slots[0] ? exprFromSlot(slots[0]) : { code: "0", type: "unknown" };
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
    if (!definedVariables.includes(varName)) definedVariables.push(varName); // ✅ Track declared variable

    const slot = node.querySelector(".variable-slot");
    const rhs = exprFromSlot(slot);

    const typedValue = node.dataset.value?.trim();
    if (typedValue && (!slot || slot.children.length === 0)) {
      const detected = detectTypeAndFormat(typedValue, definedVariables);
      return { code: `${varName} = ${detected.code}  # ${detected.type}`, type: detected.type };
    }
    return { code: `${varName} = ${rhs.code}  # ${rhs.type}`, type: rhs.type };
  }


  // ---- Print Node ----
  if (node.classList.contains("print-node")) {
    const slot = node.querySelector(".print-slot");
    let value = slot?.dataset?.value?.trim() || "";

    // --- Try dataset.value first ---
    if (value) {
      // Handle operator-like expressions e.g. "a+1", "x>=y"
      // Handle operator-like expressions e.g. "a+1", "x>=y"
if (/[+\-*/<>=]/.test(value)) {
  const tokens = value.match(/([^+\-*/<>=]+|[+\-*/<>=])/g) || [value];
  const formatted = tokens
    .map(t => {
      const trimmed = t.trim();
      if (trimmed === "") return "";
      if (/^[+\-*/<>=]+$/.test(trimmed)) return ` ${trimmed} `;
      return detectTypeAndFormat(trimmed, definedVariables).code;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return { code: `print(${formatted})`, type: "print" };
}


      // ✅ If variable exists, print variable without quotes
      if (definedVariables.includes(value)) {
        return { code: `print(${value})`, type: "print" };
      }

      // Normal value (no operators)
      const detected = detectTypeAndFormat(value, definedVariables);
      return { code: `print(${detected.code})`, type: "print" };
    }

    // --- Fallback: evaluate nested expression ---
    if (slot) {
      const nestedExpr = exprFromSlot(slot);
      if (nestedExpr && nestedExpr.code && nestedExpr.code !== "0" && nestedExpr.type !== "unknown") {
        return { code: `print(${nestedExpr.code})`, type: "print" };
      }
    }

    // --- Fallback to node.dataset.value if set ---
    if (node.dataset?.value && node.dataset.value.trim() !== "") {
      const fallbackVal = node.dataset.value.trim();
      const detected = detectTypeAndFormat(fallbackVal, definedVariables);
      return { code: `print(${detected.code})`, type: "print" };
    }

    // --- Default ---
    return { code: "print()", type: "print" };
  }

  // ---- While Loop ----
  if (node.classList.contains("while-node")) {
    const condSlot = node.querySelector('.while-cond');
    const bodySlot = node.querySelector('.while-body');

    const condExpr = exprFromSlot(condSlot);
    const bodyCode = bodySlot ? slotToCode(bodySlot, 1) : '    pass';

    const code = `while ${condExpr.code}:\n${bodyCode}`;
    return { code, type: "loop" };
  }

  // ---- Do While Loop ----
  if (node.classList.contains("do-while-node")) {
    const condSlot = node.querySelector('.do-while-cond');
    const bodySlot = node.querySelector('.do-body');

    const condExpr = exprFromSlot(condSlot);
    const bodyCode = bodySlot ? slotToCode(bodySlot, 1) : '    pass';

    // Python doesn't have native do...while; emulate it
    const code =
`while True:
${bodyCode}
    if not (${condExpr.code}):
        break`;

    return { code, type: "loop" };
  }

  // ---- If / Elif / Else ----
  if (node.classList.contains("if-node")) {
    const condExpr = exprFromSlot(node.querySelector('.if-cond'));
    const bodySlot = node.querySelector('.if-body');
    const bodyCode = bodySlot ? slotToCode(bodySlot, 1) : '    pass';

    let code = `if ${condExpr.code}:\n${bodyCode}`;

    // --- Handle connectors (elif / else) ---
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
  definedVariables = []; // ✅ Reset before regeneration

  const nodes = Array.from(whiteboard.children).filter(child =>
  child.classList.contains("variable") ||
  child.classList.contains("print-node") ||
  child.classList.contains("operator") ||
  child.classList.contains("if-node") ||
  child.classList.contains("elif-node") ||
  child.classList.contains("else-node") ||
  child.classList.contains("while-node") ||
  child.classList.contains("do-while-node")
);


  let code = "";
  nodes.forEach(n => {
    const { code: line } = generateNodeCode(n);
    if (line.trim()) code += line + "\n";
  });

  codeArea.textContent = code.trim() || "# Drag elements to build code";
  updateVariableTooltips(whiteboard);
}
