import React, { useEffect } from "react";
import { saveWhiteboardState, restoreWhiteboardState } from "../utils/persistence";

const STORAGE_KEY = "workspace_whiteboard_state";

const ALL_BLOCKS = [
  { src: "/assets/images/print1.png",           type: "print",        alt: "Print"        },
  { src: "/assets/images/container.png",        type: "variable",     alt: "Variable"     },
  { src: "/assets/images/multiply.png",         type: "multiply",     alt: "Multiply"     },
  { src: "/assets/images/add.png",              type: "add",          alt: "Add"          },
  { src: "/assets/images/subtract.png",         type: "subtract",     alt: "Subtract"     },
  { src: "/assets/images/divide.png",           type: "divide",       alt: "Divide"       },
  { src: "/assets/images/equal.png",            type: "equal",        alt: "Assign"       },
  { src: "/assets/images/equalto.png",          type: "equalto",      alt: "Equal =="     },
  { src: "/assets/images/notequal.png",         type: "notequal",     alt: "Not Equal"    },
  { src: "/assets/images/lessthan.png",         type: "less",         alt: "Less Than"    },
  { src: "/assets/images/lessthanequal.png",    type: "lessequal",    alt: "Less or ="    },
  { src: "/assets/images/greaterthan.png",      type: "greater",      alt: "Greater"      },
  { src: "/assets/images/greaterthanequal.png", type: "greaterequal", alt: "Greater or =" },
  { src: "/assets/images/if.png",               type: "if",           alt: "If"           },
  { src: "/assets/images/elif.png",             type: "elif",         alt: "Elif"         },
  { src: "/assets/images/else.png",             type: "else",         alt: "Else"         },
  { src: "/assets/images/while.png",            type: "while",        alt: "While"        },
  { src: "/assets/images/do_while.png",         type: "do-while",     alt: "Do While"     },
  { src: "/assets/images/for.png",              type: "for",          alt: "For Loop"     },
];

const TOOLTIP_DESCRIPTIONS = {
  print:        { label: "Print",               desc: "Output a value to the console" },
  variable:     { label: "Variable",            desc: "Store a value in a named container" },
  multiply:     { label: "Multiply ×",          desc: "Multiply two values together" },
  add:          { label: "Add +",               desc: "Add two values together" },
  subtract:     { label: "Subtract −",          desc: "Subtract one value from another" },
  divide:       { label: "Divide ÷",            desc: "Divide one value by another" },
  equal:        { label: "Assign =",            desc: "Assign a value to a variable" },
  equalto:      { label: "Equal To ==",         desc: "Check if two values are equal" },
  notequal:     { label: "Not Equal !=",        desc: "Check if two values are not equal" },
  less:         { label: "Less Than <",         desc: "Check if a value is less than another" },
  lessequal:    { label: "Less or Equal <=",    desc: "Check if a value is less than or equal" },
  greater:      { label: "Greater Than >",      desc: "Check if a value is greater than another" },
  greaterequal: { label: "Greater or Equal >=", desc: "Check if a value is greater or equal" },
  if:           { label: "If",                  desc: "Run a block only if a condition is true" },
  elif:         { label: "Elif",                desc: "Add an alternate condition to an If block" },
  else:         { label: "Else",                desc: "Run a block when no conditions matched" },
  while:        { label: "While Loop",          desc: "Repeat a block while a condition is true" },
  "do-while":   { label: "Do-While Loop",       desc: "Run a block at least once, then repeat" },
  for:          { label: "For Loop",            desc: "Repeat a block a set number of times" },
};

/**
 * Workspace
 * Props:
 *  - lessonType        : "lesson" | "activity" | "assessment"
 *  - timeFormatted     : "04:59"
 *  - dataTypesRequired : [{ type: string, min: number }]
 *  - onSubmit          : () => void
 *  - storageKey        : string  (optional — isolate state per lesson)
 */
export default function Workspace({
  lessonType,
  timeFormatted,
  dataTypesRequired = [],
  onSubmit,
  storageKey,
}) {
  const showTimer        = lessonType === "activity" || lessonType === "assessment";
  const actionButtonText = lessonType === "lesson" ? "▶ Run Program" : "✔ Submit";
  const effectiveKey     = storageKey || STORAGE_KEY;

  const requiredTypes = dataTypesRequired.map(dt =>
    typeof dt === "string" ? dt : dt.type
  );
  const isRestricted =
    (lessonType === "activity" || lessonType === "assessment") &&
    requiredTypes.length > 0;
  const visibleBlocks = isRestricted
    ? ALL_BLOCKS.filter(b => requiredTypes.includes(b.type))
    : ALL_BLOCKS;

  // 💾 Restore after parent's initDragAndDrop runs, then observe for save
  useEffect(() => {
    const whiteboard = document.getElementById("whiteboard");
    const codeArea   = document.getElementById("codeArea");
    const dimOverlay = document.getElementById("dimOverlay");
    if (!whiteboard) return;

    // setTimeout(0) yields so the parent's initDragAndDrop useEffect completes first
    const restoreTimer = setTimeout(() => {
      restoreWhiteboardState(whiteboard, codeArea, dimOverlay, effectiveKey);
    }, 0);

    const observer = new MutationObserver(() => {
      saveWhiteboardState(whiteboard, effectiveKey);
    });

    observer.observe(whiteboard, {
      childList:       true,
      subtree:         true,
      attributes:      true,
      characterData:   true,
      attributeFilter: ["style", "class", "data-var-name", "data-value",
                        "data-op", "data-nested", "data-type"],
    });

    return () => {
      clearTimeout(restoreTimer);
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveKey]);

  // 🏷️ Tooltip logic
  useEffect(() => {
    const tooltip = document.getElementById("globalTooltip");
    if (!tooltip) return;

    const OFFSET = { x: 14, y: -8 };

    const handleMouseMove = (e) => {
      tooltip.style.left = `${e.clientX + OFFSET.x}px`;
      tooltip.style.top  = `${e.clientY + OFFSET.y}px`;
    };
    const handleMouseEnter = (e) => {
      const type = e.currentTarget.dataset.type;
      const info = TOOLTIP_DESCRIPTIONS[type];
      if (!info) return;
      tooltip.innerHTML = `<span class="tooltip-label">${info.label}</span><span class="tooltip-desc">${info.desc}</span>`;
      tooltip.classList.add("tooltip-visible");
      document.addEventListener("mousemove", handleMouseMove);
    };
    const handleMouseLeave = () => {
      tooltip.classList.remove("tooltip-visible");
      document.removeEventListener("mousemove", handleMouseMove);
    };

    const imgs = document.querySelectorAll(".elements img");
    imgs.forEach(img => {
      img.addEventListener("mouseenter", handleMouseEnter);
      img.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      imgs.forEach(img => {
        img.removeEventListener("mouseenter", handleMouseEnter);
        img.removeEventListener("mouseleave", handleMouseLeave);
      });
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [visibleBlocks]);

  // 🧹 Clear board
  const handleClearBoard = () => {
    const whiteboard = document.getElementById("whiteboard");
    const codeArea   = document.getElementById("codeArea");
    const outputArea = document.getElementById("outputArea");
    if (!whiteboard) return;

    Array.from(whiteboard.children).forEach(child => {
      if (child.id !== "trashCan") whiteboard.removeChild(child);
    });

    if (codeArea)   codeArea.textContent   = "/* Build expressions on the whiteboard */";
    if (outputArea) outputArea.textContent = "/* Results will appear here */";

    localStorage.removeItem(effectiveKey);
  };

  return (
    <div className="main-container">

      {/* ── Elements Palette ── */}
      <div className="draggable" id="draggable">
        <h3>Elements</h3>
        <div className="elements">
          {visibleBlocks.map((block) => (
            <div key={block.type} className="element-item">
              <img
                src={block.src}
                data-type={block.type}
                draggable
                alt={block.alt}
              />
              <span className="element-label">{block.alt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Whiteboard ── */}
      <div className="workspace">
        <div className="whiteboard-wrap">
          <div id="trashCan" className="trash-can">🗑️</div>
          <div id="whiteboard" className="whiteboard" />
        </div>
        <button className="clear-board-button" onClick={handleClearBoard}>
          🗑️ Clear Board
        </button>
      </div>

      {/* ── Right Panel ── */}
      <div className="right-panel" id="right-panel">
        {showTimer && (
          <div className="timer-box">⏱ Time Left: {timeFormatted}</div>
        )}

        <div className="code-panel">
          <button
            id="runButton"
            className="run-button"
            onClick={lessonType !== "lesson" ? onSubmit : undefined}
          >
            {actionButtonText}
          </button>
          <div>Source Code</div>
          <pre id="codeArea">/* Build expressions on the whiteboard */</pre>
        </div>

        <div className="output">
          <div>Program Output</div>
          <pre id="outputArea">/* Results will appear here */</pre>
        </div>
      </div>

      <div id="notification" className="notification" style={{ display: "none" }} />
      <div id="globalTooltip" className="tooltip"></div>
    </div>
  );
}