### mini-react
## mini react带你精通react
初次渲染和更新：createRoot=>scheduleUpdateOnFiber=>
scheduleCallback=>performUnitOfWork=>不同组件类型update
=>reconcileChildren(diff)=>commitRoot=>commitWorker

useState和useReducer的dispatch都会生成新的fiber，调用scheduleUpdateOnFiber（fiber）

useEffect都是将hook放到fiber上
在performUnitOfWork将依赖和更新函数加到fiber上，在适当时机进行调用