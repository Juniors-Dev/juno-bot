export default class ProjectService {
  constructor(db) {
    this.client = db.sequelize;
    this.Project = db.Project;
    this.User = db.User;
    this.ProjectMember = db.ProjectMember;
    this.Link = db.Link;
  }

  // CREATE PROJECT
  async create({ name, description, status = "active", ownerId }) {
    const project = await this.Project.create({ name, description, status });

    // auto-assign creator as admin
    await this.ProjectMember.create({
      projectId: project.id,
      userId: ownerId,
      isAdmin: true,
      canAddLinks: true,
    });

    return this.getById(project.id);
  }

  // READ
  async getById(id) {
    return this.Project.findByPk(id, {
      include: [
        { model: this.ProjectMember, as: "projectMembers" },
        { model: this.Link, as: "links" },
      ],
    });
  }

  async listActive() {
    return this.Project.findAll({
      where: { status: "active" },
      include: [{ model: this.ProjectMember, as: "projectMembers" }],
      order: [["updatedAt", "DESC"]],
    });
  }

  async listByUser(userId) {
    return this.Project.findAll({
      include: [
        {
          model: this.ProjectMember,
          as: "projectMembers",
          where: { userId },
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
  }

  // UPDATE
  async update({ id, userId, args }) {
    const project = await this.Project.findOne({
      where: { id },
      include: [{ model: this.ProjectMember, as: "projectMembers" }],
    });
    if (!project) throw new Error("Project not found.");

    const member = project.projectMembers.find((m) => m.userId === userId);
    if (!member) throw new Error("You are not a member of this project.");
    if (!member.isAdmin && !member.permissions?.canEdit)
      throw new Error("You don't have permission to edit this project.");

    await this.Project.update(args, { where: { id } });
    return this.getById(id);
  }

  // DELETE (soft delete / archive)
  async archive({ id, userId }) {
    const project = await this.Project.findOne({
      where: { id },
      include: [{ model: this.ProjectMember, as: "projectMembers" }],
    });
    if (!project) throw new Error("Project not found.");

    const member = project.projectMembers.find((m) => m.userId === userId);
    if (!member?.isAdmin) throw new Error("You don't have permission to archive this project.");

    await this.Project.update({ status: "archived" }, { where: { id } });
    return this.getById(id);
  }

  async restore({ id, userId }) {
    const project = await this.Project.findOne({
      where: { id },
      include: [{ model: this.ProjectMember, as: "projectMembers" }],
    });
    if (!project) throw new Error("Project not found.");

    const member = project.projectMembers.find((m) => m.userId === userId);
    if (!member?.isAdmin) throw new Error("You don't have permission to restore this project.");

    await this.Project.update({ status: "active" }, { where: { id } });
    return this.getById(id);
  }

  // PROJECT MEMBERS
  async addMember({ projectId, userId, addedBy }) {
    const project = await this.Project.findOne({
      where: { id: projectId },
      include: [{ model: this.ProjectMember, as: "projectMembers" }],
    });
    if (!project) throw new Error("Project not found.");

    const member = project.projectMembers.find((m) => m.userId === addedBy);
    if (!member?.isAdmin) throw new Error("You don't have permission to add members.");

    const existing = project.projectMembers.find((m) => m.userId === userId);
    if (existing) throw new Error("User is already a member.");

    await this.ProjectMember.create({
      projectId,
      userId,
      isAdmin: false,
      canAddLinks: false,
    });

    return this.getById(projectId);
  }

  async removeMember({ projectId, userId, removedBy }) {
    const project = await this.Project.findOne({
      where: { id: projectId },
      include: [{ model: this.ProjectMember, as: "projectMembers" }],
    });
    if (!project) throw new Error("Project not found.");

    const member = project.projectMembers.find((m) => m.userId === removedBy);
    if (!member?.isAdmin) throw new Error("You don't have permission to remove members.");

    await this.ProjectMember.destroy({ where: { projectId, userId } });
    return this.getById(projectId);
  }

  async setPermissions({ projectId, targetId, editorId, perms }) {
    const project = await this.Project.findOne({
      where: { id: projectId },
      include: [{ model: this.ProjectMember, as: "projectMembers" }],
    });
    if (!project) throw new Error("Project not found.");

    const editor = project.projectMembers.find((m) => m.userId === editorId);
    if (!editor?.isAdmin) throw new Error("You don't have permission to edit member roles.");

    const target = project.projectMembers.find((m) => m.userId === targetId);
    if (!target) throw new Error("User not found in project.");

    await this.ProjectMember.update(perms, {
      where: { projectId, userId: targetId },
    });

    return this.getById(projectId);
  }

  // LINKS
  async addLink({ projectId, userId, kind, url, description }) {
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

  async removeLink({ projectId, userId, linkId }) {
    const project = await this.Project.findOne({
      where: { id: projectId },
      include: [{ model: this.ProjectMember, as: "projectMembers" }],
    });
    if (!project) throw new Error("Project not found.");

    const member = project.projectMembers.find((m) => m.userId === userId);
    if (!member?.isAdmin) throw new Error("You don’t have permission to remove links.");

    await this.Link.destroy({ where: { id: linkId, projectId } });
    return this.getById(projectId);
  }
}
