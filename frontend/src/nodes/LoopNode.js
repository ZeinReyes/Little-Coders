import { createSlot } from '../utils/slot';
import { makeDraggable } from '../utils/draggable';
import { makeMovable } from '../utils/movable';
import { attachTooltip } from '../utils/helpers';
import { makeId } from '../utils/id';
import { playObjectSound } from '../utils/sfx';

export function createLoopNode(type, whiteboard, codeArea, dimOverlay) {
  // ---------------- WHILE LOOP (Hamster Wheel) ----------------
  if (type === 'while') {
    playObjectSound();
    const whileNode = document.createElement('div');
    whileNode.className = 'while-node';
    whileNode.id = makeId('while');
    whileNode.dataset.type = `${type}`;
    
    whileNode.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      padding: 8px;
      box-shadow: 0 6px 18px rgba(102, 126, 234, 0.4);
      border: 3px solid #ffffff;
      min-width: 200px;
      position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;

    // Visual metaphor: Hamster running in wheel (HIDDEN BY DEFAULT)
    const visualBox = document.createElement('div');
    visualBox.style.cssText = `
      background: white;
      border-radius: 10px;
      padding: 10px;
      margin-bottom: 10px;
      text-align: center;
      border: 2px solid #667eea;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.4s ease, opacity 0.3s ease, margin-bottom 0.4s ease;
    `;
    visualBox.innerHTML = `
      <div style="font-size: 32px; margin-bottom: 3px; animation: spin 3s linear infinite;">🐹</div>
      <div style="font-size: 10px; font-weight: 700; color: #667eea; font-family: 'Comic Sans MS', cursive;">
        Keep running while true!
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 6px 10px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    titleBar.innerHTML = `
      <span style="font-size: 16px;">🔄</span>
      <span style="font-weight: 800; color: #667eea; font-size: 13px; font-family: 'Comic Sans MS', cursive;">
        WHILE
      </span>
    `;

    // Condition section
    const conditionSection = document.createElement('div');
    conditionSection.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 8px;
    `;

    const condLabel = document.createElement('div');
    condLabel.style.cssText = `
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 6px;
    `;
    condLabel.innerHTML = `
      <span style="font-size: 14px;">❓</span>
      <span style="font-weight: 700; color: #667eea; font-size: 11px; font-family: 'Comic Sans MS', cursive;">
        Check:
      </span>
    `;

    const condSlot = createSlot(whiteboard, codeArea, dimOverlay);
    condSlot.classList.add('while-cond');
    condSlot.style.cssText = `
      background: linear-gradient(135deg, #FFF9E6 0%, #FFE082 100%);
      border: 3px dashed #FFC107;
      border-radius: 10px;
      min-width: 120px;
      min-height: 35px;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    `;

    conditionSection.appendChild(condLabel);
    conditionSection.appendChild(condSlot);

    // Body section
    const bodySection = document.createElement('div');
    bodySection.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 10px;
    `;

    const bodyLabel = document.createElement('div');
    bodyLabel.style.cssText = `
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 6px;
    `;
    bodyLabel.innerHTML = `
      <span style="font-size: 14px;">🎯</span>
      <span style="font-weight: 700; color: #4CAF50; font-size: 11px; font-family: 'Comic Sans MS', cursive;">
        Repeat:
      </span>
    `;

    const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
    bodySlot.classList.add('while-body');
    bodySlot.style.cssText = `
      background: linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%);
      border: 3px solid #4CAF50;
      border-radius: 10px;
      min-width: 120px;
      min-height: 50px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 12px;
    `;

    bodySection.appendChild(bodyLabel);
    bodySection.appendChild(bodySlot);

    // Flow arrow
    const flowArrow = document.createElement('div');
    flowArrow.style.cssText = `
      text-align: center;
      font-size: 20px;
      margin: 3px 0;
      animation: bounce 1.5s ease-in-out infinite;
    `;
    flowArrow.innerHTML = '⬇️';
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
    `;
    document.head.appendChild(style);

    whileNode.appendChild(visualBox);
    whileNode.appendChild(titleBar);
    whileNode.appendChild(conditionSection);
    whileNode.appendChild(flowArrow);
    whileNode.appendChild(bodySection);

    // Hover effect - SHOW VISUAL BOX
    whileNode.addEventListener('mouseenter', () => {
      whileNode.style.transform = 'scale(1.05) rotate(-1deg)';
      whileNode.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.6)';
      visualBox.style.maxHeight = '100px';
      visualBox.style.opacity = '1';
      visualBox.style.marginBottom = '10px';
    });
    whileNode.addEventListener('mouseleave', () => {
      whileNode.style.transform = 'scale(1) rotate(0deg)';
      whileNode.style.boxShadow = '0 6px 18px rgba(102, 126, 234, 0.4)';
      visualBox.style.maxHeight = '0';
      visualBox.style.opacity = '0';
      visualBox.style.marginBottom = '0';
    });

    makeDraggable(whileNode);
    makeMovable(whileNode, whiteboard, codeArea, dimOverlay);
    attachTooltip(
      whileNode,
      "🐹 While Loop: Keeps running as long as the condition is true!"
    );

    return whileNode;
  }

  // ---------------- FOR LOOP (Counting Steps) ----------------
  if (type === 'for') {
    playObjectSound();
    const forNode = document.createElement('div');
    forNode.className = 'for-node';
    forNode.id = makeId('for');
    forNode.dataset.type = `${type}`;
    
    forNode.style.cssText = `
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border-radius: 15px;
      padding: 8px;
      box-shadow: 0 6px 18px rgba(240, 147, 251, 0.4);
      border: 3px solid #ffffff;
      min-width: 220px;
      position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;

    // Visual metaphor: Walking/counting steps (HIDDEN BY DEFAULT)
    const visualBox = document.createElement('div');
    visualBox.style.cssText = `
      background: white;
      border-radius: 10px;
      padding: 10px;
      margin-bottom: 10px;
      text-align: center;
      border: 2px solid #f5576c;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.4s ease, opacity 0.3s ease, margin-bottom 0.4s ease;
    `;
    visualBox.innerHTML = `
      <div style="display: flex; justify-content: center; gap: 3px; font-size: 24px; margin-bottom: 3px;">
        <span style="animation: step1 1.5s ease-in-out infinite;">👣</span>
        <span style="animation: step2 1.5s ease-in-out infinite;">👣</span>
        <span style="animation: step3 1.5s ease-in-out infinite;">👣</span>
      </div>
      <div style="font-size: 10px; font-weight: 700; color: #f5576c; font-family: 'Comic Sans MS', cursive;">
        Count START to END!
      </div>
      <style>
        @keyframes step1 {
          0%, 33%, 100% { opacity: 0.3; transform: scale(0.8); }
          11%, 22% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes step2 {
          0%, 11%, 44%, 100% { opacity: 0.3; transform: scale(0.8); }
          22%, 33% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes step3 {
          0%, 22%, 55%, 100% { opacity: 0.3; transform: scale(0.8); }
          33%, 44% { opacity: 1; transform: scale(1.2); }
        }
      </style>
    `;

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 6px 10px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    titleBar.innerHTML = `
      <span style="font-size: 16px;">🔢</span>
      <span style="font-weight: 800; color: #f5576c; font-size: 13px; font-family: 'Comic Sans MS', cursive;">
        FOR
      </span>
    `;

    // Variable section
    const varSection = document.createElement('div');
    varSection.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 8px;
    `;

    const varLabel = document.createElement('div');
    varLabel.style.cssText = `
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 6px;
    `;
    varLabel.innerHTML = `
      <span style="font-size: 14px;">📦</span>
      <span style="font-weight: 700; color: #f5576c; font-size: 11px; font-family: 'Comic Sans MS', cursive;">
        Counter:
      </span>
    `;

    const varSlot = createSlot(whiteboard, codeArea, dimOverlay);
    varSlot.classList.add('for-var');
    varSlot.style.cssText = `
      background: linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%);
      border: 3px dashed #2196F3;
      border-radius: 8px;
      min-width: 50px;
      min-height: 28px;
      padding: 5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 12px;
    `;

    varSection.appendChild(varLabel);
    varSection.appendChild(varSlot);

    // Range section
    const rangeSection = document.createElement('div');
    rangeSection.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 8px;
    `;

    const rangeLabel = document.createElement('div');
    rangeLabel.style.cssText = `
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 6px;
    `;
    rangeLabel.innerHTML = `
      <span style="font-size: 14px;">🎯</span>
      <span style="font-weight: 700; color: #f5576c; font-size: 11px; font-family: 'Comic Sans MS', cursive;">
        Range:
      </span>
    `;

    const rangeContainer = document.createElement('div');
    rangeContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    `;

    const startSlot = createSlot(whiteboard, codeArea, dimOverlay);
    startSlot.classList.add('for-start');
    startSlot.style.cssText = `
      background: linear-gradient(135deg, #FFF9E6 0%, #FFE082 100%);
      border: 3px dashed #FFC107;
      border-radius: 8px;
      min-width: 45px;
      min-height: 30px;
      padding: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    `;
    startSlot.innerHTML = '<div style="font-size: 8px; color: #F57F17; font-weight: 700;">START</div>';

    const arrow1 = document.createElement('span');
    arrow1.textContent = '→';
    arrow1.style.fontSize = '14px';

    const endSlot = createSlot(whiteboard, codeArea, dimOverlay);
    endSlot.classList.add('for-end');
    endSlot.style.cssText = `
      background: linear-gradient(135deg, #FFF9E6 0%, #FFE082 100%);
      border: 3px dashed #FFC107;
      border-radius: 8px;
      min-width: 45px;
      min-height: 30px;
      padding: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    `;
    endSlot.innerHTML = '<div style="font-size: 8px; color: #F57F17; font-weight: 700;">END</div>';

    const byLabel = document.createElement('span');
    byLabel.textContent = 'by';
    byLabel.style.cssText = `
      font-weight: 700;
      color: #f5576c;
      font-size: 10px;
      font-family: 'Comic Sans MS', cursive;
    `;

    const stepSlot = createSlot(whiteboard, codeArea, dimOverlay);
    stepSlot.classList.add('for-step');
    stepSlot.style.cssText = `
      background: linear-gradient(135deg, #FFF9E6 0%, #FFE082 100%);
      border: 3px dashed #FFC107;
      border-radius: 8px;
      min-width: 40px;
      min-height: 30px;
      padding: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    `;
    stepSlot.innerHTML = '<div style="font-size: 8px; color: #F57F17; font-weight: 700;">STEP</div>';

    rangeContainer.appendChild(startSlot);
    rangeContainer.appendChild(arrow1);
    rangeContainer.appendChild(endSlot);
    rangeContainer.appendChild(byLabel);
    rangeContainer.appendChild(stepSlot);

    rangeSection.appendChild(rangeLabel);
    rangeSection.appendChild(rangeContainer);

    // Body section
    const bodySection = document.createElement('div');
    bodySection.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 10px;
    `;

    const bodyLabel = document.createElement('div');
    bodyLabel.style.cssText = `
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 6px;
    `;
    bodyLabel.innerHTML = `
      <span style="font-size: 14px;">🎪</span>
      <span style="font-weight: 700; color: #4CAF50; font-size: 11px; font-family: 'Comic Sans MS', cursive;">
        Do:
      </span>
    `;

    const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
    bodySlot.classList.add('for-body');
    bodySlot.style.cssText = `
      background: linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%);
      border: 3px solid #4CAF50;
      border-radius: 10px;
      min-width: 120px;
      min-height: 50px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 12px;
    `;

    bodySection.appendChild(bodyLabel);
    bodySection.appendChild(bodySlot);

    forNode.appendChild(visualBox);
    forNode.appendChild(titleBar);
    forNode.appendChild(varSection);
    forNode.appendChild(rangeSection);
    forNode.appendChild(bodySection);

    // Hover effect - SHOW VISUAL BOX
    forNode.addEventListener('mouseenter', () => {
      forNode.style.transform = 'scale(1.05) rotate(1deg)';
      forNode.style.boxShadow = '0 10px 25px rgba(240, 147, 251, 0.6)';
      visualBox.style.maxHeight = '90px';
      visualBox.style.opacity = '1';
      visualBox.style.marginBottom = '10px';
    });
    forNode.addEventListener('mouseleave', () => {
      forNode.style.transform = 'scale(1) rotate(0deg)';
      forNode.style.boxShadow = '0 6px 18px rgba(240, 147, 251, 0.4)';
      visualBox.style.maxHeight = '0';
      visualBox.style.opacity = '0';
      visualBox.style.marginBottom = '0';
    });

    makeDraggable(forNode);
    makeMovable(forNode, whiteboard, codeArea, dimOverlay);
    attachTooltip(
      forNode,
      "👣 For Loop: Count from START to END by STEP!"
    );

    return forNode;
  }

  // ---------------- DO-WHILE LOOP (Try Then Check) ----------------
  if (type === 'do-while') {
    playObjectSound();
    const doWhileNode = document.createElement('div');
    doWhileNode.className = 'do-while-node';
    doWhileNode.id = makeId('doWhile');
    doWhileNode.dataset.type = `${type}`;
    
    doWhileNode.style.cssText = `
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      border-radius: 15px;
      padding: 8px;
      box-shadow: 0 6px 18px rgba(79, 172, 254, 0.4);
      border: 3px solid #ffffff;
      min-width: 200px;
      position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;

    // Visual metaphor: Try then check (HIDDEN BY DEFAULT)
    const visualBox = document.createElement('div');
    visualBox.style.cssText = `
      background: white;
      border-radius: 10px;
      padding: 10px;
      text-align: center;
      border: 2px solid #00a8cc;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.4s ease, opacity 0.3s ease, margin-bottom 0.4s ease;
    `;
    visualBox.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 3px;">
        <span style="font-size: 28px;">🏃</span>
        <span style="font-size: 18px;">→</span>
        <span style="font-size: 28px;">✅</span>
      </div>
      <div style="font-size: 10px; font-weight: 700; color: #00a8cc; font-family: 'Comic Sans MS', cursive;">
        DO first, THEN check!
      </div>
    `;

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 6px 10px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    titleBar.innerHTML = `
      <span style="font-size: 16px;">🔁</span>
      <span style="font-weight: 800; color: #00a8cc; font-size: 13px; font-family: 'Comic Sans MS', cursive;">
        DO-WHILE
      </span>
    `;

    // DO section
    const doSection = document.createElement('div');
    doSection.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 8px;
    `;

    const doLabel = document.createElement('div');
    doLabel.style.cssText = `
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 6px;
    `;
    doLabel.innerHTML = `
      <span style="font-size: 14px;">🏃</span>
      <span style="font-weight: 700; color: #00a8cc; font-size: 11px; font-family: 'Comic Sans MS', cursive;">
        Do First:
      </span>
    `;

    const bodySlot = createSlot(whiteboard, codeArea, dimOverlay, { multi: true });
    bodySlot.classList.add('do-while-body');
    bodySlot.style.cssText = `
      background: linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%);
      border: 3px solid #4CAF50;
      border-radius: 10px;
      min-width: 120px;
      min-height: 50px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 12px;
    `;

    doSection.appendChild(doLabel);
    doSection.appendChild(bodySlot);

    // THEN arrow
    const thenArrow = document.createElement('div');
    thenArrow.style.cssText = `
      text-align: center;
      margin: 5px 0;
    `;
    thenArrow.innerHTML = `
      <div style="font-size: 16px;">⬇️</div>
      <div style="font-weight: 700; color: white; font-size: 10px; font-family: 'Comic Sans MS', cursive;">
        THEN
      </div>
    `;

    // WHILE section
    const whileSection = document.createElement('div');
    whileSection.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 10px;
    `;

    const whileLabel = document.createElement('div');
    whileLabel.style.cssText = `
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 6px;
    `;
    whileLabel.innerHTML = `
      <span style="font-size: 14px;">❓</span>
      <span style="font-weight: 700; color: #00a8cc; font-size: 11px; font-family: 'Comic Sans MS', cursive;">
        Check Again?
      </span>
    `;

    const condSlot = createSlot(whiteboard, codeArea, dimOverlay);
    condSlot.classList.add('do-while-cond');
    condSlot.style.cssText = `
      background: linear-gradient(135deg, #FFF9E6 0%, #FFE082 100%);
      border: 3px dashed #FFC107;
      border-radius: 10px;
      min-width: 120px;
      min-height: 35px;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    `;

    whileSection.appendChild(whileLabel);
    whileSection.appendChild(condSlot);

    doWhileNode.appendChild(visualBox);
    doWhileNode.appendChild(titleBar);
    doWhileNode.appendChild(doSection);
    doWhileNode.appendChild(thenArrow);
    doWhileNode.appendChild(whileSection);

    // Hover effect - SHOW VISUAL BOX
    doWhileNode.addEventListener('mouseenter', () => {
      doWhileNode.style.transform = 'scale(1.05) rotate(-1deg)';
      doWhileNode.style.boxShadow = '0 10px 25px rgba(79, 172, 254, 0.6)';
      visualBox.style.maxHeight = '90px';
      visualBox.style.opacity = '1';
      visualBox.style.marginBottom = '10px';
    });
    doWhileNode.addEventListener('mouseleave', () => {
      doWhileNode.style.transform = 'scale(1) rotate(0deg)';
      doWhileNode.style.boxShadow = '0 6px 18px rgba(79, 172, 254, 0.4)';
      visualBox.style.maxHeight = '0';
      visualBox.style.opacity = '0';
      visualBox.style.marginBottom = '0';
    });

    makeDraggable(doWhileNode);
    makeMovable(doWhileNode, whiteboard, codeArea, dimOverlay);
    attachTooltip(
      doWhileNode,
      "🔁 Do-While: Do it first, then check if you should repeat!"
    );

    return doWhileNode;
  }
}