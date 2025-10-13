import React, { useEffect } from "react";
import "./DragBoard.css";

import { initDragAndDrop } from '../utils/dragAndDrop';
import { updateCode } from '../utils/codeGen';
import { updateVariableState } from '../utils/state';
import { runProgram } from '../utils/runner';

export default function DragBoard() {
  useEffect(() => {
    const whiteboard = document.getElementById('whiteboard');
    const codeArea = document.getElementById('codeArea');
    const trashCan = document.getElementById('trashCan');
    const notification = document.getElementById('notification');
    const runButton = document.getElementById('runButton');
    const outputArea = document.getElementById('outputArea');

    const destroy = initDragAndDrop({
      paletteSelector: '.elements img',
      whiteboard,
      codeArea,
      trashCan,
      notification
    });

    const onRun = () => runProgram(codeArea, outputArea);
    runButton.addEventListener('click', onRun);

    const observer = new MutationObserver(() => {
      updateVariableState(whiteboard);
      updateCode(whiteboard, codeArea);
    });
    observer.observe(whiteboard, { childList: true, subtree: true });

    updateVariableState(whiteboard);
    updateCode(whiteboard, codeArea);

    return () => {
      destroy && destroy();
      runButton.removeEventListener('click', onRun);
      observer.disconnect();
    };
  }, []);

  return (
    <div>
      <div className="main-container">
        <div className="draggable">
          <h3>Elements</h3>
          <div className="elements">
            <img src="/assets/images/print1.png" data-type="print" draggable="true" alt="Print" />
            <img src="/assets/images/container.png" data-type="variable" draggable="true" alt="Variable" />
            
            {/* Arithmetic operators */}
            <img src="/assets/images/multiply1.png" data-type="multiply" draggable="true" alt="Multiply"/>
            <img src="/assets/images/plus (2).png" data-type="add" draggable="true" alt="Add"/>
            <img src="/assets/images/minus (2).png" data-type="subtract" draggable="true" alt="Subtract"/>
            <img src="/assets/images/division (2).png" data-type="divide" draggable="true" alt="Divide"/>

            {/* NEW: Comparison operators */}
            <img src="/assets/images/equalto.png" data-type="equal" draggable="true" alt="Equal ==" />
            <img src="/assets/images/notequal.png" data-type="notequal" draggable="true" alt="Not Equal !=" />
            <img src="/assets/images/lessthan.png" data-type="less" draggable="true" alt="Less Than <" />
            <img src="/assets/images/lessthanequal.png" data-type="lessequal" draggable="true" alt="Less or Equal <=" />
            <img src="/assets/images/greaterthan.png" data-type="greater" draggable="true" alt="Greater Than >" />
            <img src="/assets/images/greaterequal.png" data-type="greaterequal" draggable="true" alt="Greater or Equal >=" />

            {/* Conditionals */}
            <img src="/assets/images/if2.png" data-type="if" draggable="true" alt="If"/>
            <img src="/assets/images/elif1.png" data-type="elif" draggable="true" alt="Elif"/>
            <img src="/assets/images/else1.png" data-type="else" draggable="true" alt="Else"/>

            {/* Loops */}
            <img src="/assets/images/while.png" data-type="while" draggable="true" alt="While"/>
          </div>
        </div>

        <div className="workspace">
          <div className="whiteboard-wrap">
            <div id="whiteboard" className="whiteboard">
              <div id="trashCan" className="trash-can">🗑️</div>
            </div>
            <div id="dimOverlay" className="dim-overlay"></div>
          </div>
        </div>

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
