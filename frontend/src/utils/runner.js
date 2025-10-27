/* global loadPyodide */

let pyodideInstance = null;

async function initPyodide() {
  if (!window.loadPyodide) {
    throw new Error("Pyodide script not loaded. Make sure to include pyodide.js in your HTML.");
  }

  if (!pyodideInstance) {
    pyodideInstance = await window.loadPyodide({
      stdout: (msg) => console.log(msg),
      stderr: (err) => console.error(err)
    });
  }
  return pyodideInstance;
}

export async function runProgram(codeArea, outputArea) {
  if (!codeArea || !outputArea) return;
  const code = codeArea.textContent.trim();

  if (!code || code.startsWith("/*")) {
    outputArea.textContent = "⚠ No program to run.";
    return;
  }

  try {
    outputArea.textContent = "⏳ Running Python code...";

    const pyodide = await initPyodide();

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

    const stdout = pyodide.globals.get("_stdout_value");
    const stderr = pyodide.globals.get("_stderr_value");

    if (stderr && stderr.trim()) {
      outputArea.textContent = `❌ Python Error:\n${stderr.trim()}`;
    } else if (stdout && stdout.trim()) {
      outputArea.textContent = `${stdout.trim()}`;
    } else {
      outputArea.textContent = "✅ Program executed successfully (no output)";
    }
  } catch (err) {
    outputArea.textContent = "❌ Fatal Error: " + (err.message || String(err));
  }
}
