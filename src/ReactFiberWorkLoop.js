import { updateClassComponent, updateFunctionComponent, updateHostComponent, updateHostTextComponent,updateFragmentComponent } from "./ReactFiberReconciler";
import { Fragment, HostComponent,FunctionComponent,ClassComponent, HostText } from "./ReactWorkTags";
import { scheduleCallback } from "./scheduler";
import { Placement, Update, updateNode } from "./utlis";

let wip = null; //work in progress 当前正在工作中的
let wipRoot = null;

//组件初次渲染和更新
export function scheduleUpdateOnFiber(fiber){
    
    wip = fiber 
    wipRoot = fiber//记录根节点
    // console.log('scheduleUpdateOnFiber ',wip)
    // 任务调度
    scheduleCallback(workLoop)


}

function performUnitOfWork(){

    const {tags} = wip
    
    //1.更新当前组件
    switch (tags) {
        case HostComponent:
            updateHostComponent(wip)
            break;
        case FunctionComponent:
            updateFunctionComponent(wip)
            break;
        case ClassComponent:
            updateClassComponent(wip)
            break;
        case Fragment:
            updateFragmentComponent(wip)
            break;
        case HostText:
            updateHostTextComponent(wip)
            break;
        default:
            break;
    }

    //2.下一个更新谁，深度优先遍历（国王的故事）
    if(wip.child){
        wip = wip.child
        return
    }

    let next = wip
    while(next){
        if(next.sibling){
            wip = next.sibling
            return
        }
        next = next.return
    }
    wip = null
}


function workLoop(){
    while(wip){
        //更新组件（走reconcileChildren协调diff，创建新的vnode）
        performUnitOfWork()
    }

    if(!wip && wipRoot){
        commitRoot()//没有需要更新的组件了，提交（vdom=>真实dom）
    }
}

// function workLoop(IdleDeadline){
//     //浏览器有空余时间则进行fiber渲染
//     while(wip && IdleDeadline.timeRemaining() > 0){
//         //更新组件（创建dom节点）
//         performUnitOfWork()
//     }

//     if(!wip && wipRoot){
//         commitRoot()//没有需要更新的组件了，提交（vdom=>真实dom）
//     }
// }

// //浏览器会自动执行，计算浏览器剩余时间
// requestIdleCallback(workLoop)


// --------------------------------------------------------
//commit 提交

function commitRoot(){
    commitWorker(wipRoot)
    // console.log('提交dom',wipRoot)
    //防止commitroot多次被调用
    wipRoot = null
}

function commitWorker(wip){
    if(!wip){
        return
    }

    console.log('wip',wip)

    //vdom => 真实dom
    //1.提交自己
    //parentNode是父dom节点
    // 这样拿父节点不行，函数组件的stateNode是null
    const parentNode = getParentNode(wip.return)
    const {flags,stateNode} = wip
    if(flags & Placement && stateNode){
        // 1
        // 0 1 2 3 4
        // 2 1 3 4
        const before = getHostSibling(wip.sibling);
        insertOrAppendPlacementNode(stateNode, before, parentNode);
        // parentNode.appendChild(stateNode);
    }

    if(flags & Update && stateNode){
        //更新属性  （节点，老fiber，新fiber）
        updateNode(stateNode,wip.alternate.props,wip.props)
    }

    if(wip.deletions){
        //删除wip的子节点
        commitDeletions(wip.deletions,stateNode || parentNode)
    }

    //2.提交子节点
    commitWorker(wip.child)
    //3.提交兄弟节点
    commitWorker(wip.sibling)
}

function getHostSibling(sibling) {
    while (sibling) {
      if (sibling.stateNode && !(sibling.flags & Placement)) {
        return sibling.stateNode;
      }
      sibling = sibling.sibling;
    }
    return null;
  }

function insertOrAppendPlacementNode(stateNode, before, parentNode) {
    if (before) {
      parentNode.insertBefore(stateNode, before);//插入到前面
    } else {
      parentNode.appendChild(stateNode);//插入到后面
    }
}

function getParentNode(wip){
    let tem = wip
    while(tem){
        if(tem.stateNode){
            return tem.stateNode
        }
        tem = tem.return
    }
}

// deletions: fiber
function commitDeletions(deletions, parentNode) {
    for (let i = 0; i < deletions.length; i++) {
      const deletion = deletions[i];
      parentNode.removeChild(getStateNode(deletion));
    }
  }
  
  //不是每个fiber都有dom节点
  function getStateNode(fiber) {
    let tem = fiber;
    while (!tem.stateNode) {
      tem = tem.child;
    }
    return tem.stateNode;
  }