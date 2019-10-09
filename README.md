## sequelize-cli 体验
Sequelize-cli 完成 dev，test，prod 环境的配置，以及数据库创建

> https://juejin.im/post/5c78e298518825408f706be9

```js
// 初始化sequelize文件目录
"init": "node_modules/.bin/sequelize init", 
// 新建表
"create": "node_modules/.bin/sequelize db:create", 
// 通过配置 Migration 文件可以将现有数据库迁移至另一个状态，并且保存记录，每次执行都会生成一个表的记录
"migration": "node_modules/.bin/sequelize migration:create --name create-examples-table", 
// 会将 migrations 目录下的迁移行为定义，按时间戳的顺序，逐个地执行迁移描述，最终完成数据库表结构的自动化创建。会发现数据库examples_dev内创建了一张 SequelizeMeta 的表以及 对应 的表：
"migrate": "node_modules/.bin/sequelize db:migrate"
// 撤销相应的迁移
"migrate:undo": "node_modules/.bin/sequelize db:migrate:undo"
// 初始化表
"seed": "node_modules/.bin/sequelize db:seed:all", 

## awilix 依赖注入

> https://www.jianshu.com/p/ebcc9e0150ea

