import { isOperator } from './nesting';
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
  const child = slot.querySelector(".operator, .variable, .print-node, .if-node, .elif-node, .else-node");
  if (child) return generateNodeCode(child);
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

  // ---- Print ----
 // ---- Print ----
if (node.classList.contains("print-node")) {
  console.log("🖨️ [generateNodeCode] Processing print-node:", node);

  const slot = node.querySelector(".print-slot");
  if (!slot) {
    console.log("🟠 [generateNodeCode] No print slot found!");
    return { code: "print()", type: "print" };
  }

  console.log("📦 [generateNodeCode] Slot dataset.value:", slot.dataset.value);

  const nestedExpr = exprFromSlot(slot);
  console.log("📘 [generateNodeCode] Nested exprFromSlot result:", nestedExpr);

  if (nestedExpr && nestedExpr.code !== "0" && nestedExpr.type !== "unknown") {
    console.log("✅ [generateNodeCode] Using nested expression");
    return { code: `print(${nestedExpr.code})`, type: "print" };
  }

  const value = slot.dataset.value?.trim() || "";
  console.log("🧾 [generateNodeCode] Fallback value:", value);

  if (value === "") {
    console.log("⚠️ [generateNodeCode] Empty print slot — returning print()");
    return { code: "print()", type: "print" };
  }

  // --- Handle operator-like expressions ---
  if (/[\+\-\*\/<>=]/.test(value)) {
    console.log("🔍 [generateNodeCode] Operator detected in:", value);

    // ✅ Split safely even without spaces
    const tokens = value.match(/([^\+\-\*\/<>=]+|[+\-*/<>=])/g) || [value];
    console.log("🧩 [generateNodeCode] Split tokens:", tokens);

    const formatted = tokens
      .map(t => {
        const trimmed = t.trim();
        if (trimmed === "") return "";
        if (/^[+\-*/<>=]+$/.test(trimmed)) return ` ${trimmed} `;
        const detected = detectTypeAndFormat(trimmed);
        console.log("🔹 [generateNodeCode] Token formatted:", trimmed, "→", detected.code);
        return detected.code;
      })
      .join("")
      .replace(/\s+/g, " ")
      .trim();

    console.log("✅ [generateNodeCode] Final formatted expression:", formatted);
    return { code: `print(${formatted})`, type: "print" };
  }

  const expr = detectTypeAndFormat(value);
  console.log("💡 [generateNodeCode] Final detected expr:", expr);
  return { code: `print(${expr.code})`, type: "print" };
}


  // ---- If / Elif / Else ----
  if (node.classList.contains("if-node")) {
    const cond = exprFromSlot(node.querySelector('.if-cond'));
    const bodySlot = node.querySelector('.if-body');
    const body = bodySlot ? slotToCode(bodySlot) : "pass";

    let code = `if ${formatCondition(cond)}:\n${body.replace(/^/gm, '    ')}`;
    const connectors = node.querySelectorAll('.if-connectors > .elif-node, .if-connectors > .else-node');
    connectors.forEach(c => {
      if (c.classList.contains('elif-node')) {
        const elifCond = exprFromSlot(c.querySelector('.elif-cond'));
        const elifBodySlot = c.querySelector('.elif-body');
        const elifBody = elifBodySlot ? slotToCode(elifBodySlot) : "pass";
        code += `\nelif ${formatCondition(elifCond)}:\n${elifBody.replace(/^/gm, '    ')}`;
      }
      if (c.classList.contains('else-node')) {
        const elseBodySlot = c.querySelector('.else-body');
        const elseBody = elseBodySlot ? slotToCode(elseBodySlot) : "pass";
        code += `\nelse:\n${elseBody.replace(/^/gm, '    ')}`;
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
