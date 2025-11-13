import {
  Events,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { renderProjectManager } from "../../utils/renderProjectManager.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "project_select") return;
    const selectedId = interaction.values[0];
    const { projectService, userService } = interaction.services;
    const user = await userService.getOneDiscordId(interaction.user.id);
    const projects = await projectService.listByUser(user.id);
    const { content, components } = renderProjectManager(projects, selectedId);
    await interaction.update({ content, components });
  },
};
