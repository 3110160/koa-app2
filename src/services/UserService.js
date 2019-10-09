const { user } = require("../../models");

class UserService {
  async search() {
    return user.findAll({
      where: {
        name: "John Doe"
      }
    });
  }
}

module.exports = UserService;
