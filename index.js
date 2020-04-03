//index.js是对原生promise的演示
//promise是自定义的promise
//test.js对promise.js的测试
console.log(1)
new Promise((resolve, reject)=>{
  console.log('2');
  resolve(1)
  
}).then(value=>{
  console.log(3)
  return new Promise((resolve, reject)=>{
    resolve(1)
  })
}, reason=>{
  console.log('reject callback')
}).then(value=>{
  console.log('sadasd', value)
})

console.log(4)