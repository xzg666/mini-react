import { peek, pop, push } from "./minHeap"

let taskQueue = []//紧急任务
// let timerQueue = [] //延时任务
let taskIdCounter = 1

export function scheduleCallback(callback){
    const currentTime = getCurrentTime()

    const timeout = -1

    const expirtationTime = currentTime - timeout

    //创建新任务
    const newTask = {
        id : taskIdCounter++,
        callback,
        expirtationTime,
        sortIndex:expirtationTime
    }

    //任务加入最小堆
    push(taskQueue,newTask)

    //请求调度
    requestHostCallback()
}

function requestHostCallback(){
    port.postMessage(null)
}

const channel = new MessageChannel()

const port = channel.port2

channel.port1.onmessage = function(){
    workLoop()
}
//port1.onmessage会在port2.postMessage中执行（浏览器空闲的时候）

function workLoop(){
    let currentTask = peek(taskQueue)
    while(currentTask){
        const callback = currentTask.callback
        currentTask.callback = null
        callback && callback()
        pop(taskQueue)
        currentTask = peek(taskQueue)
    }
}

export function getCurrentTime(){
    return performance.now()
}