import React, { useEffect, useState, useContext } from "react";
import "./DragBoard.css";
import { AuthContext } from "../context/authContext";
import axios from "axios";

import { initDragAndDrop } from "../utils/dragAndDrop";
import { updateCode } from "../utils/codeGen";
import { updateVariableState } from "../utils/state";
import { runProgram } from "../utils/runner";
import { saveWhiteboardState, restoreWhiteboardState } from "../utils/persistence";
import LoadingScreen from "./LoadingScreen";
import TutorialModal from "./TutorialModal";
import NavbarComponent from "./userNavbar";

const STORAGE_KEY = "dragboard_whiteboard_state";

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

export default function DragBoard() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const { user, refreshUser } = useContext(AuthContext);

  // 🔹 Fetch onboarding status
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (!user?._id) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://little-coders-production.up.railway.app/api/users/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShowTutorial(!res.data.hasCompletedOnboarding);
      } catch (err) {
        console.error("Error fetching onboarding status:", err);
      }
    };
    fetchOnboardingStatus();
  }, [user]);

  // 🧩 Loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 500);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 🧠 Init drag-and-drop + restore + observe
  useEffect(() => {
    if (loading) return;

    const whiteboard   = document.getElementById("whiteboard");
    const codeArea     = document.getElementById("codeArea");
    const trashCan     = document.getElementById("trashCan");
    const dimOverlay   = document.getElementById("dimOverlay");
    const notification = document.getElementById("notification");
    const runButton    = document.getElementById("runButton");
    const outputArea   = document.getElementById("outputArea");

    if (!whiteboard) { console.error("Whiteboard not found!"); return; }

    // 1️⃣ Wire drag-and-drop first
    const destroy = initDragAndDrop({
      paletteSelector: ".elements img",
      whiteboard,
      codeArea,
      dimOverlay,
      trashCan,
      notification,
    });

    // 2️⃣ Restore saved nodes — uses createElement so all listeners are live
    restoreWhiteboardState(whiteboard, codeArea, dimOverlay, STORAGE_KEY);

    const onRun = () => runProgram(codeArea, outputArea);
    runButton.addEventListener("click", onRun);

    // 3️⃣ Auto-save on every board change
    const observer = new MutationObserver(() => {
      updateVariableState(whiteboard, dimOverlay);
      updateCode(whiteboard, codeArea);
      saveWhiteboardState(whiteboard, STORAGE_KEY);
    });

    observer.observe(whiteboard, {
      childList:       true,
      subtree:         true,
      attributes:      true,
      characterData:   true,
      attributeFilter: ["style", "class", "data-var-name", "data-value",
                        "data-op", "data-nested", "data-type"],
    });

    updateVariableState(whiteboard, dimOverlay);
    updateCode(whiteboard, codeArea);

    return () => {
      destroy && destroy();
      runButton.removeEventListener("click", onRun);
      observer.disconnect();
    };
  }, [loading]);

  // 🏷️ Tooltip logic
  useEffect(() => {
    if (loading) return;

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
  }, [loading]);

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

    localStorage.removeItem(STORAGE_KEY);
  };

  // ✅ Tutorial close
  const handleTutorialClose = async () => {
    if (!user?._id) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://little-coders-production.up.railway.app/api/users/${user._id}/complete-onboarding`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshUser(user._id);
      setShowTutorial(false);
    } catch (err) {
      console.error("Error updating onboarding status:", err);
    }
  };

  if (loading) return <LoadingScreen fadeOut={fadeOut} />;

  return (
    <div>
      {showTutorial && (
        <TutorialModal show={showTutorial} onClose={handleTutorialClose} />
      )}
      {!showTutorial && <NavbarComponent />}

      <div
        style={{
          marginTop: !showTutorial ? "70px" : "0",
          height:    !showTutorial ? "calc(100vh - 70px)" : "100vh",
        }}
        className="main-container"
      >
        {/* ── Elements Palette ── */}
        <div className="draggable" id="draggable">
          <h3>Elements</h3>
          <div className="elements">
            {ALL_BLOCKS.map((block) => (
              <div key={block.type} className="element-item">
                <img
                  src={block.src}
                  data-type={block.type}
                  draggable="true"
                  alt={block.alt}
                />
                <span className="element-label">{block.alt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Workspace ── */}
        <div className="workspace">
          <div className="whiteboard-wrap">
            <div id="whiteboard" className="whiteboard">
              <div id="trashCan" className="trash-can">🗑️</div>
            </div>
            <div id="dimOverlay" className="dim-overlay"></div>
          </div>
          <button className="clear-board-button" onClick={handleClearBoard}>
            🗑️ Clear Board
          </button>
        </div>

        {/* ── Code + Output ── */}
        <div className="right-panel" id="right-panel">
          <div className="code-panel">
            <button id="runButton" className="run-button">▶ Run Program</button>
            <div>Source Code (preview)</div>
            <pre id="codeArea">/* Build expressions on the whiteboard */</pre>
          </div>
          <div className="output">
            <div>Program Output</div>
            <pre id="outputArea">/* Results will appear here */</pre>
          </div>
        </div>
      </div>

      <div id="notification" className="notification"></div>
      <div id="globalTooltip" className="tooltip"></div>
    </div>
  );
}