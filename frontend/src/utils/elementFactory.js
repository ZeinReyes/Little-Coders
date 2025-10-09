import { createVariableNode } from '../nodes/VariableNode';
import { createOperatorNode } from '../nodes/OperatorNode';
import { createConditionalNode } from '../nodes/ConditionalNode';
import { createPrintNode } from '../nodes/PrintNode';
import { createLoopNode } from '../nodes/LoopNode';

export function createElement(type, whiteboard, codeArea, dimOverlay) {
  switch (type) {
    case 'variable':
      return createVariableNode(whiteboard, codeArea, dimOverlay);

    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
    case 'equal':
    case 'notequal':
    case 'less':
    case 'lessequal':
    case 'greater':
    case 'greaterequal':
      return createOperatorNode(type, whiteboard, codeArea, dimOverlay);

    case 'if':
    case 'elif':
    case 'else':
      return createConditionalNode(type, whiteboard, codeArea, dimOverlay);

    case 'print':
      return createPrintNode(whiteboard, codeArea, dimOverlay);

    case 'while':
      return createLoopNode('while', whiteboard, codeArea, dimOverlay);

    case 'dowhile':
    case 'doWhile': // support both naming styles
      return createLoopNode('doWhile', whiteboard, codeArea, dimOverlay);
    
    default:
      console.warn(`Unknown element type: ${type}`);
      return null;
  }
}
