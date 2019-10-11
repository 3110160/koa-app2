// new 操作符
function _new(fun, ...rest) {
  let obj = {};
  obj.__proto__ = fun.prototype;
  let res = fun.apply(obj, rest);
  if (res && (typeof res === "object" || typeof res === "function")) {
    return res;
  }
  return obj;
}

// test
function Test(name) {
  this.name = name;
}
Test.prototype.say = function() {
  console.log(this.name);
};
let test = _new(Test, "tom");
console.log(test);

// call
// 将函数挂在传入的上下文中
// 执行后再删除该函数
Function.prototype.call2 = function(context, ...rest) {
  context = context || window;
  // fun1.call2(),此时 this = fun1;
  context.fun = this;
  context.fun(...rest);
  delete context.fun;
};

// test
window.a = 2;

function fun1() {
  console.log(this.a);
}
let res = fun1.call2({
  a: 3
});
console.log(res);

// apply
// 入参和 call 有区别
Function.prototype.apply2 = function(context, arr) {
  context = context || window;
  context.fun = this;
  context.fun(...arr);
  delete context.fun;
};
// test
function fun2(c, d) {
  console.log(this.b + c + d);
}
let res = fun2.apply2(
  {
    b: 1
  },
  ["2", "ee"]
);
console.log(res);

// bind
// 返回一个绑定上下文的函数
Function.prototype.bind2 = function(context, ...rest) {
  let fn = this;
  if (typeof fn !== "function") {
    throw new Error("not a function");
  }
  let resFn = function() {
    let args = [...rest, ...arguments];
    // this instanceof fBound === true时,说明返回的fBound被当做new的构造函数调用
    let ctx = this instanceof resFn ? this : context;
    return fn.apply(ctx, args);
  };
  // 维护fn的原型链
  let temf = function() {};
  temf.prototype = fn.prototype;
  resFn.prototype = new temf();
  return resFn;
};

// test
let fun3 = function() {
  console.log(this);
};
fun3.prototype.asy = function() {
  console.log("bind");
};
// 正常调用
let funbind = fun3.bind2({
  a: 2
});
// 使用new 调用
let newbind = new funbind();
console.log(newbind);

// 构造函数实现
function Parent(a) {
  this.a = a;
}
Parent.prototype.say = function() {
  console.log(this.a);
};

Son.prototype = Object.create(Parent.prototype);
Son.prototype.constructor = Son;

function Son(b, c) {
  Parent.call(this, c);
  this.b = b;
}

// test
var son = new Son(1, 2);
console.log(son.a, son.b);
son.say();

// es6 实现
class Parent2 {
  constructor(a) {
    this.a = a;
  }
  say() {
    console.log(this.a);
  }
}
class Son2 extends Parent2 {
  constructor(b, c) {
    super(c);
    this.b = b;
  }
  tell() {
    console.log(this.b);
  }
}

// test
var son2 = new Son2(1, 2);
console.log(son2.a, son2.b);
son2.say();

// 函数科里化 将一个接受多个参数的函数分成接受多次个别参数的函数当函
// 缓存参数，惰性求值
function curry(fn) {
  let arglen = fn.length;
  let args = Array.prototype.slice.call(arguments, 1);
  return function ssd() {
    args = args.concat(Array.prototype.slice.call(arguments));
    if (args.length >= arglen) {
      return fn.apply(this, args);
    } else return ssd;
  };
}

function curry1(fn) {
  // 获取除fn外的多余参数
  var args = Array.prototype.slice.call(arguments, 1) || [];
  return function() {
    var curArgus = args.concat(Array.prototype.slice.call(arguments));
    // 如果fn所需要的参数已经全部被搜集全了就调用fn
    if (curArgus.length >= fn.length) {
      return fn.apply(this, curArgus);
    } else {
      curArgus.unshift(fn);
      // 继续收集
      return curry1.apply(this, curArgus);
    }
  };
}
// es6 写法
const curry2 = (fn, ...rest) => (...args) =>
  [...rest, ...args].length >= fn.length
    ? fn(...rest, ...args)
    : curry2(fn, ...rest, ...args);
// test
function cut(a, b, c) {
  console.log(a + b + c);
}
var curry_cut = curry(cut, 3);
curry_cut(1)(2, 3);

// pormise
// pormise 三个状态
const PENDING = "PENDING";
const RESOLVE = "RESOLVE";
const REJECT = "REJECT";

function Pormise1(excutor) {
  const that = this;
  // promise 的 当前 状态
  this.status = PENDING;
  // promise 的 resolve 值
  this.value = "";
  // promise 的 reject 错误
  this.reason = "";
  // then 回调函数列表
  this.onFulfillCb = [];
  this.onRejectCb = [];

  function resolve(value) {
    if (that.status === PENDING) {
      // 执行 onFulfillCb 里面的回调函数
      setTimeout(function() {
        that.status = RESOLVE;
        that.value = value;
        that.onFulfillCb.forEach(cb => {
          cb(value);
        });
      }, 0);
    }
  }

  function reject(reason) {
    if (that.status === PENDING) {
      // 执行 onFulfillCb 里面的回调函数
      setTimeout(function() {
        that.status = REJECT;
        that.reason = reason;
        that.onRejectCb.forEach(cb => {
          cb(reason);
        });
      }, 0);
    }
  }
  // 执行 excutor
  try {
    excutor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

Pormise1.prototype.then = function(onFulFill, onReject) {
  const { status, onFulfillCb, onRejectCb, value } = this;
  const isFunction = fn => typeof fn === "function";
  onFulFill = isFunction(onFulFill) ? onFulFill : function() {};
  onReject = isFunction(onReject) ? onReject : function() {};
  return (pormise1 = new Pormise1(function(resolve, reject) {
    const resolvePromise = function(value) {
      try {
        const result = onFulFill(value);
        if (result instanceof Pormise1) {
          if (pormise1 === result) throw new Error("循环引用");
          // 如果 result是个promises 实例,就等其then后把值给resolve了
          result.then(resolve, reject);
        } else {
          // 为下一个.then 所有的值
          resolve(result);
        }
      } catch (e) {
        reject(e);
      }
    };
    const rejectPromise = function(reason) {
      try {
        const result = onReject(reason);
        if (result instanceof Pormise1) {
          if (pormise1 === result) throw new Error("循环引用");
          result.then(resolve, reject);
        } else {
          // 为下一个.then 所有的值
          reject(reason);
        }
      } catch (e) {
        reject(e);
      }
    };
    switch (status) {
      case PENDING:
        onFulfillCb.push(resolvePromise);
        onRejectCb.push(rejectPromise);
        break;
      case REJECT:
        rejectPromise(value);
        break;
      case RESOLVE:
        resolvePromise(value);
    }
  }));
};
