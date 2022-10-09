import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import type { GuildMember, User } from "discord.js";

@Discord()
export class FeatureRequest {
  @Slash({
    description: "Request a feature for the bot",
    name: "featurerequest",
  })
  async featurerequest(
    @SlashOption({
      description: "What feature do you want to request?",
      name: "feature",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    feature: string,
    interaction: CommandInteraction
  ): Promise<void> {
    //reply for confirmation
    await interaction.reply(`Thank you for your feature request!`);
    //send the feature request to the bot owner
    interaction.client.users.cache
      ?.get("398906338786279424")
      ?.send(`Feature request from ${interaction.user.username}: ${feature}`);
  }
}
