export async function handleEvent(interaction, handlers) {
  const key = interaction.customId || interaction.commandName;

  const handler = handlers[key];
  if (!handler) {
    console.warn(`Unhandled interaction: ${key}`);
    return;
  }

  try {
    return await handler(interaction);
  } catch (err) {
    console.error(`Interaction error (${key}):`, err);
  }
}
