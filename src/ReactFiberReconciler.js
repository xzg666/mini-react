import { renderwithHook } from "./hook"
import { createFiber } from "./ReactFiber"
import { isArray, isStringOrNumber, Update } from "./utlis"
import {updateNode} from './utlis'

//原生节点
export function updateHostComponent(wip){
    if(!wip.stateNode){
        wip.stateNode = document.createElement(wip.type)
        updateNode(wip.stateNode,{},wip.props)//处理属性值（标签名h1，和props：react）
    }
    reconcileChildren(wip,wip.props.children)//遍历props，形成子fiber
    
}
//函数组件
export function updateFunctionComponent(wip){
    //传fiber给hook
    renderwithHook(wip)

    const {type,props} = wip
    const children = type(props)//执行函数
    reconcileChildren(wip,children)//遍历props，形成子fiber,形成完整的fiber节点，有child。
}
//类组件
export function updateClassComponent(wip){
    const {type,props} = wip
    const instance = new type(props)
    const children = instance.render()
    reconcileChildren(wip,children)
}

//文本节点
export function updateHostTextComponent(wip){
    wip.stateNode = document.createTextNode(wip.props.children)

}
//frament
export function updateFragmentComponent(wip){
    //直接渲染子节点就行
    reconcileChildren(wip,wip.props.children)
}



//渲染子节点（遍历props，形成子fiber）
function reconcileChildren(wip,children){
    if(isStringOrNumber(children)){
        return
    }

    const newChildren = isArray(children) ? children :[children]

    //oldfiber的头节点
    let oldFiber = wip.alternate?.child

    let previousNewFiber = null
    for (let i = 0; i < newChildren.length; i++) {
        const newChild = newChildren[i];
        if(newChild == null){
            continue
        }

        const newFiber = createFiber(newChild,wip)//这里每次都创建fiber子节点
        const same = sameNode(newFiber,oldFiber)

        //节点复用
        if(same){
            Object.assign(newFiber,{
                stateNode:oldFiber.stateNode,
                alternate:oldFiber,
                flags:Update
            })
        }

        //因为i++了需要重新赋值下一个兄弟节点
        if(oldFiber){
            oldFiber = oldFiber.sibling
        }

        if(previousNewFiber === null){
            //head node
            wip.child = newFiber
        }else{
            previousNewFiber.sibling = newFiber
        }

        previousNewFiber = newFiber
        
    }
}

//节点复用的条件：1.同一层级，2.类型相同，3.key相同
function sameNode(a,b){
    return  a && b && a.type === b.type && a.key === b.key
}

