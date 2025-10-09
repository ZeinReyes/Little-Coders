import { slotToCode } from './helpers';

export function detectTypeAndFormat(value) {
  if (value == null || value === "") return { code: "None", type: "unknown" };
  if (/^-?\d+$/.test(value)) return { code: value, type: "int" };
  if (/^-?\d*\.\d+$/.test(value)) return { code: value, type: "float" };
  if (value.length === 1) return { code: `'${value}'`, type: "char" };
  if (value.toLowerCase() === "true" || value.toLowerCase() === "false") {
    return { code: value.toLowerCase() === "true" ? "True" : "False", type: "bool" };
  }
  return { code: `"${value}"`, type: "string" };
}

function formatCondition(expr) {
  if (!expr || !expr.code) return "False";
  switch (expr.type) {
    case "int":
    case "float":
      return `${expr.code} != 0`;
    case "string":
    case "char":
      return `${expr.code} != ""`;
    case "bool":
      return expr.code;
    default:
      return expr.code;
  }
}

export function exprFromSlot(slot) {
  if (!slot) return { code: "0", type: "unknown" };

  // --- If slot has dataset.value, always use it ---
  if (slot.dataset?.value && slot.dataset.value.trim() !== "") {
    let val = slot.dataset.value.trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    return detectTypeAndFormat(val);
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

      if (child.tagName === "INPUT") return detectTypeAndFormat(child.value.trim()).code;

      if (child.dataset?.value && child.dataset.value.trim() !== "") {
        let val = child.dataset.value.trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        return detectTypeAndFormat(val).code;
      }

      return child.textContent.trim() || "";
    }).filter(Boolean);

    return { code: codes.join(" "), type: "mixed" };
  }

  // --- Fallback input inside slot ---
  const input = slot.querySelector("input");
  if (input) return detectTypeAndFormat(input.value.trim());

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
    const slot = node.querySelector(".variable-slot");
    const rhs = exprFromSlot(slot);

    const typedValue = node.dataset.value?.trim();
    if (typedValue && (!slot || slot.children.length === 0)) {
      const detected = detectTypeAndFormat(typedValue);
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
      if (/[\+\-\*\/<>=]/.test(value)) {
        const tokens = value.match(/([^\+\-\*\/<>=]+|[+\-*/<>=])/g) || [value];
        const formatted = tokens
          .map(t => {
            const trimmed = t.trim();
            if (trimmed === "") return "";
            if (/^[+\-*/<>=]+$/.test(trimmed)) return ` ${trimmed} `;
            return detectTypeAndFormat(trimmed).code;
          })
          .join("")
          .replace(/\s+/g, " ")
          .trim();
        return { code: `print(${formatted})`, type: "print" };
      }

      // Normal value (no operators)
      const detected = detectTypeAndFormat(value);
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
      const detected = detectTypeAndFormat(fallbackVal);
      return { code: `print(${detected.code})`, type: "print" };
    }

    // --- Default ---
    return { code: "print()", type: "print" };
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


  if (node.tagName === "INPUT") return detectTypeAndFormat(node.value.trim());
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
  const nodes = Array.from(whiteboard.children).filter(child =>
    child.classList.contains("variable") ||
    child.classList.contains("print-node") ||
    child.classList.contains("operator") ||
    child.classList.contains("if-node") ||
    child.classList.contains("elif-node") ||
    child.classList.contains("else-node")
  );

  let code = "";
  nodes.forEach(n => {
    const { code: line } = generateNodeCode(n);
    if (line.trim()) code += line + "\n";
  });

  codeArea.textContent = code.trim() || "# Drag elements to build code";
  updateVariableTooltips(whiteboard);
}
