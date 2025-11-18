export async function appendContext(interaction, contextConfig = {}) {
  if (!contextConfig) return;

  const { needsUser = false, needsSession = false } = contextConfig;

  interaction.context = interaction.context || {};

  if (needsUser && !interaction.context.user) {
    const user = await interaction.services.userService.getOneDiscordId(interaction.user.id);

    if (!user) {
      interaction.context.user = null;
      // no user no session or any other context to be had.
      return;
    }

    interaction.context.user = user;
  }

  // Load session if needed
  if (needsSession && interaction.context.user && !interaction.context.session) {
    const session = await interaction.services.sessionService.getOneActive(
      interaction.context.user.id,
    );
    interaction.context.session = session || null;
  }
}
