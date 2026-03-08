/**
 * persistence.js
 *
 * Fully preserves:
 * - nested operators
 * - slot values
 * - print values
 * - control blocks
 */

import { createElement } from './elementFactory';
import { nestElement } from './nesting';
import { updateCode } from './codeGen';
import { updateVariableState } from './state';

const SLOT_CLASSES = [
  'left-slot','right-slot',
  'print-slot','variable-slot',
  'if-cond','if-body',
  'elif-cond','elif-body',
  'else-body',
  'while-cond','while-body',
  'do-while-cond','do-while-body',
  'for-var','for-start','for-end','for-step','for-body'
];

function isNode(el){

  return el && (
    el.classList.contains('variable') ||
    el.classList.contains('print-node') ||
    el.classList.contains('operator') ||
    el.classList.contains('if-node') ||
    el.classList.contains('elif-node') ||
    el.classList.contains('else-node') ||
    el.classList.contains('while-node') ||
    el.classList.contains('do-while-node') ||
    el.classList.contains('for-node')
  );

}

function getType(el){

  if(el.classList.contains('operator')){
    return el.dataset.op;
  }

  if(el.classList.contains('variable')) return 'variable';
  if(el.classList.contains('print-node')) return 'print';
  if(el.classList.contains('if-node')) return 'if';
  if(el.classList.contains('elif-node')) return 'elif';
  if(el.classList.contains('else-node')) return 'else';
  if(el.classList.contains('while-node')) return 'while';
  if(el.classList.contains('do-while-node')) return 'do-while';
  if(el.classList.contains('for-node')) return 'for';

  return null;
}

/* ================================
   SERIALIZE
================================ */

function serializeNode(el){

  const type = getType(el);
  if(!type) return null;

  const data = {
    type,
    nested: el.dataset.nested === 'true',
    left: parseFloat(el.style.left) || 0,
    top: parseFloat(el.style.top) || 0,
    dataset:{...el.dataset},
    slots:{},
    connectors:[]
  };

  for(const slotClass of SLOT_CLASSES){

    const slot = el.querySelector(`:scope > .${slotClass}, :scope > * > .${slotClass}`);
    if(!slot) continue;

    const slotData = {
      value: slot.dataset.value || '',
      nodeType: slot.dataset.nodeType || '',
      text:'',
      child:null
    };

    const child = Array.from(slot.children).find(isNode);

    if(child){

      slotData.child = serializeNode(child);

    }
    else{

      const input = slot.querySelector('input');

      if(input){
        slotData.text = input.value;
      }
      else{

        const text = slot.textContent.trim();

        if(
          text &&
          text !== 'Enter value' &&
          text !== 'View printer content'
        ){
          slotData.text = text;
        }

      }

    }

    data.slots[slotClass] = slotData;

  }

  return data;

}

/* ================================
   RESTORE
================================ */

function restoreNode(data,whiteboard,codeArea,dimOverlay){

  const el = createElement(data.type,whiteboard,codeArea,dimOverlay);

  if(!data.nested){

    el.style.position='absolute';
    el.style.left=`${data.left}px`;
    el.style.top=`${data.top}px`;

  }

  Object.entries(data.dataset).forEach(([k,v])=>{
    el.dataset[k]=v;
  });

  /* restore slots */

  Object.entries(data.slots).forEach(([slotClass,slotData])=>{

    const slot = el.querySelector(`.${slotClass}`);
    if(!slot) return;

    slot.innerHTML='';

    if(slotData.child){

      const child = restoreNode(
        slotData.child,
        whiteboard,
        codeArea,
        dimOverlay
      );

      child.dataset.nested='true';
      child.style.position='relative';
      child.style.left='0px';
      child.style.top='0px';

      slot.appendChild(child);

      nestElement(child);

    }
    else if(slotData.text){

      slot.textContent = slotData.text;
      slot.dataset.value = slotData.text;

    }

    if(slotData.value){
      slot.dataset.value = slotData.value;
    }

    if(slotData.nodeType){
      slot.dataset.nodeType = slotData.nodeType;
    }

    if(slotClass === 'print-slot'){

      slot.textContent='View printer content';

    }

  });

  return el;

}

/* ================================
   SAVE
================================ */

export function saveWhiteboardState(whiteboard,key){

  const nodes = Array.from(whiteboard.children)
    .filter(el => el.id !== 'trashCan' && isNode(el));

  const state = nodes.map(serializeNode);

  localStorage.setItem(key,JSON.stringify(state));

}

/* ================================
   RESTORE
================================ */

export function restoreWhiteboardState(
  whiteboard,
  codeArea,
  dimOverlay,
  key
){

  const raw = localStorage.getItem(key);
  if(!raw) return;

  const state = JSON.parse(raw);

  state.forEach(nodeData=>{

    const el = restoreNode(
      nodeData,
      whiteboard,
      codeArea,
      dimOverlay
    );

    whiteboard.appendChild(el);

  });

  updateVariableState(whiteboard,dimOverlay);
  updateCode(whiteboard,codeArea);

}