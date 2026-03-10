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
 * @param {Set}      topLevelTypes  — pre-captured snapshot of types on the board
 * @param {Element}  whiteboard
 * @param {string[]} requiredTypes  — plain type strings e.g. ["variable", "print"]
 * @param {string}   generatedCode
 * @param {Object}   meta           — { minCountMap: { variable: 2, print: 1, ... } }
 */
function checkRequiredNodes(topLevelTypes, whiteboard, requiredTypes = [], generatedCode = "", meta = {}) {
  const missingTypes = [];

  requiredTypes.forEach((req) => {
    console.log(`🔬 [checkRequiredNodes] checking req="${req}", inSnapshot=${topLevelTypes.has(req)}, minCountMap[req]=${meta.minCountMap?.[req]}`);
    if (!topLevelTypes.has(req)) {
      console.log(`🔬 NOT in snapshot → missing`);
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

      console.log(`🔬 [variable branch] usedVarNodes=${usedVarNodes.length}, minRequired=${minRequired}`);
      if (usedVarNodes.length < minRequired) {
        missingTypes.push(req);
      }
    } else {
      // For non-variable types, enforce min count if > 1
      const minRequired = meta.minCountMap?.[req];
      const blockNodes = Array.from(whiteboard.querySelectorAll(`[data-type='${req}']`));
      console.log(`🔬 [else branch] req="${req}", minRequired=${minRequired}, blockNodes.length=${blockNodes.length}, minRequired>1=${minRequired > 1}`);
      if (minRequired && minRequired > 1) {
        if (blockNodes.length < minRequired) {
          missingTypes.push(req);
        }
      }
    }
  });

  console.log("Required:", requiredTypes);
  console.log("Top-level types (snapshot):", Array.from(topLevelTypes));
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
export async function codeChecker(whiteboard, codeArea, outputArea, meta = {}, snapshotTypes = null) {
  if (!whiteboard || !codeArea)
    return { passedOutput: false, passedNodes: false, passedAll: false, missingNodes: [] };

  // ── Normalize dataTypesRequired → plain strings + minCountMap ───────────
  const rawRequired = meta.dataTypesRequired || [];
  const requiredTypes = [];
  const minCountMap = {};

  rawRequired.forEach((item) => {
    if (typeof item === "string") {
      requiredTypes.push(item);
      if (!minCountMap[item]) minCountMap[item] = 1;
    } else if (item && typeof item.type === "string") {
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

  // ── Use the pre-captured snapshot if provided, otherwise snapshot now ────
  const boardTypeSnapshot = snapshotTypes instanceof Set
    ? snapshotTypes
    : collectAllTypes(whiteboard);
  console.log("🔍 [codeChecker] snapshotTypes received:", snapshotTypes ? Array.from(snapshotTypes) : "NONE - falling back to live DOM");
  console.log("🔍 [codeChecker] boardTypeSnapshot used:", Array.from(boardTypeSnapshot));
  console.log("🔍 [codeChecker] requiredTypes:", requiredTypes);

  // ── Check required node types (uses the snapshot, not live DOM) ─────────
  const { passed: passedNodes, missingNodes } = checkRequiredNodes(
    boardTypeSnapshot,
    whiteboard,
    requiredTypes,
    generatedCode,
    { ...meta, minCountMap }
  );

  // ── Run Python and check output ──────────────────────────────────────────
  // NOTE: await here yields the JS thread — the board may be mutated after
  // this point, but missingNodes is already captured above so it's safe.
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

  // ── Build kid-friendly narrated feedback ────────────────────────────────
  const unusedVars = findUnusedVariables(generatedCode);
  const usedVarCount = Array.from(whiteboard.querySelectorAll("[data-type='variable']"))
    .filter((n) => {
      const name = n.dataset?.varName?.trim();
      return name && !unusedVars.has(name);
    }).length;

  if (outputArea) {
    // Clear previous content
    outputArea.innerHTML = "";
    outputArea.style.cssText = `
      font-family: 'Comic Sans MS', cursive;
      font-size: 0.92rem;
      padding: 12px 14px;
      border-radius: 14px;
      line-height: 1.6;
      background: ${passedAll ? "#ebfbee" : "#fff5f5"};
      border: 2px solid ${passedAll ? "#69db7c" : "#ff6b6b"};
      color: ${passedAll ? "#2f9e44" : "#c92a2a"};
    `;

    if (passedAll) {
      outputArea.innerHTML = `
        <div style="font-size:1.4rem; margin-bottom:6px;">🎉 Amazing job!</div>
        <div>Your code ran perfectly! The computer understood exactly what you told it to do. Keep it up! ⭐</div>
        ${stdout ? `<div style="margin-top:8px; padding:8px; background:#d3f9d8; border-radius:10px; font-family:'Courier New',monospace; color:#1c7c2a;">📤 Output:<br>${stdout.replace(/\n/g, "<br>")}</div>` : ""}
      `;
    } else {
      let lines = [];

      // Output mismatch
      if (meta.expectedOutput && !passedOutput) {
        lines.push(`<div style="margin-bottom:6px;">🤔 Hmm, the computer printed something different than what we expected!</div>`);
        lines.push(`<div style="padding:6px 10px; background:#fff0f0; border-radius:8px; margin-bottom:4px;">Got: <code style="color:#c92a2a;">"${stdout || "(nothing)"}"</code></div>`);
        lines.push(`<div style="padding:6px 10px; background:#fff9db; border-radius:8px; margin-bottom:8px;">Expected: <code style="color:#e67700;">"${meta.expectedOutput}"</code></div>`);
      }

      // Missing / unused block messages
      if (!passedNodes) {
        const minVarsRequired = minCountMap["variable"] ?? 1;
        const notEnoughVars = missingNodes.includes("variable") && usedVarCount < minVarsRequired;

        missingNodes.forEach((node) => {
          if (node === "variable" && notEnoughVars && minVarsRequired > 1) {
            lines.push(`<div>📦 You need to use at least <strong>${minVarsRequired} variable blocks</strong>, but right now you're only using <strong>${usedVarCount}</strong>. Try adding more! 💡</div>`);
          } else if (node === "variable" && unusedVars.size > 0) {
            lines.push(`<div>📦 You made a variable — great start! But you forgot to <strong>use it</strong> in your print block. Try typing the variable's name instead of the value directly! 💡</div>`);
          } else if (node === "print") {
            lines.push(`<div>🖨️ Looks like the <strong>print block</strong> isn't quite doing its job yet. Make sure it has something inside it to show! 💡</div>`);
          } else if (node === "if") {
            lines.push(`<div>🔀 You need an <strong>if block</strong> to make a decision in your code! Try adding one. 💡</div>`);
          } else if (node === "while") {
            lines.push(`<div>🔁 A <strong>while loop</strong> is missing! Loops help the computer repeat steps. Give it a try! 💡</div>`);
          } else if (node === "for") {
            lines.push(`<div>🔁 A <strong>for loop</strong> block is needed here. It helps you repeat things a set number of times! 💡</div>`);
          } else if (node === "operator") {
            lines.push(`<div>➕ Don't forget to use an <strong>operator block</strong> to do math or compare things! 💡</div>`);
          } else {
            lines.push(`<div>🧩 The <strong>${node}</strong> block is needed but hasn't been used yet. Try adding it to the board! 💡</div>`);
          }
        });
      }

      outputArea.innerHTML = `
        <div style="font-size:1.1rem; font-weight:bold; margin-bottom:8px;">❌ Not quite!</div>
        ${lines.join("")}
        ${stdout ? `<div style="margin-top:8px; padding:8px; background:#fff3cd; border-radius:10px; font-family:'Courier New',monospace; color:#856404;">📤 Output:<br>${stdout.replace(/\n/g, "<br>")}</div>` : ""}
        ${stderr ? `<div style="margin-top:8px; padding:8px; background:#f8d7da; border-radius:10px; font-family:'Courier New',monospace; color:#721c24;">⚠️ Error:<br>${stderr.replace(/\n/g, "<br>")}</div>` : ""}
      `;
    }
  }

  return {
    passedOutput,
    passedNodes,
    passedAll,
    missingNodes,
    stdout,
    stderr,
  };
}