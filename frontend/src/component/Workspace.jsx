import React from "react";

const ALL_BLOCKS = [
  { src: "/assets/images/print1.png",           type: "print",        alt: "Print"            },
  { src: "/assets/images/container.png",        type: "variable",     alt: "Variable"         },
  { src: "/assets/images/multiply.png",         type: "multiply",     alt: "Multiply"         },
  { src: "/assets/images/add.png",              type: "add",          alt: "Add"              },
  { src: "/assets/images/subtract.png",         type: "subtract",     alt: "Subtract"         },
  { src: "/assets/images/divide.png",           type: "divide",       alt: "Divide"           },
  { src: "/assets/images/equal.png",            type: "equal",        alt: "Equal"            },
  { src: "/assets/images/equalto.png",          type: "equalto",      alt: "Equal To (==)" },
  { src: "/assets/images/notequal.png",         type: "notequal",     alt: "Not Equal"        },
  { src: "/assets/images/lessthan.png",         type: "less",         alt: "Less Than"        },
  { src: "/assets/images/lessthanequal.png",    type: "lessequal",    alt: "Less or Equal"    },
  { src: "/assets/images/greaterthan.png",      type: "greater",      alt: "Greater Than"     },
  { src: "/assets/images/greaterthanequal.png", type: "greaterequal", alt: "Greater or Equal" },
  { src: "/assets/images/if.png",               type: "if",           alt: "If"               },
  { src: "/assets/images/elif.png",             type: "elif",         alt: "Elif"             },
  { src: "/assets/images/else.png",             type: "else",         alt: "Else"             },
  { src: "/assets/images/while.png",            type: "while",        alt: "While"            },
  { src: "/assets/images/do_while.png",         type: "do-while",     alt: "Do While Loop"    },
  { src: "/assets/images/for.png",              type: "for",          alt: "For Loop"         },
];

/**
 * Workspace
 * Props:
 *  - lessonType        : "lesson" | "activity" | "assessment"
 *  - timeFormatted     : "04:59"
 *  - dataTypesRequired : [{ type: string, min: number }] — filters palette for activity/assessment
 */
export default function Workspace({ lessonType, timeFormatted, dataTypesRequired = [] }) {
  const showTimer = lessonType === "activity" || lessonType === "assessment";
  const actionButtonText = lessonType === "lesson" ? "▶ Run Program" : "✔ Submit";

  // Extract just the type strings from the new { type, min } shape
  const requiredTypes = dataTypesRequired.map((dt) =>
    typeof dt === "string" ? dt : dt.type
  );

  const isRestricted =
    (lessonType === "activity" || lessonType === "assessment") &&
    requiredTypes.length > 0;

  const visibleBlocks = isRestricted
    ? ALL_BLOCKS.filter((b) => requiredTypes.includes(b.type))
    : ALL_BLOCKS;

  return (
    <div className="main-container">

      {/* ── Elements Palette ── */}
      <div className="draggable" id="draggable">
        <h3>Elements</h3>
        <div className="elements">
          {visibleBlocks.map((block) => (
            <img
              key={block.type}
              src={block.src}
              data-type={block.type}
              draggable
              alt={block.alt}
              title={block.alt}
            />
          ))}
        </div>
      </div>

      {/* ── Whiteboard ── */}
      <div className="workspace">
        <div className="whiteboard-wrap">
          <div id="trashCan" className="trash-can">🗑️</div>
          <div id="whiteboard" className="whiteboard" />
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="right-panel" id="right-panel">

        {/* Timer */}
        {showTimer && (
          <div className="timer-box">
            ⏱ Time Left: {timeFormatted}
          </div>
        )}

        {/* Code preview */}
        <div className="code-panel">
          <button id="runButton" className="run-button">
            {actionButtonText}
          </button>
          <div>Source Code</div>
          <pre id="codeArea">/* Build expressions on the whiteboard */</pre>
        </div>

        {/* Output */}
        <div className="output">
          <div>Program Output</div>
          <pre id="outputArea">/* Results will appear here */</pre>
        </div>

      </div>

      <div id="notification" className="notification" style={{ display: "none" }} />
    </div>
  );
}