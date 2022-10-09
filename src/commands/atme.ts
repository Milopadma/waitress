import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import type { GuildMember, User } from "discord.js";

@Discord()
export class AtMe {
  @Slash({ description: "notifies you when someone joins a vc", name: "atme" })
  async atme(
    @SlashOption({
      description:
        "Who do you want to be notified for when they join a voice channel?",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User | GuildMember | undefined,
    interaction: CommandInteraction
  ): Promise<void> {
    //reply for confirmation
    //remove the @ to avoid spamming the user
    const userName = user?.toString().replace("@", "");
    await interaction.reply(`You will be notified when ${userName} joins a vc`);
    //check when the user joins a vc
    interaction.client.on("voiceStateUpdate", (oldState, newState) => {
      if (newState.id === user?.id && !oldState.channel && newState.channel) {
        //notify the message sender when the user joins a vc
        interaction.followUp(
          `Hey ${interaction.user.username}, ${user} is in a voice channel now!`
        );
      }
    });
  }
}
