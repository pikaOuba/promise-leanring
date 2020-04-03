class Promise {
  constructor(executor) {
    //不能相信用户的输入做校验
    if(typeof executor !== 'function') {
      throw new TypeError(`Promise resolver ${executor} is not a function`)
    }
    this.initValue()
    this.initBind()
    try {
      executor(this.resolve, this.reject)
    } catch(e){
      this.reject(e=>e)
    }
   
  }

  initValue() {
    this.value = null //终值
    this.reason = null //拒因
    this.state = Promise.PENDING//状态
    this.onFulfilledCallbacks = []//
    this.onFulrejectCallbacks = []
  }

  initBind() {
    this.resolve = this.resolve.bind(this)
    this.reject = this.reject.bind(this)
  }

  resolve(value) {
    //成功后的一系列操作(状态改变，成功后的执行)
    if(this.state === Promise.PENDING){
      this.state = Promise.FULFILLED
      this.value = value
      this.onFulfilledCallbacks.forEach(fn=>fn(this.value))
    }
  }

  reject(reason) {
     //失败后的一系列操作(状态改变，失败后的执行)
     if(this.state === Promise.PENDING) {
      this.state = Promise.REJECTED
      this.reason = reason
      this.onFulrejectCallbacks.forEach(fn=>fn(this.reason))
    }
  }

  then(onFulfilled, onFulreject) {
    //实现链式调用，且后面改了then的值，必须通过新的实例
    
    if(typeof onFulfilled !== 'function') {
      onFulfilled = (value)=>{
        return value
      }
    }

    if(typeof onFulreject !== 'function') {
      onFulreject = (reason)=>{
        throw reason
      }
    }

    let promise2 = new Promise((resolve, reject) => {
      if(this.state === Promise.FULFILLED) {
        setTimeout(()=>{
          try {
            const x = onFulfilled(this.value)
            Promise.resolvePromise(promise2, x, resolve, reject)
          }catch(e){
            reject(e)
          }
        })
      }

      if(this.state === Promise.REJECTED) {
        setTimeout(()=>{
          try {
            const x = onFulreject(this.reason)
            Promise.resolvePromise(promise2, x, resolve, reject)
          }catch(e){
            reject(e)
          }
        })
      }
  
      if(this.state === Promise.PENDING) {
        this.onFulfilledCallbacks.push(value=>{
          setTimeout(()=>{
            try {
              const x = onFulfilled(value)
              Promise.resolvePromise(promise2, x, resolve, reject)
            }catch(e){
              reject(e)
            }
          })
          
        })
  
        this.onFulrejectCallbacks.push(reason=>{
          setTimeout(()=>{
            try {
              const x = onFulreject(reason)
              Promise.resolvePromise(promise2, x, resolve, reject)
            }catch(e){
              reject(e)
            }
          })
        })
      }
    })

    return promise2
  }
}

Promise.PENDING = 'pending'
Promise.FULFILLED = 'fulfilled'
Promise.REJECTED = 'rejected'
Promise.resolvePromise = function(promise2, x, resolve, reject) {
  if(promise2 === x){
    reject(new TypeError('chaining cycle detected for promise'))
  }

  let called = false//采用首次调用忽略其他的
  const then = x.then
  if(x instanceof Promise){
    then.call(
      x,
      value =>{
      if(called) return
      called = true
      Promise.resolvePromise(promise2, value, resolve, reject)
    }, reason => {
      if(called) return
      called = true
      reject(reason)
    })
  } else if(x !== null && (typeof x === 'function' || typeof x === 'object')){//对象
    try{
      if(typeof then === 'function') {
        then.call(
          x,
          value=>{
          if(called) return
          called = true
          Promise.resolvePromise(promise2, value, resolve, reject)
        }, reason=> {
          if(called) return
          called = true
          reject(reason)
        })
      } else{
        if(called) return
        called = true
        Promise.resolvePromise(promise2, value, resolve, reject)
      }
    }catch(e){
      if(called) return
      called = true
      reject(e)
    }
    
  } else {
    // if(called) return
    // called = true
    return resolve(x)
  }
}


Promise.defer = Promise.deferred = function(){
  let dfd = {}
  dfd.promise = new Promise((resolve, reject)=>{
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}


module.exports = Promise