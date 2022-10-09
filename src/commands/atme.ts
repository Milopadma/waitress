import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import type { User } from "discord.js";

//define listeners array
const atMeListenersPair: [User, User][] = [];

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
    user: User | undefined,
    interaction: CommandInteraction
  ): Promise<void> {
    //check if the user pair is already in the atMeListeners array
    const userPair = atMeListenersPair.find((pair) => pair[0] === user);
    if (userPair) {
      //if it is, remove it
      atMeListenersPair.splice(atMeListenersPair.indexOf(userPair), 1);
      //reply for confirmation
      await interaction.reply(`No longer notifying ${user}`);
    }
    {
      //if it isn't, add it
      atMeListenersPair.push([interaction.user, user!]);
      //reply for confirmation
      await interaction.reply(`Now notifying ${user}`);
      //and add a listener for when the user joins the vc
      user!.client.once(
        "voiceStateUpdate",
        (oldState, newState) => {
          if (
            oldState.channel === null &&
            newState.channel !== null &&
            newState.member!.id === user!.id
          ) {
            //if they did, ping the user
            interaction.followUp(
              `Hey ${interaction.user}, ${user!.username} just joined ${
                newState.channel
              }`
            );
          }
        } //check if the user joined a vc
      );
    }
  }
}
