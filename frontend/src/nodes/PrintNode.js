import { makeDraggable, getDragState, clearDragSource } from '../utils/draggable';
import { makeMovable } from '../utils/movable';
import { attachTooltip } from '../utils/helpers';
import { makeId } from '../utils/id';
import { updateCode } from '../utils/codeGen';
import { playPrintSound } from '../utils/sfx';

// ---------------- Helper: Extract Expression Recursively ----------------
function extractExpression(node) {
  if (!node) {
    console.warn("⚠️ [extractExpression] node is null");
    return "";
  }

  console.log("🔍 [extractExpression] Processing node:", node);

  // ---------------- INPUT Node ----------------
  if (node.tagName === "INPUT") {
    let val = node.value.trim();
    console.log("💬 [extractExpression] INPUT value:", val);
    if (!val) return "";

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    if (!isNaN(val)) return val;
    return val;
  }

  // ---------------- Dataset Value ----------------
  if (node.dataset?.value && node.dataset.value.trim() !== "") {
    let val = node.dataset.value.trim();
    console.log("💾 [extractExpression] Dataset value:", val);

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    return val;
  }

  // ---------------- Operator Node ----------------
  const isOperatorNode =
    node.classList &&
    (node.classList.contains("operator") || node.classList.contains("operator-node"));

  if (isOperatorNode) {
    console.log("🧮 [extractExpression] Detected operator node:", node);

    let op = node.dataset.op?.trim() || "";

    const opMap = {
      add: "+",
      subtract: "-",
      multiply: "*",
      divide: "/",
      equal: "==",
      notequal: "!=",
      less: "<",
      lessequal: "<=",
      greater: ">",
      greaterequal: ">=",
    };

    if (opMap[op]) {
      op = opMap[op];
    } else if (!/[+\-*/<>=]/.test(op)) {
      const match = node.textContent.match(/==|!=|<=|>=|[+\-*/<>=]/);
      op = match ? match[0] : "+";
    }

    console.log("🧠 [extractExpression] Detected operator:", op);

    const children = Array.from(node.children).filter((child) =>
      child.classList?.contains("slot") ||
      child.tagName === "INPUT" ||
      child.classList?.contains("operator") ||
      child.classList?.contains("operator-node")
    );

    console.log("🧩 [extractExpression] Operator children count (filtered):", children.length);

    const leftRaw = children[0] ? extractExpression(children[0]) : "";
    const rightRaw = children[1] ? extractExpression(children[1]) : "";

    console.log("📗 [extractExpression] Left raw:", leftRaw, "Right raw:", rightRaw);

    const leftExpr =
      children[0] && (children[0].classList?.contains("operator") || children[0].classList?.contains("operator-node"))
        ? `(${leftRaw})`
        : leftRaw;
    const rightExpr =
      children[1] && (children[1].classList?.contains("operator") || children[1].classList?.contains("operator-node"))
        ? `(${rightRaw})`
        : rightRaw;

    const combined = [leftExpr, rightExpr].filter(Boolean).join(` ${op} `).trim();
    console.log("✅ [extractExpression] Combined:", combined);
    return combined;
  }

  // ---------------- Recursion Fallback ----------------
  const childNodes = Array.from(node.children || []);
  if (childNodes.length > 0) {
    console.log("🧱 [extractExpression] Recursing into children:", childNodes.length);
    const parts = childNodes.map(extractExpression).filter((p) => p && p.trim() !== "");
    const joined = parts.join(" ").trim();
    console.log("🔗 [extractExpression] Joined children result:", joined);
    return joined;
  }

  // ---------------- Leaf Text ----------------
  const txt = (node.textContent || "").trim();
  console.log("🧾 [extractExpression] Leaf text:", txt);
  if (!txt) return "";
  if (/^'.'$/.test(txt) || /^".*"$/.test(txt) || !isNaN(txt)) return txt;
  return `"${txt}"`;
}

// ---------------- Local reusable delete function ----------------
function deleteElement(element) {
  if (!element) return;
  const prevParent = element.parentElement;
  element.remove();
  if (prevParent && prevParent.classList.contains("slot")) {
    prevParent.classList.add("empty");
  }
}

// ---------------- Modal Utility ----------------
function createModal(contentBuilder) {
  const overlay = document.createElement("div");
  overlay.className = "print-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "print-modal";

  const header = document.createElement("div");
  header.className = "print-modal-header";
  header.textContent = "Printing Paper";

  const body = document.createElement("div");
  body.className = "print-modal-body";

  const footer = document.createElement("div");
  footer.className = "print-modal-footer";

  contentBuilder(body, footer, () => document.body.removeChild(overlay));

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// ---------------- Helper: clear slot contents ----------------
function clearSlot(slot) {
  // Remove any previously dropped node children
  Array.from(slot.children).forEach(c => c.remove());
  delete slot.dataset.value;
  delete slot.dataset.nodeType;
}

// ---------------- Print Node ----------------
export function createPrintNode(whiteboard, codeArea, dimOverlay) {
  playPrintSound();
  const p = document.createElement("div");
  p.className = "print-node";
  p.id = makeId("print");
  p.dataset.type = "print";

  const printer = document.createElement("img");
  printer.src = "/assets/images/printer.png";
  printer.alt = "Printer";
  printer.className = "printer-img";
  p.appendChild(printer);

  const paperSlot = document.createElement("div");
  paperSlot.className = "print-slot paperSlot empty";
  paperSlot.textContent = "[ Empty printer ]";
  p.appendChild(paperSlot);

  let paperText = "";

  // ---------------- Drag Events ----------------
  paperSlot.ondragover = (e) => {
    e.preventDefault();
    paperSlot.classList.add("drag-over");
  };

  paperSlot.ondragleave = () => {
    paperSlot.classList.remove("drag-over");
  };

  paperSlot.ondrop = (e) => {
    e.preventDefault();
    paperSlot.classList.remove("drag-over");

    const { _dragSource } = getDragState();
    let draggedNode = null;

    if (_dragSource) {
      draggedNode = _dragSource;
    } else {
      const nodeId = e.dataTransfer.getData("text/plain");
      draggedNode = document.getElementById(nodeId);
    }

    if (!draggedNode) return;

    console.log("📥 [print-node] dropped node:", draggedNode, "_dragSource:", !!_dragSource);

    // ✅ Clear any previously stored node or value
    clearSlot(paperSlot);

    // ✅ Clone the dropped node and place it directly inside the slot
    // hidden — preserves full DOM structure for codeGen without showing it visually
    const cloned = draggedNode.cloneNode(true);
    cloned.style.display = "none";

    // ✅ Also store dataset.value as a fallback string expression
    const expr = extractExpression(draggedNode).trim();
    console.log("📦 [print-node] extracted expr:", expr);
    if (expr) {
      paperSlot.dataset.value = expr;
    }

    // ✅ Store the data-type of what was dropped for codeChecker
    const nodeType = draggedNode.dataset?.type || draggedNode.dataset?.op || "";
    if (nodeType) {
      paperSlot.dataset.nodeType = nodeType;
    }

    // Show label so user knows something is inside
    const label = document.createElement("span");
    label.className = "print-slot-label";
    label.textContent = "View printer content";

    paperSlot.textContent = "";
    paperSlot.appendChild(cloned);
    paperSlot.appendChild(label);
    paperSlot.classList.remove("empty");

    if (_dragSource) {
      deleteElement(draggedNode);
    }

    clearDragSource();

    if (typeof updateCode === "function") {
      try { updateCode(whiteboard, codeArea); } catch {}
    }
  };

  // ---------------- Click to Open Modal ----------------
  paperSlot.onclick = (e) => {
    e.stopPropagation();

    createModal((body, footer, closeModal) => {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "print-modal-input";
      // Show the current value — either from a dropped node's expression or typed text
      input.value = paperSlot.dataset.value || "";
      body.appendChild(input);

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.className = "print-modal-btn secondary";
      cancelBtn.onclick = closeModal;

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.className = "print-modal-btn primary";
      saveBtn.onclick = () => {
        paperText = input.value.trim();

        // When saving manually, clear any previously dropped node
        clearSlot(paperSlot);
        Array.from(paperSlot.children).forEach(c => c.remove());

        if (paperText) {
          paperSlot.dataset.value = paperText;
          paperSlot.textContent = "View printer content";
          paperSlot.classList.remove("empty");
        } else {
          paperSlot.textContent = "[ Empty printer ]";
          paperSlot.classList.add("empty");
        }

        closeModal();

        if (typeof updateCode === "function") {
          try { updateCode(whiteboard, codeArea); } catch {}
        }
      };

      footer.appendChild(cancelBtn);
      footer.appendChild(saveBtn);
    });
  };

  paperSlot.onmousedown = (e) => e.stopPropagation();

  // ---------------- Make Node Draggable & Movable ----------------
  makeDraggable(p);
  makeMovable(p, whiteboard, codeArea, dimOverlay);
  attachTooltip(
    p,
    "Print: Drop an operator or click paper slot to open modal and edit expression."
  );

  return p;
}