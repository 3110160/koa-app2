const Koa = require("koa");
import { createContainer,Lifetime } from "awilix";
const { loadControllers, scopePerRequest } = require("awilix-koa");

const app = new Koa();
// // 注册容器
const container = createContainer();
// 把所有的service注册容器
// 每一个controller把需要的service注册进去
container.loadModules([__dirname + "/services/*.js"], {
  // BookService -> bookservice
  formatName: "camelCase",
  registerOptions: {
      lifetime: Lifetime.SCOPED
  }
})
app.use(scopePerRequest(container));
app.use(loadControllers(__dirname+'/controllers/*.js'))

app.listen(3000);
module.exports = app;