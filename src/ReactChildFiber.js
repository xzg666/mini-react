import { createFiber } from "./ReactFiber"
import { isArray, isStringOrNumber, Placement, Update } from "./utlis"

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

//初次渲染，只是记录下标
//更新，检查节点是否移动
function placeChild(
    newFiber,
    lastPlacedIndex,
    newIndex,
    shouldTrackSideEffects
){
    newFiber.index = newIndex
    if(!shouldTrackSideEffects){
        //初次渲染
        return lastPlacedIndex
    }

    //父节点更新
    //子节点上初次渲染还是更新，根据current
    const current = newFiber.alternate
    if(current){
        const oldIndex = current.index
        //子节点是更新
        //old 0 1 2 3 4
        //new 2 1 3 4
        //2 1
        if(oldIndex < lastPlacedIndex){
            //move
            newFiber.flags |= Placement
            return lastPlacedIndex
        }else{
            return oldIndex
        }
    }else{
        //子节点是初次渲染。位运算，初次渲染不影响老dom节点
        newFiber.flags |= Placement
        return lastPlacedIndex
    }
}

function mapRemainingChildren(currentFirstChild) {
    const existingChildren = new Map();
    let existingChild = currentFirstChild;
    while (existingChild) {
      existingChildren.set(
        existingChild.key || existingChild.index,
        existingChild
      );
      existingChild = existingChild.sibling;
    }
  
    return existingChildren;
  }

//协调（diff）   初次渲染和更新都是这个函数
//渲染子节点（遍历props，形成子fiber）
export function reconcileChildren(returnFiber,children){
    if(isStringOrNumber(children)){
        return
    }

    const newChildren = isArray(children) ? children :[children]
    //oldfiber的头节点
    let oldFiber = returnFiber.alternate?.child
    //下一个oldfiber | 暂时缓存下oldfiber
    let nextOldFiber = null
    //判断是否有旧fiber，判断是初次渲染还是更新
    let shouldTrackSideEffects = !!returnFiber.alternate
    let previousNewFiber = null
    let newIndex = 0
    //上一次dom节点插入的最远的位置
    //old 0 1 2 3 4
    //new 2 1 3 4
    let lastPlacedIndex = 0

    // console.log('newfiber',newChildren)

    //*1.从左往右遍历，比较新老节点，如果节点可以复用，继续往右，否则停止
    for (; oldFiber && newIndex < newChildren.length; newIndex++) {
        const newChild = newChildren[newIndex];
        if(newChild == null){
            continue
        }

        if(oldFiber.index > newIndex){
            oldFiber = null
        }else{
            nextOldFiber = oldFiber.sibling
        }

        const same = sameNode(newChild,oldFiber)
        if(!same){
            if(oldFiber === null){
                //拿缓存下一次要使用
                oldFiber = nextOldFiber
            }
            break
        }
        const newFiber = createFiber(newChild,returnFiber)
        //可复用
        Object.assign(newFiber,{
            stateNode:oldFiber.stateNode,
            alternate:oldFiber,
            flags:Update
        })

        lastPlacedIndex = placeChild(
            newFiber,
            lastPlacedIndex,
            newIndex,
            shouldTrackSideEffects
        )

        if (previousNewFiber === null) {
            returnFiber.child = newFiber;
          } else {
            previousNewFiber.sibling = newFiber;
          }

        previousNewFiber = newFiber
        oldFiber = nextOldFiber
    }



    //*2.新节点没了，老节点还有
    // 0 1 2
    //0
    if(newIndex === newChildren.length){
        deleteRemainingChildren(returnFiber,oldFiber)
        return
    }


    //*3.初次渲染
    //1）初次渲染
    //2）老节点没了，新节点
    if(!oldFiber){
        for (; newIndex < newChildren.length; newIndex++) {
            const newChild = newChildren[newIndex];
            if(newChild == null){
                continue
            }
    
            const newFiber = createFiber(newChild,returnFiber)//这里每次都创建fiber子节点

            lastPlacedIndex = placeChild(
                newFiber,
                lastPlacedIndex,
                newIndex,
                shouldTrackSideEffects
            )
    
            //给父fiber添加子fiber
            if(previousNewFiber === null){
                //head node
                returnFiber.child = newFiber
            }else{
                previousNewFiber.sibling = newFiber
            }
    
            previousNewFiber = newFiber
            
        }
    }

    //*4.新老节点还有
    //小而乱
    //old 0 1 【2，3，4】
    //new 0 1 [3,4]
    //!4.1 把剩下的old单链表构建哈希表
    const existingChildren = mapRemainingChildren(oldFiber);

    //!4.2 遍历新节点，通过新节点的key去哈希表中查找节点，找到复用，并且删除哈希表中对应的节点
    for (; newIndex < newChildren.length; newIndex++) {
        const newChild = newChildren[newIndex];
        if (newChild == null) {
          continue;
        }
    
        const newFiber = createFiber(newChild, returnFiber);
        // 新增 | 复用
        let matchedFiber = existingChildren.get(newFiber.key || newFiber.index);
    
        if (matchedFiber) {
          // 节点复用
          Object.assign(newFiber, {
            stateNode: matchedFiber.stateNode,
            alternate: matchedFiber,
            flags: Update,
          });
          existingChildren.delete(newFiber.key || newFiber.index);
        }

        lastPlacedIndex = placeChild(
            newFiber,
            lastPlacedIndex,
            newIndex,
            shouldTrackSideEffects
          );
      
          if (previousNewFiber === null) {
            // head node
            returnFiber.child = newFiber;
          } else {
            previousNewFiber.sibling = newFiber;
          }
      
          previousNewFiber = newFiber;
        }

    //* 5.old的哈希表中还有值，遍历哈希表删除所有的old
    if (shouldTrackSideEffects) {
        existingChildren.forEach((child) => deleteChild(returnFiber, child));
    }
   
}


//节点复用的条件：1.同一层级，2.类型相同，3.key相同
function sameNode(a,b){
    return  a && b && a.type === b.type && a.key === b.key
}