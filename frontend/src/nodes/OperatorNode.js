// src/utils/operator.js
import { createSlot } from '../utils/slot';
import { makeDraggable } from '../utils/draggable';
import { makeMovable } from '../utils/movable';
import { attachTooltip } from '../utils/helpers';
import { makeId } from '../utils/id';   
import { playObjectSound } from '../utils/sfx';
import { addNodeTooltip } from '../utils/tooltip';

function getOperatorSymbol(type) {
  const symbols = {
    add: '+',
    subtract: '-',
    multiply: '*',
    divide: '/',
    equal: '=',
    equalto: '==',
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
    equalto: '/assets/images/equalto.png',
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
    equal: "Assignment (=): Assigns a value to a variable.",
    equalto: "Equal To (==): True if both sides are equal.",
    notequal: "Not Equal (!=): True if sides differ.",
    less: "Less Than (<): True if left is smaller.",
    lessequal: "Less or Equal (<=): True if left ≤ right.",
    greater: "Greater Than (>): True if left is larger.",
    greaterequal: "Greater or Equal (>=): True if left ≥ right."
  };
  return map[type] || "Operator";
}

const OPERATOR_TOOLTIPS = {
  add:          { emoji: '➕', title: 'Add',                    desc: 'Put two numbers together to get a bigger one!',    example: '3 + 4 = 7'        },
  subtract:     { emoji: '➖', title: 'Subtract',               desc: 'Take away one number from another!',               example: '9 - 3 = 6'        },
  multiply:     { emoji: '✖️', title: 'Multiply',               desc: 'Add the same number lots of times — super fast!',  example: '4 × 3 = 12'       },
  divide:       { emoji: '➗', title: 'Divide',                 desc: 'Split something into equal groups!',               example: '10 ÷ 2 = 5'       },
  equal:        { emoji: '📦', title: 'Assign ( = )',           desc: 'Put a value inside a variable box!',               example: 'myAge = 10'       },
  equalto:      { emoji: '🟰', title: 'Equal To ( == )',        desc: 'Check if two things are exactly the same!',        example: '5 == 5 → TRUE'    },
  notequal:     { emoji: '❌', title: 'Not Equal ( != )',       desc: 'Check if two things are different!',               example: '3 != 7 → TRUE'    },
  less:         { emoji: '🐭', title: 'Less Than ( < )',        desc: 'Is the left side smaller than the right?',         example: '3 < 10 → TRUE'    },
  lessequal:    { emoji: '🐭', title: 'Less or Equal ( <= )',   desc: 'Is the left side smaller OR exactly the same?',    example: '5 <= 5 → TRUE'    },
  greater:      { emoji: '🦁', title: 'Greater Than ( > )',     desc: 'Is the left side bigger than the right?',          example: '10 > 3 → TRUE'    },
  greaterequal: { emoji: '🦁', title: 'Greater or Equal ( >= )',desc: 'Is the left side bigger OR exactly the same?',     example: '7 >= 7 → TRUE'    },
};

let operatorCounter = 0; // global sequential operator counter

export function createOperatorNode(type, whiteboard, codeArea, dimOverlay) {
  playObjectSound();
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

  // ---------------- Kid-friendly tooltip ----------------
  addNodeTooltip(op, OPERATOR_TOOLTIPS[type] || { emoji: '🔧', title: 'Operator', desc: 'Does something with two values!', example: '' });

  return op;
}