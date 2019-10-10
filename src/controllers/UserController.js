const { route, GET } = require("awilix-koa");
@route("/user")
class UserController {
  constructor({ userService }) {
    this.userService = userService;
  }
  @route("/search")
  @GET()
  async actionSearch(ctx, next) {
    const res = await this.userService.search();
    ctx.body = res;
    await next();
  }
}
module.exports = UserController;
