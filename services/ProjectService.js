export default class ProjectService {
  constructor(db) {
    this.client = db.sequelize;
  }
}
