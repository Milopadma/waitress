import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class Reportbug {
  @Slash({
    description: "Report a bug for the bot",
    name: "reportbug",
  })
  async featurerequest(
    @SlashOption({
      description: "What bug do you want to report?",
      name: "bug",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    feature: string,
    interaction: CommandInteraction
  ): Promise<void> {
    //reply for confirmation
    await interaction.reply(`Thank you for your bug report!`);
    //send the feature request to the bot owner
    interaction.client.users.cache
      ?.get("398906338786279424")
      ?.send(`!!!Bug report from ${interaction.user.username}: ${feature}`);
  }
}
