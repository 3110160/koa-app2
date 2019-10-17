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
Test.prototype.say = function () {
  console.log(this.name);
};
let test = _new(Test, "tom");
console.log(test);

// call
// 将函数挂在传入的上下文中
// 执行后再删除该函数
Function.prototype.call2 = function (context, ...rest) {
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
Function.prototype.apply2 = function (context, arr) {
  context = context || window;
  context.fun = this;
  context.fun(...arr);
  delete context.fun;
};
// test
function fun2(c, d) {
  console.log(this.b + c + d);
}
let res = fun2.apply2({
    b: 1
  },
  ["2", "ee"]
);
console.log(res);

// bind
// 返回一个绑定上下文的函数
Function.prototype.bind2 = function (context, ...rest) {
  let fn = this;
  if (typeof fn !== "function") {
    throw new Error("not a function");
  }
  let resFn = function () {
    let args = [...rest, ...arguments];
    // this instanceof fBound === true时,说明返回的fBound被当做new的构造函数调用
    let ctx = this instanceof resFn ? this : context;
    return fn.apply(ctx, args);
  };
  // 维护fn的原型链
  let temf = function () {};
  temf.prototype = fn.prototype;
  resFn.prototype = new temf();
  return resFn;
};

// test
let fun3 = function () {
  console.log(this);
};
fun3.prototype.asy = function () {
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
Parent.prototype.say = function () {
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
  return function () {
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
const curry2 = (fn, ...rest) => (...args) => [...rest, ...args].length >= fn.length ?
  fn(...rest, ...args) :
  curry2(fn, ...rest, ...args);
// test
function cut(a, b, c) {
  console.log(a + b + c);
}
var curry_cut = curry(cut, 3);
curry_cut(1)(2, 3);


(function (window) {
  // pormise
  // pormise 三个状态
  const PENDING = Symbol.for("PENDING");
  const RESOLVE = Symbol.for("RESOLVE");
  const REJECT = Symbol.for("REJECT");

  function Promise1(excutor) {
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
        // 如果第一次传入的resolve值是一个promise 就要先把他 then 了再resolve
        if (value instanceof Promise1) {
          return value.then(resolve, reject)
        }
        // 执行 onFulfillCb 里面的回调函数
        setTimeout(function () {
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
        setTimeout(function () {
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

  Promise1.prototype.then = function (onFulFill, onReject) {
    let promise1;
    const {
      status,
      onFulfillCb,
      onRejectCb,
      value,
      reason
    } = this;
    const isFunction = fn => typeof fn === "function";
    onFulFill = isFunction(onFulFill) ? onFulFill : function () {};
    onReject = isFunction(onReject) ? onReject : function () {};
    return (promise1 = new Promise1(function (resolve, reject) {
      const resolvePromise = function (value) {
        try {
          const result = onFulFill(value);
          if (result instanceof Promise1) {
            if (promise1 === result) throw new Error("循环引用");
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
      const rejectPromise = function (reason) {
        try {
          const result = onReject(reason);
          if (result instanceof Promise1) {
            if (promise1 === result) throw new Error("循环引用");
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
          rejectPromise(reason);
          break;
        case RESOLVE:
          resolvePromise(value);
      }
    }));
  };

  // promise.resolve
  Promise1.resolve = function (value) {
    return new Promise1(function (resolve, reject) {
      resolve(value)
    })
  }

  // promise.reject
  Promise1.reject = function (reason) {
    return new Promise1(function (resolve, reject) {
      reject(reason)
    })
  }

  // promise.catch
  Promise1.prototype.catch = function (onRejectCb) {
    return this.then(undefined, onRejectCb)
  }

  // promise.race
  Promise1.race = function (promises = []) {
    return new Promise1(function (resolve, reject) {
      promises.forEach(function (p) {
        p.then(resolve, reject);
      })
    })
  }

  Promise1.all = function (promises = []) {
    return new Promise1(function (resolve, reject) {
      var result = [];
      var len = promises.length;
      promises.forEach(function (p, index) {
        p.then(function (val) {
          result[index] = val;
          if (result.length === len) {
            resolve(result)
          }
        }, reject)
      })
    })
  }
  window.Promise1 = Promise1;
})(window)

// test
var promise = function () {
  return new Promise1(function (resolve, reject) {
    setTimeout(function () {
      console.log('test');
      resolve(1)
    }, 1000)
  })
}
promise().then(res => {
  console.log(res)
  return 2;
}).then(res2 => {
  console.log(res2)
})

Promise1.reject('error').then(res => {
  console.log(res)
}).catch((e) => {
  console.log(e)
})

Promise1.resolve(promise()).then(res => {
  console.log(res)
}).catch((e) => {
  console.log(e)
})

var promise = function () {
  return new Promise1(function (resolve, reject) {
    setTimeout(function () {
      resolve(1)
    }, 1000)
  })
}
var promise2 = function () {
  return new Promise1(function (resolve, reject) {
    setTimeout(function () {
      resolve(2)
    }, 2000)
  })
}

Promise1.race([promise(), promise2()]).then(res => {
  console.log(res)
}).catch(e => {
  console.log(e)
})
Promise1.all([promise(), promise2()]).then(res => {
  console.log(res)
}).catch(e => {
  console.log(e)
})

// 节流函数 闭包加定时器
function throttle(fn, time) {
  var timer;
  return function () {
    var ctx = this;
    var args = arguments;
    if (timer) return;
    timer = setTimeout(function () {
      fn.apply(ctx, args);
      timer = null;
    }, time)
  }
}
// test
function consolelog(val) {
  console.log(val);
}
// 1秒执行一次
var consolelog_throttle = throttle(consolelog, 5000)
setInterval(function () {
  consolelog_throttle(2)
}, 500)

// 防抖函数 闭包加定时器
function debounce(fn, time, immediate) {
  var timer;
  return function () {
    var ctx = this;
    var args = arguments;
    // 首次执行
    if (immediate && !timer) {
      fn.apply(ctx, args)
      timer = setTimeout(function () {
        clearTimeout(timer);
      }, time)
    } else {
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args)
        clearTimeout(timer);
      }, time)
    }
  }
}
// test
var scroll = function () {
  console.log(1)
}
var scroll_debounce = debounce(scroll, 1000, false)
window.onscroll = scroll_debounce;

// 浅拷贝
function shallow(target) {
  if (typeof target === 'object') {
    var res = Array.isArray(target) ? [] : {}
    for (var key in target) {
      if (target.hasOwnProperty(key)) {
        res[key] = target[key]
      }
    }
    return res;
  } else return target;
}

// 深拷贝
function deepCopy(target) {
  if (typeof target === 'object') {
    var res = Array.isArray(target) ? [] : {}
    for (var key in target) {
      if (target.hasOwnProperty(key)) {
        // 递归
        res[key] = deepCopy(target[key])
      }
    }
    return res;
  } else return target;
}

// AOP 面向切面编程 实现 before前置通知
// 在执行某个函数时先去执行 before()

Function.prototype._before = function (fn) {
  // 此处this即调用before的函数
  var that = this;
  return function () {
    fn.apply(this, arguments)
    return that.apply(this, arguments)
  }
}

// test
function a(b) {
  return b;
}
var _a = a._before(function (v) {
  console.log(v,'before')
})
_a(2);

// after 后置通知
Function.prototype._after = function (fn) {
  var that = this;
  return function(){
    var res = that.apply(this,arguments)
    fn.apply(this,arguments)
    return res;
  }
}

// test
function a(b) {
  console.log('fn a')
  return b;
}
var _a = a._after(function (v) {
  console.log(v,'after')
})
_a(2);