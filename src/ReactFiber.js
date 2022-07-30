import { ClassComponent, Fragment, FunctionComponent, HostComponent, HostText } from "./ReactWorkTags"
import { isStr, Placement,isFn, isUndefined } from "./utlis"

export function createFiber(vnode,returnFiber){
    const fiber = {
        //类型
        type:vnode.type,
        key:vnode.key,
        //属性
        props:vnode.props,
        //不同类型的组件，stateNode也不同
        //原生标签：dom节点；class组件：实例；函数组件：null
        stateNode:null,
        
        //第一个子fiber
        child:null,
        //下一个兄弟节点
        sibilng:null,
        //父fiber
        return:returnFiber,
        //flag保存增删改查标记
        flags:Placement,

        //记录节点子当前层级下的位置
        index:null,

        //记录节点在当前层级下的位置
        index:null,

        //old fiber
        alternate:null,

        //存hook链表的,存hook0
        memorizedState:null

    }

    const {type} = vnode

    if(isStr(type)){
        //原生标签
        fiber.tags = HostComponent
    }else if(isFn(type)){
        //类组件或函数组件
        // todo
        fiber.tags = type.prototype.isReactComponent ? ClassComponent: FunctionComponent
    }else if(isUndefined(type)){
        fiber.tags = HostText
        fiber.props = {children:vnode}
    }else{
        fiber.tags = Fragment
    }

    return fiber
}