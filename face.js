// new 操作符
function _new(fun,...rest){
  let obj = {};
  obj.__proto__ = fun.prototype;
  let res = fun.apply(obj,rest)
  if(res&&(typeof res === 'object'||typeof res === 'function')){
    return res;
  }
  return obj;
}

// test
function Test(name){
  this.name = name;
}
Test.prototype.say = function(){
  console.log(this.name);
}
let test = _new(Test,'tom')
console.log(test)


// call 
// 将函数挂在传入的上下文中
// 执行后再删除该函数
Function.prototype.call2 = function(context,...rest){
  context = context || window;
  // fun1.call2(),此时 this = fun1;
  context.fun = this;
  context.fun(...rest);
  delete context.fun;
}

// test
window.a = 2;
function fun1(){
  console.log(this.a)
}
let res = fun1.call2({a:3});
console.log(res);

// apply
// 入参和 call 有区别
Function.prototype.apply2 = function(context,arr){
  context = context || window;
  context.fun = this;
  context.fun(...arr);
  delete context.fun;
}
// test
function fun2(c,d){
  console.log(this.b+c+d)
}
let res = fun2.apply2({b:1},['2','ee']);
console.log(res);

// bind 
// 返回一个绑定上下文的函数
Function.prototype.bind2 = function(context,...rest){
  let fn = this;
  if(typeof fn !== 'function'){
    throw new Error('not a function')
  }
  let resFn = function(){
    let args = [...rest,...arguments,]
    // this instanceof fBound === true时,说明返回的fBound被当做new的构造函数调用
    let ctx = this instanceof resFn?this:context;
    return fn.apply(ctx,args)
  }
  // 维护fn的原型链
  let temf = function(){};
  temf.prototype = fn.prototype;
  resFn.prototype = new temf();
  return resFn;
}

// test
let fun3 = function(){
  console.log(this);
}
fun3.prototype.asy = function(){
  console.log('bind')
}
// 正常调用
let funbind = fun3.bind2({a:2})
// 使用new 调用
let newbid = new funbind();
console.log(newbid)