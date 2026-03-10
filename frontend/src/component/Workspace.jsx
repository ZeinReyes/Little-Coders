import React, { useEffect, useRef, useState, useCallback } from "react";
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

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

const INTERNAL_STYLES = `
  .whiteboard-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* Zoom controls */
  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.92);
    border: 1.5px solid #e0e0e0;
    border-radius: 30px;
    padding: 4px 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
    font-family: 'Fredoka One', cursive;
    user-select: none;
  }
  .zoom-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    background: #f5f5f5;
    color: #333;
    transition: background 0.15s, transform 0.1s;
    line-height: 1;
  }
  .zoom-btn:hover {
    background: #e8e8e8;
    transform: scale(1.1);
  }
  .zoom-btn:active {
    transform: scale(0.95);
  }
  .zoom-label {
    font-size: 13px;
    color: #555;
    min-width: 42px;
    text-align: center;
    font-family: 'Fredoka One', cursive;
  }
  .zoom-reset-btn {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    border: 1.5px solid #ccc;
    background: #fff;
    color: #777;
    cursor: pointer;
    font-family: 'Fredoka One', cursive;
    transition: background 0.15s;
  }
  .zoom-reset-btn:hover {
    background: #f0f0f0;
    color: #333;
  }

  /* Whiteboard outer container: clips and scrolls */
  .whiteboard-outer {
    position: relative;
    flex: 1;
    overflow: hidden;
    border-radius: 0 0 var(--radius-md, 12px) var(--radius-md, 12px);
    background: inherit;
  }

  /* Whiteboard inner scroller */
  .whiteboard-scroller {
    width: 100%;
    height: 100%;
    overflow: auto;
    cursor: default;
  }

  /* The actual whiteboard canvas — scaled via transform-origin top-left */
  .whiteboard {
    transform-origin: 0 0;
    position: relative;
    /* width/height set by JS to fit zoomed content */
  }

  /* Toolbar row */
  .whiteboard-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Element item base ── */
  .element-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ── Unlocked block ── */
  .element-item.unlocked img {
    cursor: grab;
    opacity: 1;
    filter: none;
    transition: transform 0.15s, filter 0.15s;
  }
  .element-item.unlocked img:hover {
    transform: scale(1.08);
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));
  }
  .element-item.unlocked .element-label {
    color: inherit;
  }

  /* ── Locked block ── */
  .element-item.locked {
    cursor: not-allowed;
  }
  .element-item.locked img {
    opacity: 0.28;
    filter: grayscale(100%) blur(0.6px);
    cursor: not-allowed;
    pointer-events: none;
    user-select: none;
  }
  .element-item.locked .element-label {
    opacity: 0.4;
    color: #888;
  }

  /* ── Lock badge overlay ── */
  .lock-badge {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -60%);
    font-size: 1.25rem;
    pointer-events: none;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
    line-height: 1;
  }

  /* ── Lock tooltip on hover ── */
  .element-item.locked:hover::after {
    content: "🔒 Not available for this challenge";
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.78);
    color: #fff;
    font-size: 0.72rem;
    font-family: 'Comic Sans MS', cursive;
    white-space: nowrap;
    padding: 4px 10px;
    border-radius: 8px;
    pointer-events: none;
    z-index: 999;
  }
`;

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

  // ── Zoom state ──────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1.0);
  const scrollerRef = useRef(null);

  // Apply CSS transform to the whiteboard element whenever zoom changes
  useEffect(() => {
    const wb = document.getElementById("whiteboard");
    if (!wb) return;
    wb.style.transform = `scale(${zoom})`;
    // Expand the scrollable area to match the zoomed content size
    wb.style.width  = `${100 / zoom}%`;
    wb.style.minHeight = `${100 / zoom}%`;
  }, [zoom]);

  const changeZoom = useCallback((delta) => {
    setZoom(prev => {
      const next = Math.round((prev + delta) * 10) / 10;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    });
  }, []);

  const resetZoom = useCallback(() => setZoom(1.0), []);

  // Mouse-wheel zoom on the whiteboard scroller
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return; // only zoom when Ctrl/Cmd held
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setZoom(prev => {
        const next = Math.round((prev + delta) * 10) / 10;
        return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
      });
    };

    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", onWheel);
  }, []);

  // 💅 Inject internal styles once
  useEffect(() => {
    const styleId = "workspace-internal-styles";
    if (!document.getElementById(styleId)) {
      const styleTag = document.createElement("style");
      styleTag.id = styleId;
      styleTag.textContent = INTERNAL_STYLES;
      document.head.appendChild(styleTag);
    }
    return () => {
      const existing = document.getElementById(styleId);
      if (existing) existing.remove();
    };
  }, []);

  // 💾 Restore + observe for save
  useEffect(() => {
    const whiteboard = document.getElementById("whiteboard");
    const codeArea   = document.getElementById("codeArea");
    const dimOverlay = document.getElementById("dimOverlay");
    if (!whiteboard) return;

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

  // 🏷️ Tooltip logic — only for unlocked blocks
  useEffect(() => {
    const tooltip = document.getElementById("globalTooltip");
    if (!tooltip) return;

    const OFFSET = { x: 14, y: -8 };

    const handleMouseMove = (e) => {
      tooltip.style.left = `${e.clientX + OFFSET.x}px`;
      tooltip.style.top  = `${e.clientY + OFFSET.y}px`;
    };
    const handleMouseEnter = (e) => {
      const type = e.currentTarget.closest(".element-item")?.dataset?.blockType;
      if (!type) return;
      if (isRestricted && !requiredTypes.includes(type)) return;
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
  }, [isRestricted, requiredTypes]);

  // 🧹 Clear board
  const handleClearBoard = () => {
    const whiteboard = document.getElementById("whiteboard");
    const codeArea   = document.getElementById("codeArea");
    const outputArea = document.getElementById("outputArea");
    if (!whiteboard) return;

    Array.from(whiteboard.children).forEach(child => {
      whiteboard.removeChild(child);
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
          {ALL_BLOCKS.map((block) => {
            const isLocked = isRestricted && !requiredTypes.includes(block.type);
            return (
              <div
                key={block.type}
                className={`element-item ${isLocked ? "locked" : "unlocked"}`}
                data-block-type={block.type}
              >
                <img
                  src={block.src}
                  data-type={block.type}
                  draggable={!isLocked}
                  alt={block.alt}
                />
                {isLocked && (
                  <span className="lock-badge">🔒</span>
                )}
                <span className="element-label">{block.alt}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Whiteboard ── */}
      <div className="workspace">
        <div className="whiteboard-wrap">

          {/* Toolbar: zoom controls + trash + clear */}
          <div className="whiteboard-toolbar ms-auto">

            {/* Zoom controls */}
            <div className="zoom-controls">
              <button
                className="zoom-btn"
                onClick={() => changeZoom(-ZOOM_STEP)}
                title="Zoom out"
                aria-label="Zoom out"
              >−</button>

              <span className="zoom-label">{Math.round(zoom * 100)}%</span>

              <button
                className="zoom-btn"
                onClick={() => changeZoom(ZOOM_STEP)}
                title="Zoom in"
                aria-label="Zoom in"
              >+</button>

              <button
                className="zoom-reset-btn"
                onClick={resetZoom}
                title="Reset zoom to 100%"
              >Reset</button>
            </div>

            <div id="trashCan" className="trash-can">🗑️</div>
            <button className="clear-board-button" onClick={handleClearBoard}>
              Clear Board
            </button>
          </div>

          {/* Scrollable outer container */}
          <div className="whiteboard-outer">
            <div className="whiteboard-scroller" ref={scrollerRef}>
              {/* The actual whiteboard — scaled via CSS transform */}
              <div id="whiteboard" className="whiteboard" />
            </div>
          </div>

        </div>
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