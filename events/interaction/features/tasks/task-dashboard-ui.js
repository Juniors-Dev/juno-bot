import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ContainerBuilder,
  SeparatorSpacingSize,
} from "discord.js";

const STATUS_CONFIG = {
  in_progress: { emoji: "🔵", label: "In Progress", order: 1 },
  todo: { emoji: "🟡", label: "Todo", order: 2 },
  done: { emoji: "✅", label: "Done", order: 3 },
  archived: { emoji: "📦", label: "Archived", order: 4 },
};

const FILTER_OPTIONS = [
  { label: "Active (Todo + In Progress)", value: "active", emoji: "📋", default: true },
  { label: "Todo only", value: "todo", emoji: "🟡" },
  { label: "In Progress only", value: "in_progress", emoji: "🔵" },
  { label: "Done", value: "done", emoji: "✅" },
  { label: "All Tasks", value: "all", emoji: "📁" },
];

/**
 * Build the task dashboard UI (Components v2)
 * @param {Array} tasks - User's tasks
 * @param {Object} options
 * @param {string} options.filter - Current filter value
 * @param {string|null} options.selectedTaskId - Currently selected task
 * @param {string|null} options.notification - Optional notification message to show
 */
export function buildTaskDashboard(
  tasks = [],
  { filter = "active", selectedTaskId = null, notification = null } = {},
) {
  const components = [];

  if (notification) {
    components.unshift(buildNotificationComponent(notification));
  }

  const container = new ContainerBuilder().setAccentColor(0x5865f2);

  container.addSectionComponents((section) =>
    section
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(`## 📋 Your Tasks (${tasks.length})`),
      )
      .setButtonAccessory((button) =>
        button.setCustomId("tasks:new").setLabel("New Task").setStyle(ButtonStyle.Primary),
      ),
  );

  container.addSeparatorComponents((separator) =>
    separator.setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  const grouped = groupTasksByStatus(tasks);

  const statusesToShow =
    filter === "all"
      ? ["in_progress", "todo", "done", "archived"]
      : ["in_progress", "todo", "done"];

  if (tasks.length === 0) {
    container.addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent("_No tasks found for this filter._"),
    );
  } else {
    for (const status of statusesToShow) {
      const statusTasks = grouped[status] || [];
      if (statusTasks.length > 0) {
        const config = STATUS_CONFIG[status];

        let statusContent = `${config.emoji} **${config.label}** (${statusTasks.length})\n`;

        const preview = statusTasks.slice(0, 10);
        for (const task of preview) {
          const projectPrefix = task.project?.name ? `[${task.project.name}] ` : "";
          statusContent += `• ${projectPrefix}${truncate(task.title, 50)}\n`;
        }

        if (statusTasks.length > 10) {
          statusContent += `_...and ${statusTasks.length - 10} more_`;
        }

        container.addTextDisplayComponents((textDisplay) => textDisplay.setContent(statusContent));
      }
    }
  }

  components.push(container);

  const filterSelect = new StringSelectMenuBuilder()
    .setCustomId("tasks:filter")
    .setPlaceholder("Filter tasks")
    .addOptions(
      FILTER_OPTIONS.map((opt) => {
        const option = new StringSelectMenuOptionBuilder()
          .setLabel(opt.label)
          .setValue(opt.value)
          .setEmoji(opt.emoji);

        if (opt.value === filter) {
          option.setDefault(true);
        }

        return option;
      }),
    );

  components.push(new ActionRowBuilder().addComponents(filterSelect));

  const selectableTasks = tasks.filter((t) => t.status !== "archived");

  if (selectableTasks.length > 0) {
    const taskOptions = selectableTasks.slice(0, 25).map((task) => {
      const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
      const option = new StringSelectMenuOptionBuilder()
        .setLabel(truncate(task.title, 100))
        .setValue(String(task.id))
        .setEmoji(config.emoji);

      if (task.project?.name) {
        option.setDescription(truncate(task.project.name, 100));
      }

      if (selectedTaskId && String(task.id) === String(selectedTaskId)) {
        option.setDefault(true);
      }

      return option;
    });

    const taskSelect = new StringSelectMenuBuilder()
      .setCustomId("tasks:select")
      .setPlaceholder("Select a task to view details")
      .addOptions(taskOptions);

    components.push(new ActionRowBuilder().addComponents(taskSelect));
  }

  components.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("tasks:refresh")
        .setLabel("Refresh")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🔄"),
    ),
  );

  return {
    components,
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
  };
}

/**
 * Build task detail view (Components v2)
 * @param {Object} task - The task to display
 * @param {Object} options
 * @param {boolean} options.hasActiveSession - Whether user is clocked in
 * @param {string|null} options.notification - Optional notification message
 */
export function buildTaskDetail(task, { hasActiveSession = false, notification = null } = {}) {
  const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const components = [];

  if (notification) {
    components.unshift(buildNotificationComponent(notification, 0x2ecc71));
  }

  const accentColors = {
    in_progress: 0x3498db,
    todo: 0xf1c40f,
    done: 0x2ecc71,
    archived: 0x95a5a6,
  };

  const container = new ContainerBuilder().setAccentColor(accentColors[task.status] || 0x5865f2);

  if (!hasActiveSession && task.status !== "done" && task.status !== "archived") {
    container.addSectionComponents((section) =>
      section
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(`## ${config.emoji} ${task.title}`),
        )
        .setButtonAccessory((button) =>
          button
            .setCustomId(`tasks:start_working:${task.id}`)
            .setLabel("Start Working")
            .setStyle(ButtonStyle.Success),
        ),
    );
  } else {
    container.addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`## ${config.emoji} ${task.title}`),
    );
  }

  container.addSeparatorComponents((separator) =>
    separator.setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  let details = "";

  if (task.project?.name) {
    details += `**Project:** ${task.project.name}\n`;
  }

  details += `**Status:** ${config.label}\n`;

  if (task.dueAt) {
    const dueDate = new Date(task.dueAt);
    details += `**Due:** <t:${Math.floor(dueDate.getTime() / 1000)}:R>\n`;
  }

  container.addTextDisplayComponents((textDisplay) => textDisplay.setContent(details));

  if (task.description) {
    container.addTextDisplayComponents((textDisplay) => textDisplay.setContent(task.description));
  }

  container.addSeparatorComponents((separator) =>
    separator.setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  container.addTextDisplayComponents((textDisplay) =>
    textDisplay.setContent(
      `_Created <t:${Math.floor(new Date(task.createdAt).getTime() / 1000)}:R>_`,
    ),
  );

  components.push(container);

  const statusButtons = [];

  if (task.status !== "todo") {
    statusButtons.push(
      new ButtonBuilder()
        .setCustomId(`tasks:status:todo:${task.id}`)
        .setLabel("Todo")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🟡"),
    );
  }

  if (task.status !== "in_progress") {
    statusButtons.push(
      new ButtonBuilder()
        .setCustomId(`tasks:status:in_progress:${task.id}`)
        .setLabel("In Progress")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🔵"),
    );
  }

  if (task.status !== "done") {
    statusButtons.push(
      new ButtonBuilder()
        .setCustomId(`tasks:status:done:${task.id}`)
        .setLabel("Done")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("✅"),
    );
  }

  if (statusButtons.length > 0) {
    components.push(new ActionRowBuilder().addComponents(statusButtons));
  }

  const actionButtons = [
    new ButtonBuilder()
      .setCustomId(`tasks:edit:${task.id}`)
      .setLabel("Edit")
      .setStyle(ButtonStyle.Secondary),
  ];

  if (task.status !== "archived") {
    actionButtons.push(
      new ButtonBuilder()
        .setCustomId(`tasks:archive:${task.id}`)
        .setLabel("Archive")
        .setStyle(ButtonStyle.Secondary),
    );
  }

  actionButtons.push(
    new ButtonBuilder()
      .setCustomId(`tasks:delete:${task.id}`)
      .setLabel("Delete")
      .setStyle(ButtonStyle.Danger),
  );

  components.push(new ActionRowBuilder().addComponents(actionButtons));

  components.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("tasks:back")
        .setLabel("Back to List")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("⬅️"),
    ),
  );

  return {
    components,
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
  };
}

export function buildDeleteConfirmation(task) {
  const components = [];

  const container = new ContainerBuilder().setAccentColor(0xe74c3c);

  container.addTextDisplayComponents((textDisplay) => textDisplay.setContent("## ⚠️ Delete Task?"));

  container.addSeparatorComponents((separator) =>
    separator.setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  container.addTextDisplayComponents((textDisplay) =>
    textDisplay.setContent(
      `Are you sure you want to delete **"${truncate(task.title, 50)}"**?\n\n_This cannot be undone._`,
    ),
  );

  components.push(container);

  components.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`tasks:delete_confirm:${task.id}`)
        .setLabel("Yes, Delete")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`tasks:back_to_detail:${task.id}`)
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary),
    ),
  );

  return {
    components,
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
  };
}

export function buildV2Message(message, { type = "error" } = {}) {
  const colors = {
    error: 0xe74c3c,
    warning: 0xf1c40f,
    info: 0x3498db,
  };

  const color = colors[type] || colors.error;

  return {
    components: [buildNotificationComponent(message, color)],
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
  };
}

function groupTasksByStatus(tasks) {
  return tasks.reduce((acc, task) => {
    const status = task.status || "todo";
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {});
}

function truncate(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function buildNotificationComponent(message, color = 0x3498db) {
  const container = new ContainerBuilder().setAccentColor(color);
  container.addTextDisplayComponents((textDisplay) => textDisplay.setContent(message));
  return container;
}
