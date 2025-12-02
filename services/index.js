import { adminDb } from "../models/index.js";
import UserService from "./UserService.js";
import DashboardService from "./DashboardService.js";
import SessionService from "./SessionService.js";
import ProjectService from "./ProjectService.js";
import LinkService from "./LinkService.js";

export function createServices(db) {
  return {
    userService: new UserService(db),
    dashboardService: new DashboardService(db),
    sessionService: new SessionService(db),
    projectService: new ProjectService(db),
    linkService: new LinkService(db),
  };
}

const services = createServices(adminDb);

export default services;
