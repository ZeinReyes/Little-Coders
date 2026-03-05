import React from "react";

/**
 * Workspace
 * The three-column drag-board layout:
 *   LEFT  — Elements palette (draggable blocks)
 *   CENTER — Whiteboard (drop target)
 *   RIGHT  — Timer + Code preview + Output
 *
 * Props:
 *  - lessonType   : "lesson" | "activity" | "assessment"
 *  - timeFormatted: formatted countdown string e.g. "04:59"
 *  - isLesson     : boolean shorthand
 */
export default function Workspace({ lessonType, timeFormatted }) {
  const showTimer = lessonType === "activity" || lessonType === "assessment";
  const actionButtonText = lessonType === "lesson" ? "▶ Run Program" : "Submit";

  return (
    <div className="main-container">
      {/* ── Elements Palette ── */}
      <div className="draggable">
        <h3>Elements</h3>
        <div className="elements">
          <img src="/assets/images/print1.png"           data-type="print"        draggable alt="Print" />
          <img src="/assets/images/container.png"        data-type="variable"     draggable alt="Variable" />
          <img src="/assets/images/multiply.png"         data-type="multiply"     draggable alt="Multiply" />
          <img src="/assets/images/add.png"              data-type="add"          draggable alt="Add" />
          <img src="/assets/images/subtract.png"         data-type="subtract"     draggable alt="Subtract" />
          <img src="/assets/images/divide.png"           data-type="divide"       draggable alt="Divide" />
          <img src="/assets/images/equalto.png"          data-type="equal"        draggable alt="Equal" />
          <img src="/assets/images/notequal.png"         data-type="notequal"     draggable alt="Not Equal" />
          <img src="/assets/images/lessthan.png"         data-type="less"         draggable alt="Less Than" />
          <img src="/assets/images/lessthanequal.png"    data-type="lessequal"    draggable alt="Less or Equal" />
          <img src="/assets/images/greaterthan.png"      data-type="greater"      draggable alt="Greater Than" />
          <img src="/assets/images/greaterthanequal.png" data-type="greaterequal" draggable alt="Greater or Equal" />
          <img src="/assets/images/if.png"               data-type="if"           draggable alt="If" />
          <img src="/assets/images/elif.png"             data-type="elif"         draggable alt="Elif" />
          <img src="/assets/images/else.png"             data-type="else"         draggable alt="Else" />
          <img src="/assets/images/while.png"            data-type="while"        draggable alt="While" />
          <img src="/assets/images/do_while.png"         data-type="do-while"     draggable alt="Do While Loop" />
          <img src="/assets/images/for.png"              data-type="for"          draggable alt="For Loop" />
        </div>
      </div>

      {/* ── Whiteboard ── */}
      <div className="workspace">
        <div className="whiteboard-wrap">
          <div id="whiteboard" className="whiteboard">
            <div id="trashCan" className="trash-can">🗑️</div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="right-panel">
        {showTimer && (
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: "700",
              color: "#e53935",
              marginBottom: "1rem",
              textAlign: "center",
              padding: "0.75rem",
              backgroundColor: "#fff3e0",
              borderRadius: "12px",
              border: "3px solid #ff9800",
            }}
          >
            ⏱ Time Left: {timeFormatted}
          </div>
        )}
        <div className="code-panel">
          <button id="runButton" className="run-button">
            {actionButtonText}
          </button>
          <div>Source Code (preview)</div>
          <pre id="codeArea">/* Build expressions on the whiteboard */</pre>
        </div>
        <div className="output">
          <div>Program Output</div>
          <pre id="outputArea">/* Results will appear here */</pre>
        </div>
      </div>

      <div id="notification" className="notification" style={{ display: "none" }} />
    </div>
  );
}