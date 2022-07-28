//返回最小堆顶元素
export function peek(heap){
    return heap.length === 0 ? null : heap[0]
}

//往最小堆中插入元素
//1.把node插到数组尾部
//2.往上调整最小堆
export function push(heap,node){
    let index = heap.length
    heap.push(node)
    shiftUp(heap,node,index)
}

function shiftUp(heap,node,i){
    let index = i
    while(index > 0){
        const parentIndex = (index - 1) >> 1
        const parent = heap[parentIndex]
        if(compare(parent,node) > 0){
            //parent > node 不符合最小堆
            heap[parentIndex] = node
            heap[index] = parent
            index = parentIndex
        }else{
            return
        }
    }
}

function compare(a,b){
    // Compare sort index first, then task id.
    const diff = a.sortIndex - b.sortIndex
    return diff !== 0 ? diff : a.id - b.id
}

//删除堆顶元素
//1.最后一个元素覆盖堆顶
//2.向下调整
export function pop(heap){
    if(heap.length === 0){
        return null
    }
    const first = heap[0]
    const last = heap.pop()

    if(first !== last){
        heap[0] = last
        shifDown(heap,last,0)
    }
    return first
}

function shifDown(heap,node,i){
    let index = i
    const len = heap.length
    const halflen = len >> 1
    while(index < halflen){
        const leftIndex = (index+1)*2 - 1
        const rightIndex = leftIndex + 1
        const left = heap[leftIndex]
        const right = heap[rightIndex]

        if(compare(left,node) < 0){
            //left < node
            //? left,right
            if(rightIndex < len && compare(right,left) < 0){
                //right最小,交换right和parent
                heap[index] = right
                heap[rightIndex] = node
                index = rightIndex
            }else{
                //没有right或者left<index
                //交换left 和node
                heap[index] = left
                heap[leftIndex] = node
                index = leftIndex

            }
        }else if(rightIndex < len && compare(right,node) < 0){
            heap[index] = right
            heap[rightIndex] = node
            index = rightIndex
        }else{
            //parent最小
            return
        }
    }
}




//test
// const a = [3,7,4,10,12,9,6,15,14]
// while(1){
//     if(a.length === 0){
//         break
//     }
//     console.log('a',peek(a))
//     pop(a)
// }



