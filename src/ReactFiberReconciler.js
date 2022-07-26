import { createFiber } from "./ReactFiber"
import { isArray, isStringOrNumber } from "./utlis"
import {updateNode} from './utlis'

//原生节点
export function updateHostComponent(wip){
    if(!wip.stateNode){
        wip.stateNode = document.createElement(wip.type)
        updateNode(wip.stateNode,wip.props)//处理属性值（标签名h1，和props：react）
    }
    reconcileChildren(wip,wip.props.children)//遍历props，形成子fiber
    
}
//函数组件
export function updateFunctionComponent(wip){
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
    let previousNewFiber = null
    for (let i = 0; i < newChildren.length; i++) {
        const newChild = newChildren[i];
        if(newChild == null){
            continue
        }

        const newFiber = createFiber(newChild,wip)

        if(previousNewFiber === null){
            //head node
            wip.child = newFiber
        }else{
            previousNewFiber.sibling = newFiber
        }

        previousNewFiber = newFiber
        
    }
}

