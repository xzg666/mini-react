import { renderwithHook } from "./hook"
import { reconcileChildren } from "./ReactChildFiber"
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
    //传fiber给hook，进行hook的updatequeue创建。（useeffect的函数effect）
    renderwithHook(wip)

    const {type,props} = wip
    const children = type(props)//执行函数
    reconcileChildren(wip,children)//协调（diff）遍历props，形成子fiber,形成完整的fiber节点，有child。
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



