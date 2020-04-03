const  Promise = require('./promise')

console.log('----', 1)
new Promise((resolve, reject)=>{
  resolve(1)
}).then(value=>{
  return new Promise(resolve => {
    resolve(1)
  })
}).then(value=>{
  console.log('value=====', value)
},reason=>{
  console.log('reason', value)
})


console.log(4)