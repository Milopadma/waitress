import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import type { User } from "discord.js";

//define listeners array
const atMeListenersPair: [User, User][] = [];

@Discord()
@SlashGroup({
  description: "notifies you when someone joins a vc",
  name: "atme",
})
export class AtMe {
  @Slash({ description: "add a listener" })
  @SlashGroup("atme")
  async add(
    @SlashOption({
      name: "user",
      description:
        "Who do you want to be notified for when they join a voice channel?",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User | undefined,

    @SlashOption({
      name: "continuous",
      description: "Want to be notified continously?",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    condition: string,

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
      //check if the user wants to be notified continously or once-only
      if (condition === "yes") {
        //if they want to be notified continously, add a listener for when the user joins the vc
        user!.client.on("voiceStateUpdate", (oldState, newState) => {
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
        });
      } else {
        //if they want to be notified once-only, add a listener for when the user joins the vc
        user!.client.once("voiceStateUpdate", (oldState, newState) => {
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
        });
      }
    }
  }
  @Slash({ description: "remove a listener" })
  @SlashGroup("atme")
  async remove(
    @SlashOption({
      name: "user",
      description:
        "Who do you want to be notified for when they join a voice channel?",
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
    } else {
      //if it isn't, reply for confirmation
      await interaction.reply(`Not notifying ${user}`);
    }
  }
}
