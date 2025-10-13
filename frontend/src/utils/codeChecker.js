/* global loadPyodide */
import { generateNodeCode } from "./codeGen";

let pyodideInstance = null;

// Initialize Pyodide if not already loaded
async function initPyodide() {
  if (!pyodideInstance) {
    if (!window.loadPyodide) {
      // Dynamically load Pyodide script
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

/**
 * Checks if a whiteboard contains the required node types
 */
function checkRequiredNodes(whiteboard, requiredTypes = []) {
  const usedTypes = new Set();
  const missingTypes = [];

  const allNodes = Array.from(whiteboard.querySelectorAll("*"));
  allNodes.forEach((node) => {
    const type = node.dataset?.type;
    if (type) usedTypes.add(type);
  });

  requiredTypes.forEach((req) => {
    if (!usedTypes.has(req)) missingTypes.push(req);
  });

  return {
    passed: missingTypes.length === 0,
    missingNodes: missingTypes,
  };
}

/**
 * Runs Python code using Pyodide and returns stdout and stderr
 */
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

/**
 * Normalize strings for comparison
 */
function normalizeString(str) {
  return str.replace(/\s+/g, " ").trim();
}

/**
 * Main codeChecker function
 */
export async function codeChecker(whiteboard, codeArea, outputArea, meta = {}) {
  if (!whiteboard || !codeArea) return { passedOutput: false, passedNodes: false, missingNodes: [] };

  // Generate Python code from whiteboard nodes
  const nodes = Array.from(whiteboard.children).filter(
    (child) =>
      child.classList.contains("variable") ||
      child.classList.contains("print-node") ||
      child.classList.contains("operator") ||
      child.classList.contains("if-node") ||
      child.classList.contains("elif-node") ||
      child.classList.contains("else-node") ||
      child.classList.contains("while-node") ||
      child.classList.contains("do-while-node")
  );

  let generatedCode = "";
  nodes.forEach((n) => {
    const { code } = generateNodeCode(n);
    if (code.trim()) generatedCode += code + "\n";
  });

  codeArea.textContent = generatedCode.trim() || "# No code built yet";

  // Always run Python code to capture output
  const { stdout, stderr } = await runPythonCode(generatedCode);

  // Compare output only if expectedOutput exists
  let passedOutput = true;
  if (meta.expectedOutput) {
    const expected = meta.expectedOutput.trim();
    passedOutput = normalizeString(stdout) === normalizeString(expected);
  }

  // Check required nodes
  const { passed: passedNodes, missingNodes } = checkRequiredNodes(whiteboard, meta.dataTypes || []);

  // Update outputArea with feedback
  let feedback = "";
  if (passedOutput && passedNodes) {
    feedback = "✅ Correct output and used all required objects!";
  } else {
    feedback = "❌ Issues found:\n";
    if (meta.expectedOutput && !passedOutput) feedback += `- Output mismatch (got: "${stdout}", expected: "${meta.expectedOutput}")\n`;
    if (!passedNodes) feedback += `- Missing objects: ${missingNodes.join(", ")}\n`;
  }

  // Always show the user's stdout and stderr
  if (stdout) feedback += `\n📤 Output:\n${stdout}`;
  if (stderr) feedback += `\n⚠️ Errors:\n${stderr}`;

  if (outputArea) outputArea.textContent = feedback;

  return {
    passedOutput,
    passedNodes,
    missingNodes,
    stdout,
    stderr,
  };
}
