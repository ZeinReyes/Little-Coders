import React, { useEffect, useState, useContext } from "react";
import "./DragBoard.css";
import { AuthContext } from "../context/authContext";
import axios from "axios";

import { initDragAndDrop } from "../utils/dragAndDrop";
import { updateCode } from "../utils/codeGen";
import { updateVariableState } from "../utils/state";
import { runProgram } from "../utils/runner";
import LoadingScreen from "./LoadingScreen";
import TutorialModal from "./TutorialModal";

export default function DragBoard() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const { user, refreshUser } = useContext(AuthContext);

  // 🔹 Fetch onboarding status from MongoDB
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (!user?._id) return;

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/users/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Show tutorial only if onboarding not completed
        setShowTutorial(!res.data.hasCompletedOnboarding);
      } catch (err) {
        console.error("Error fetching onboarding status:", err);
      }
    };

    fetchOnboardingStatus();
  }, [user]);

  // 🧩 Loading screen setup
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 500);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 🧠 Initialize drag-and-drop
  useEffect(() => {
    if (loading) return;

    const whiteboard = document.getElementById("whiteboard");
    const codeArea = document.getElementById("codeArea");
    const trashCan = document.getElementById("trashCan");
    const notification = document.getElementById("notification");
    const runButton = document.getElementById("runButton");
    const outputArea = document.getElementById("outputArea");

    if (!whiteboard) {
      console.error("Whiteboard element not found!");
      return;
    }

    const destroy = initDragAndDrop({
      paletteSelector: ".elements img",
      whiteboard,
      codeArea,
      trashCan,
      notification,
    });

    const onRun = () => runProgram(codeArea, outputArea);
    runButton.addEventListener("click", onRun);

    const observer = new MutationObserver(() => {
      updateVariableState(whiteboard);
      updateCode(whiteboard, codeArea);
    });

    observer.observe(whiteboard, { childList: true, subtree: true });

    updateVariableState(whiteboard);
    updateCode(whiteboard, codeArea);

    return () => {
      destroy && destroy();
      runButton.removeEventListener("click", onRun);
      observer.disconnect();
    };
  }, [loading]);

  // ✅ Handle tutorial close (update MongoDB + context)
  const handleTutorialClose = async () => {
    if (!user?._id) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/users/${user._id}/complete-onboarding`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await refreshUser(user._id); // refresh user context
      setShowTutorial(false);
    } catch (err) {
      console.error("Error updating onboarding status:", err);
    }
  };

  if (loading) return <LoadingScreen fadeOut={fadeOut} />;

  return (
    <div>
      {/* ✅ Tutorial modal */}
      {showTutorial && (
        <TutorialModal
          show={showTutorial}
          onClose={() => {
            setShowTutorial(false); // close modal
            // mark onboarding complete is handled inside TutorialModal after last slide
          }}
        />
      )}

      <div className="main-container">
        {/* ELEMENTS PANEL */}
        <div className="draggable">
          <h3>Elements</h3>
          <div className="elements">
            <img src="/assets/images/print1.png" data-type="print" draggable="true" alt="Print" />
            <img src="/assets/images/container.png" data-type="variable" draggable="true" alt="Variable" />
            <img src="/assets/images/multiply.png" data-type="multiply" draggable="true" alt="Multiply" />
            <img src="/assets/images/add.png" data-type="add" draggable="true" alt="Add" />
            <img src="/assets/images/subtract.png" data-type="subtract" draggable="true" alt="Subtract" />
            <img src="/assets/images/divide.png" data-type="divide" draggable="true" alt="Divide" />
            <img src="/assets/images/equalto.png" data-type="equal" draggable="true" alt="Equal ==" />
            <img src="/assets/images/notequal.png" data-type="notequal" draggable="true" alt="Not Equal !=" />
            <img src="/assets/images/lessthan.png" data-type="less" draggable="true" alt="Less Than <" />
            <img src="/assets/images/lessthanequal.png" data-type="lessequal" draggable="true" alt="Less or Equal <=" />
            <img src="/assets/images/greaterthan.png" data-type="greater" draggable="true" alt="Greater Than >" />
            <img src="/assets/images/greaterthanequal.png" data-type="greaterequal" draggable="true" alt="Greater or Equal >=" />
            <img src="/assets/images/if.png" data-type="if" draggable="true" alt="If" />
            <img src="/assets/images/elif.png" data-type="elif" draggable="true" alt="Elif" />
            <img src="/assets/images/else.png" data-type="else" draggable="true" alt="Else" />
            <img src="/assets/images/while.png" data-type="while" draggable="true" alt="While" />
          </div>
        </div>

        {/* WORKSPACE */}
        <div className="workspace">
          <div className="whiteboard-wrap">
            <div id="whiteboard" className="whiteboard">
              <div id="trashCan" className="trash-can">🗑️</div>
            </div>
            <div id="dimOverlay" className="dim-overlay"></div>
          </div>
        </div>

        {/* CODE + OUTPUT */}
        <div className="right-panel">
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
