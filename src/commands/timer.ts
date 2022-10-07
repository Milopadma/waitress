import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import type { GuildMember, User } from "discord.js";

@Discord()
export class Timer {
  @Slash({ description: "Set a timer for x seconds", name: "timer" })
  async timer(
    @SlashOption({
      description: "How many seconds to wait",
      name: "seconds",
      required: true,
      type: ApplicationCommandOptionType.Integer,
    })
    @SlashOption({
      description: "who to ping after the timer",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    seconds: //these are the paramters for the slash command
    number,
    user: User | GuildMember | undefined,
    interaction: CommandInteraction
  ): Promise<void> {
    //reply for confirmation
    await interaction.reply(`Timer set for ${seconds} seconds`);

    //timer finishes, ping the user
    setTimeout(() => {
      interaction.followUp(`Timer done! ${user}`);
    }, seconds * 1000);
  }
}
