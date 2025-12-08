import {
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
} from "discord.js";
import { buildTaskDashboard } from "../../events/interaction/features/tasks/task-dashboard-ui.js";
import { FILTER_STATUS_MAP } from "../../events/interaction/features/tasks/task-dashboard-state.js";

export default {
  data: new SlashCommandBuilder()
    .setName("my-tasks")
    .setDescription("View and manage your tasks")
    .addStringOption((option) =>
      option
        .setName("filter")
        .setDescription("Filter tasks by status")
        .setRequired(false)
        .addChoices(
          { name: "Active (Todo + In Progress)", value: "active" },
          { name: "Todo only", value: "todo" },
          { name: "In Progress only", value: "in_progress" },
          { name: "Done", value: "done" },
          { name: "All Tasks", value: "all" },
        ),
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const { taskService } = interaction.services;
      const { user } = interaction.botContext;

      const filter = interaction.options.getString("filter") || "active";
      const status = FILTER_STATUS_MAP[filter] ?? FILTER_STATUS_MAP.active;

      const tasks = await taskService.getByUser(user.id, {
        status,
        includeProject: true,
      });

      const payload = buildTaskDashboard(tasks, { filter });

      await interaction.editReply(payload);
    } catch (err) {
      console.error("[my-tasks] Error:", err);

      const errorContainer = new ContainerBuilder()
        .setAccentColor(0xe74c3c)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("Something went wrong loading your tasks."),
        );

      await interaction.editReply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  },
};
