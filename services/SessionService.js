export default class SessionService {
  constructor(db) {
    this.client = db.sequelize;
  }
}
