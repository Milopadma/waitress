import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
} from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import type {
  ButtonInteraction,
  GuildMember,
  MessageActionRowComponentBuilder,
  User,
} from "discord.js";

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
    //show the button
    const userBtn = new ButtonBuilder()
      .setLabel("User")
      .setEmoji("👋")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("user-btn");

    const row =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        userBtn
      );

    //reply for confirmation
    await interaction.reply(`Timer set for ${seconds} seconds`);

    //timer finishes, ping the user
    setTimeout(() => {
      interaction.followUp(`Timer done! ${user}`);
    }, seconds * 1000);
  }

  @ButtonComponent({ id: "user-btn" })
  userBtn(interaction: ButtonInteraction): void {
    interaction.reply(`👋 ${interaction.member}`);
  }
}
