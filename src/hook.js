import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop"

let currentlyRenderingFiber = null //当前渲染的fiber
let workInProgressHook = null //当前正在工作的hook


//这个函数在更新组件ReactFiberReconciler/updateHostComponent中被调用
export function renderwithHook(wip){
    //要从外面拿到fiber节点
    currentlyRenderingFiber = wip

    currentlyRenderingFiber.memorizedState = null
    workInProgressHook = null
}

//把当前的hook加到fiber上，并且更新当前正在更新的hook。区别是更新还是首次渲染
//hook是以链表的形式存在fiber.memorizedState上
function updateWorkInProgressHook(){
    let hook

    //current是老fibeer  workInProgressHook是新hook
    const current = currentlyRenderingFiber.alternate

    if(current){
        //有老fiber，组件更新
        currentlyRenderingFiber.memorizedState = current.memorizedState
        if(workInProgressHook){
            //连在当前hook后面
            workInProgressHook = hook = workInProgressHook.next
        }else{
            //hook0
            workInProgressHook = hook = currentlyRenderingFiber.memorizedState
        }

    }else{
        //组件初次渲染
        hook = {
            memorizedState: null, // state
            next: null // 下一个hook
        }
        if(workInProgressHook){
            //此时有hook了，加在后面
            workInProgressHook = workInProgressHook.next = hook
        }else{
            //此时没有hook，添加hook0  
            workInProgressHook = currentlyRenderingFiber.memorizedState = hook
        }
    }
    
    return hook
}

export function useReducer(reducer,initState){

    //存hook到fiber上
    const hook = updateWorkInProgressHook()

    //没有老节点
    if(!currentlyRenderingFiber.alternate){
        //初次渲染
        hook.memorizedState = initState
    }

    // const dispatch = () => {
    //     hook.memorizedState = reducer(hook.memorizedState)
    //     currentlyRenderingFiber.alternate = {...currentlyRenderingFiber}
    //     scheduleUpdateOnFiber(currentlyRenderingFiber)//更新fiber
    //     console.log('log');
    // }

    //增强版的dispatch
    const dispatch = dispatchReducerAction.bind(
        null,
        currentlyRenderingFiber,
        hook,
        reducer
    )

        return [hook.memorizedState,dispatch]
}

//action是 onClick={()=>setCount2(count2+1)} setCount2（count2+1）的参数
function dispatchReducerAction(fiber,hook,reducer,action){
    console.log('action',action)
    hook.memorizedState = reducer ? reducer(hook.memorizedState) : action
    fiber.alternate = {...fiber}
    //因为提交的时候不仅仅提交了自己，也递归提交了兄弟，兄弟（类组件）不需要提交，因此设置为null
    fiber.sibling = null
    scheduleUpdateOnFiber(fiber)//更新fiber
}

export function useState(initState){
    return useReducer(null,initState)
}