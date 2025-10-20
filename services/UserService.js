export default class UserService {
  constructor(db) {
    this.client = db.sequelize;
    this.User = db.User;
  }

  async getAll() {
    return this.User.findAll();
  }

  async getOneDiscordId(discordId) {
    return await this.User.findOne({
      where: { discordId },
    });
  }

  async getOneId(id) {
    return await this.User.findOne({
      where: { id },
    });
  }

  async create({ discordId, githubUsername, name }) {
    return await this.User.create({ discordId, githubUsername, name });
  }

  async updateById(id, args) {
    return await this.User.update({ ...args }, { where: { id } });
  }

  async updateByDiscordId(discordId, args) {
    return await this.User.update({ ...args }, { where: { discordId } });
  }
}
