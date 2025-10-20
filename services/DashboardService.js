export default class DashboardService {
  constructor(db) {
    this.client = db.sequelize;
  }
}
