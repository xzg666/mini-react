import { createFiber } from "./ReactFiber"
import {scheduleUpdateOnFiber} from './ReactFiberWorkLoop'

function ReactDOMRoot(internalRoot){
    this._internalRoot = internalRoot
}

ReactDOMRoot.prototype.render = function(children){
    // console.log('children',children)
    const root = this._internalRoot
    updateContainer(children,root)
}

function updateContainer(element,container){
    const {containerInfo} = container
    //createFiber第一个参数是渲染的vnode，第二个参数是父亲fiber，这里根据container手动实现一个
    const fiber = createFiber(element,{
        type:container.nodeName?.toLocaleLowerCase(),
        stateNode:containerInfo
    })
    console.log('第一次fiber',fiber,element,container)
    //组件初次渲染和更新
    scheduleUpdateOnFiber(fiber)
}

//ReactDOM.createRoot(document.getElementById("root")).render(jsx);
function createRoot(container){
    const root = {containerInfo:container}

    return new ReactDOMRoot(root)
}

export default  {createRoot}