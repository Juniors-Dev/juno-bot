export default class LinkService {
  constructor(db) {
    this.client = db.sequelize;
    this.Project = db.Project;
    this.User = db.User;
    this.ProjectMember = db.ProjectMember;
    this.Link = db.Link;
  }

  async create({ projectId, userId, kind, url, description }) {
    const project = await this.Project.findOne({
      where: { id: projectId },
      include: [{ model: this.ProjectMember, as: "projectMembers" }],
    });
    if (!project) throw new Error("Project not found.");

    const member = project.projectMembers.find((m) => m.userId === userId);
    if (!member) throw new Error("You’re not part of this project.");
    if (!member.isAdmin && !member.canAddLinks)
      throw new Error("You don’t have permission to add links.");

    return this.Link.create({ projectId, kind, url, description });
  }

  async listByProject(projectId) {
    return this.Link.findAll({
      where: { projectId },
    });
  }

  async update({ projectId, userId, linkId, args }) {
    const project = await this.Project.findOne({
      where: { id: projectId },
      include: [{ model: this.ProjectMember, as: "projectMembers" }],
    });
    if (!project) throw new Error("Project not found.");
    const member = project.projectMembers.find((m) => m.userId === userId);
    if (!member) throw new Error("You’re not part of this project.");

    if (!member.isAdmin && !member.canAddLinks) {
      throw new Error("You don’t have permission to edit links.");
    }

    const link = await this.Link.findOne({ where: { id: linkId, projectId } });
    if (!link) throw new Error("Link not found in this project.");

    const allowedFields = ["kind", "url", "description"];
    const updateData = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(args, key)) {
        updateData[key] = args[key];
      }
    }

    await this.Link.update(updateData, { where: { id: linkId } });

    return this.listByProject(projectId);
  }

  async delete({ projectId, userId, linkId }) {
    const project = await this.Project.findOne({
      where: { id: projectId },
      include: [{ model: this.ProjectMember, as: "projectMembers" }],
    });
    if (!project) throw new Error("Project not found.");

    const member = project.projectMembers.find((m) => m.userId === userId);
    if (!member?.isAdmin) throw new Error("You don’t have permission to remove links.");

    const link = await this.Link.findOne({ where: { id: linkId, projectId } });
    if (!link) throw new Error("Link not found in this project.");

    await this.Link.destroy({ where: { id: linkId, projectId } });
    return this.getById(projectId);
  }
}
