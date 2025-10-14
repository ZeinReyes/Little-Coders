// src/utils/operator.js
import { createSlot } from '../utils/slot';
import { makeDraggable } from '../utils/draggable';
import { makeMovable } from '../utils/movable';
import { attachTooltip } from '../utils/helpers';
import { makeId } from '../utils/id';   

function getOperatorSymbol(type) {
  const symbols = {
    add: '+',
    subtract: '-',
    multiply: '*',
    divide: '/',
    equal: '==',
    notequal: '!=',
    less: '<',
    lessequal: '<=',
    greater: '>',
    greaterequal: '>='
  };
  return symbols[type] || type;
}

function getOperatorImage(type) {
  // Map operator types to their image paths
  const images = {
    add: '/assets/images/add.png',
    subtract: '/assets/images/subtract.png',
    multiply: '/assets/images/multiply.png',
    divide: '/assets/images/divide.png',
    equal: '/assets/images/equal.png',
    notequal: '/assets/images/notequal.png',
    less: '/assets/images/less.png',
    lessequal: '/assets/images/lessequal.png',
    greater: '/assets/images/greater.png',
    greaterequal: '/assets/images/greaterequal.png'
  };
  return images[type] || '/assets/images/operator.png';
}

function operatorTooltip(type) {
  const map = {
    add: "Addition (+): Combines two values.",
    subtract: "Subtraction (-): Finds the difference.",
    multiply: "Multiplication (*): Multiplies two values.",
    divide: "Division (/): Divides left by right.",
    equal: "Equality (==): True if both sides are equal.",
    notequal: "Not Equal (!=): True if sides differ.",
    less: "Less Than (<): True if left is smaller.",
    lessequal: "Less or Equal (<=): True if left ≤ right.",
    greater: "Greater Than (>): True if left is larger.",
    greaterequal: "Greater or Equal (>=): True if left ≥ right."
  };
  return map[type] || "Operator";
}

let operatorCounter = 0; // global sequential operator counter

export function createOperatorNode(type, whiteboard, codeArea, dimOverlay) {
  operatorCounter++;
  const opId = operatorCounter; // unique sequential ID for this operator

  const op = document.createElement('div');
  op.className = 'operator';
  op.id = `operator-${opId}`;
  op.dataset.op = type;
  op.dataset.opId = opId; // store operator instance ID
  op.dataset.type = `${type}`;

  // Left slot
  const left = createSlot(whiteboard, codeArea, dimOverlay);
  left.id = `slot-left-${opId}`;
  left.dataset.opId = opId;

  // Right slot
  const right = createSlot(whiteboard, codeArea, dimOverlay);
  right.id = `slot-right-${opId}`;
  right.dataset.opId = opId;

  // Create wrapper for the operator icon
  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'operator-icon-wrapper';
  
  // Create image element
  const img = document.createElement('img');
  img.src = getOperatorImage(type);
  img.alt = getOperatorSymbol(type);
  img.className = 'operator-icon';
  img.draggable = false; // Prevent image from being draggable separately
  
  // Optional: Add error handling if image fails to load
  img.onerror = function() {
    // Fallback to text if image doesn't load
    console.log(`Failed to load image for ${type}, using fallback`);
    iconWrapper.textContent = getOperatorSymbol(type);
    iconWrapper.style.fontWeight = 'bold';
    iconWrapper.style.fontSize = '20px';
  };

  iconWrapper.appendChild(img);

  op.appendChild(left);
  op.appendChild(iconWrapper);
  op.appendChild(right);

  makeDraggable(op);
  makeMovable(op, whiteboard, codeArea, dimOverlay);
  attachTooltip(op, operatorTooltip(type));

  return op;
}