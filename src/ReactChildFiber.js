import { createFiber } from "./ReactFiber"
import { isArray, isStringOrNumber, Update } from "./utlis"

// 删除单个节点
function deleteChild(returnFiber, childToDelete) {
    // returnFiber.deletoins = [...]
    const deletions = returnFiber.deletions;
    if (deletions) {
      returnFiber.deletions.push(childToDelete);
    } else {
      returnFiber.deletions = [childToDelete];
    }
  }

//删除剩余旧节点
function deleteRemainingChildren(returnFiber,currentFirstChild){
    let childToDelete = currentFirstChild
    //递归删除
    while(childToDelete){
        deleteChild(returnFiber,childToDelete)
        childToDelete = childToDelete.sibling
    }
}


//渲染子节点（遍历props，形成子fiber）
export function reconcileChildren(returnFiber,children){
    if(isStringOrNumber(children)){
        return
    }

    const newChildren = isArray(children) ? children :[children]

    //oldfiber的头节点
    let oldFiber = returnFiber.alternate?.child

    let previousNewFiber = null
    let newIndex = 0
    for (; newIndex < newChildren.length; newIndex++) {
        const newChild = newChildren[newIndex];
        if(newChild == null){
            continue
        }

        const newFiber = createFiber(newChild,returnFiber)//这里每次都创建fiber子节点
        const same = sameNode(newFiber,oldFiber)

        //节点复用
        if(same){
            Object.assign(newFiber,{
                stateNode:oldFiber.stateNode,
                alternate:oldFiber,
                flags:Update
            })
        }

        //如果oldfiber存在，并且same不一致则进行删除逻辑
        if(!same && oldFiber){
            deleteChild(returnFiber,oldFiber)//（父亲fiber，oldfiber的头子节点）
        }

        //因为i++了需要重新赋值下一个兄弟节点
        if(oldFiber){
            oldFiber = oldFiber.sibling
        }

        if(previousNewFiber === null){
            //head node
            returnFiber.child = newFiber
        }else{
            previousNewFiber.sibling = newFiber
        }

        previousNewFiber = newFiber
        
    }
    //如果新节点遍历完了，但是（多个）老节点还有，（多个）老节点要被删除
    if(newIndex === newChildren.length){
        deleteRemainingChildren(returnFiber,oldFiber)
    }
}

//节点复用的条件：1.同一层级，2.类型相同，3.key相同
function sameNode(a,b){
    return  a && b && a.type === b.type && a.key === b.key
}