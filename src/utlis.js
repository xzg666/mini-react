// ! flags
export const NoFlags = /*                      */ 0b00000000000000000000;

export const Placement = /*                    */ 0b0000000000000000000010; // 2
export const Update = /*                       */ 0b0000000000000000000100; // 4
export const Deletion = /*                     */ 0b0000000000000000001000; // 8

export function isStr(s) {
  return typeof s === "string";
}

export function isStringOrNumber(s) {
  return typeof s === "string" || typeof s === "number";
}

export function isFn(fn) {
  return typeof fn === "function";
}

export function isUndefined(s) {
  return s === undefined;
}

export function isArray(arr) {
  return Array.isArray(arr);
}

//加属性
//old props {classname:'red',id:'_id'}
//new props {class:'green'}
export function updateNode(node,prevVal,nextVal){

  Object.keys(prevVal).forEach(k=>{
    if(k === 'children'){
      //文本
      if(isStringOrNumber(prevVal[k])){
        node.textContent = ''
      }
    }else if(k.slice(0,2) === 'on'){
      //fake事件，react是使用合成事件
      const eventName = k.slice(2).toLocaleLowerCase()
      node.addEventListener(eventName,prevVal[k])
    }else{
      if(!(k in nextVal)){
        node[k] = ''
      }
      
    }
  })

  //nextval =  props: {children: 'react'}
  Object.keys(nextVal).forEach(k=>{
    if(k === 'children'){
      //文本
      if(isStringOrNumber(nextVal[k])){
        node.textContent = nextVal[k]
      }
    }else if(k.slice(0,2) === 'on'){
      //fake事件，react是使用合成事件
      const eventName = k.slice(2).toLocaleLowerCase()
      node.addEventListener(eventName,nextVal[k])
    }else{
      node[k] = nextVal[k] 
    }
  })
}