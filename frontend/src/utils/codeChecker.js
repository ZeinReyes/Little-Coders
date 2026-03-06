/* global loadPyodide */
import { generateNodeCode } from "./codeGen";

let pyodideInstance = null;

async function initPyodide() {
  if (!pyodideInstance) {
    if (!window.loadPyodide) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
      document.head.appendChild(script);
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }

    pyodideInstance = await loadPyodide({
      stdout: (msg) => console.log(msg),
      stderr: (err) => console.error(err),
    });
    window.pyodide = pyodideInstance;
    console.log("✅ Pyodide initialized");
  }
  return pyodideInstance;
}

function collectAllTypes(whiteboard) {
  const types = new Set();
  function walk(node) {
    const type = node.dataset?.type;
    if (type) types.add(type);
    Array.from(node.children).forEach(walk);
  }
  Array.from(whiteboard.children).forEach(walk);
  return types;
}

function findUnusedVariables(generatedCode) {
  const lines = generatedCode.split("\n").map((l) => l.trim()).filter(Boolean);

  const defined = new Map();
  lines.forEach((line, i) => {
    const match = line.match(/^([a-zA-Z_]\w*)\s*=/);
    if (
      match &&
      !line.startsWith("if") &&
      !line.startsWith("while") &&
      !line.startsWith("elif") &&
      !line.startsWith("for")
    ) {
      defined.set(match[1], i);
    }
  });

  const unused = new Set();
  defined.forEach((defIndex, varName) => {
    const pattern = new RegExp(`\\b${varName}\\b`);
    const usedElsewhere = lines.some((line, i) => {
      if (i === defIndex) return false;
      return pattern.test(line);
    });
    if (!usedElsewhere) unused.add(varName);
  });

  return unused;
}

/**
 * Check that all required block types are present AND meet minimum counts.
 *
 * @param {Element}  whiteboard
 * @param {string[]} requiredTypes  — plain type strings e.g. ["variable", "print"]
 * @param {string}   generatedCode
 * @param {Object}   meta           — { minCountMap: { variable: 2, print: 1, ... } }
 */
function checkRequiredNodes(whiteboard, requiredTypes = [], generatedCode = "", meta = {}) {
  const topLevelTypes = collectAllTypes(whiteboard);
  const missingTypes = [];

  requiredTypes.forEach((req) => {
    if (!topLevelTypes.has(req)) {
      missingTypes.push(req);
      return;
    }

    if (req === "variable") {
      const unusedVars = findUnusedVariables(generatedCode);
      const varNodes = Array.from(whiteboard.querySelectorAll("[data-type='variable']"));

      const usedVarNodes = varNodes.filter((n) => {
        const varName = n.dataset?.varName?.trim();
        return varName && !unusedVars.has(varName);
      });

      const minRequired =
        meta.minCountMap?.["variable"] != null
          ? meta.minCountMap["variable"]
          : meta.minVarsRequired != null
          ? meta.minVarsRequired
          : 1;

      if (usedVarNodes.length < minRequired) {
        missingTypes.push(req);
      }
    } else {
      // For non-variable types, enforce min count if > 1
      const minRequired = meta.minCountMap?.[req];
      if (minRequired && minRequired > 1) {
        const blockNodes = Array.from(whiteboard.querySelectorAll(`[data-type='${req}']`));
        if (blockNodes.length < minRequired) {
          missingTypes.push(req);
        }
      }
    }
  });

  console.log("Required:", requiredTypes);
  console.log("Top-level types:", Array.from(topLevelTypes));
  console.log("Missing/unused:", missingTypes);

  return {
    passed: missingTypes.length === 0,
    missingNodes: missingTypes,
  };
}

async function runPythonCode(code) {
  const pyodide = await initPyodide();
  if (!pyodide) return { stdout: "", stderr: "Pyodide failed to load" };

  try {
    const captureCode = `
import sys, io
_stdout = io.StringIO()
_stderr = io.StringIO()
_sys_stdout = sys.stdout
_sys_stderr = sys.stderr
sys.stdout = _stdout
sys.stderr = _stderr
try:
    exec(${JSON.stringify(code)}, globals())
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    sys.stdout = _sys_stdout
    sys.stderr = _sys_stderr
_stdout_value = _stdout.getvalue()
_stderr_value = _stderr.getvalue()
`;
    await pyodide.runPythonAsync(captureCode);

    const stdout = pyodide.globals.get("_stdout_value") || "";
    const stderr = pyodide.globals.get("_stderr_value") || "";

    return { stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (err) {
    return { stdout: "", stderr: String(err) };
  }
}

function normalizeString(str) {
  return str
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

/**
 * Main codeChecker function.
 *
 * meta.dataTypesRequired can be either:
 *   - new shape: [{ type: "variable", min: 2 }, { type: "print", min: 1 }]
 *   - old shape: ["variable", "print"]
 */
export async function codeChecker(whiteboard, codeArea, outputArea, meta = {}) {
  if (!whiteboard || !codeArea)
    return { passedOutput: false, passedNodes: false, passedAll: false, missingNodes: [] };

  // ── Normalize dataTypesRequired → plain strings + minCountMap ───────────
  const rawRequired = meta.dataTypesRequired || [];
  const requiredTypes = [];
  const minCountMap = {};

  rawRequired.forEach((item) => {
    if (typeof item === "string") {
      // Old format
      requiredTypes.push(item);
      if (!minCountMap[item]) minCountMap[item] = 1;
    } else if (item && typeof item.type === "string") {
      // New format: { type, min }
      requiredTypes.push(item.type);
      minCountMap[item.type] = item.min ?? 1;
    }
  });

  // ── Generate Python code ─────────────────────────────────────────────────
  const VALID_CLASSES = [
    "variable", "print-node", "operator",
    "if-node", "elif-node", "else-node",
    "while-node", "do-while-node", "for-node",
  ];

  const nodes = Array.from(whiteboard.children).filter((child) =>
    VALID_CLASSES.some((cls) => child.classList.contains(cls))
  );

  let generatedCode = "";
  nodes.forEach((n) => {
    const { code } = generateNodeCode(n);
    if (code.trim()) generatedCode += code + "\n";
  });

  codeArea.textContent = generatedCode.trim() || "# No code built yet";

  // ── Check required node types ────────────────────────────────────────────
  const { passed: passedNodes, missingNodes } = checkRequiredNodes(
    whiteboard,
    requiredTypes,
    generatedCode,
    { ...meta, minCountMap }
  );

  // ── Run Python and check output ──────────────────────────────────────────
  let passedOutput = true;
  let stdout = "";
  let stderr = "";

  if (meta.expectedOutput) {
    const result = await runPythonCode(generatedCode);
    stdout = result.stdout;
    stderr = result.stderr;
    passedOutput = normalizeString(stdout) === normalizeString(meta.expectedOutput);
  }

  // ── Final pass condition ─────────────────────────────────────────────────
  const passedAll = meta.expectedOutput
    ? passedOutput && passedNodes
    : passedNodes;

  // ── Build feedback ───────────────────────────────────────────────────────
  let feedback = "";

  if (passedAll) {
    feedback = "✅ Correct!";
  } else {
    feedback = "❌ Not quite:\n";

    if (meta.expectedOutput && !passedOutput) {
      feedback += `- Output doesn't match.\n`;
      feedback += `  Got:      "${stdout}"\n`;
      feedback += `  Expected: "${meta.expectedOutput}"\n`;
    }

    if (!passedNodes) {
      const unusedVars = findUnusedVariables(generatedCode);
      const usedVarCount = Array.from(whiteboard.querySelectorAll("[data-type='variable']"))
        .filter((n) => {
          const name = n.dataset?.varName?.trim();
          return name && !unusedVars.has(name);
        }).length;

      const minVarsRequired = minCountMap["variable"] ?? 1;
      const notEnoughVars =
        missingNodes.includes("variable") && usedVarCount < minVarsRequired;

      if (notEnoughVars && minVarsRequired > 1) {
        feedback += `- This challenge requires at least ${minVarsRequired} variables to be used! You're only using ${usedVarCount}. 💡\n`;
      } else if (missingNodes.includes("variable") && unusedVars.size > 0) {
        feedback += `- You created a variable but didn't use it! Try printing the variable name instead of typing the value directly. 💡\n`;
      } else {
        feedback += `- Missing blocks: ${missingNodes.join(", ")}\n`;
      }
    }
  }

  if (stdout) feedback += `\n📤 Output:\n${stdout}`;
  if (stderr) feedback += `\n⚠️ Error:\n${stderr}`;

  if (outputArea) outputArea.textContent = feedback;

  return {
    passedOutput,
    passedNodes,
    passedAll,
    missingNodes,
    stdout,
    stderr,
  };
}