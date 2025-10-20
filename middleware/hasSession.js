export default async function hasSession(interaction) {
  const { sessionService } = interaction.services;

  try {
    const session = await sessionService.getOneActiveByDiscordId(interaction.user.id);

    if (!session) return false;

    interaction.activeSession = session;
    interaction.dbUser = session.user;
    return true;
  } catch (err) {
    console.error("hasSession error:", err);
    return false;
  }
}
