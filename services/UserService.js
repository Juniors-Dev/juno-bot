import { TtlCache } from "../utils/TtlCache.js";

export default class UserService {
  constructor(db) {
    this.User = db.User;

    this.cacheById = new TtlCache({
      ttlMs: 15 * 60 * 1000,
      cloneOnGet: true,
    });

    this.cacheByDiscordId = new TtlCache({
      ttlMs: 15 * 60 * 1000,
      cloneOnGet: true,
    });
  }

  _toPlain(model) {
    return model ? model.get({ plain: true }) : null;
  }

  async getOneId(id) {
    return this.cacheById.getOrSet(id, async () => {
      const user = await this.User.findOne({ where: { id } });
      return this._toPlain(user);
    });
  }

  async getOneDiscordId(discordId) {
    return this.cacheByDiscordId.getOrSet(discordId, async () => {
      const user = await this.User.findOne({ where: { discordId } });
      return this._toPlain(user);
    });
  }

  async create(data) {
    const created = await this.User.create(data);
    const user = this._toPlain(created);

    this.cacheById.set(user.id, user);
    this.cacheByDiscordId.set(user.discordId, user);

    return user;
  }

  async updateById(id, args) {
    const [affected] = await this.User.update(args, { where: { id } });
    if (!affected) return null;

    const updated = await this.User.findOne({ where: { id } });
    const user = this._toPlain(updated);
    if (!user) return null;

    this.cacheById.set(user.id, user);
    this.cacheByDiscordId.set(user.discordId, user);

    return user;
  }

  async updateByDiscordId(discordId, args) {
    const [affected] = await this.User.update(args, { where: { discordId } });
    if (!affected) return null;

    const updated = await this.User.findOne({ where: { discordId } });
    const user = this._toPlain(updated);
    if (!user) return null;

    this.cacheByDiscordId.set(user.discordId, user);
    this.cacheById.set(user.id, user);

    return user;
  }
}

// export default class UserService {
//   constructor(db) {
//     this.client = db.sequelize;
//     this.User = db.User;
//   }

//   async getAll() {
//     return this.User.findAll();
//   }

//   async getOneDiscordId(discordId) {
//     return await this.User.findOne({
//       where: { discordId },
//     });
//   }

//   async getOneId(id) {
//     return await this.User.findOne({
//       where: { id },
//     });
//   }

//   async create({ discordId, githubUsername, name }) {
//     return await this.User.create({ discordId, githubUsername, name });
//   }

//   async updateById(id, args) {
//     return await this.User.update({ ...args }, { where: { id } });
//   }

//   async updateByDiscordId(discordId, args) {
//     return await this.User.update({ ...args }, { where: { discordId } });
//   }
// }
