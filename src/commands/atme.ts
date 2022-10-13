import {
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildMember,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import type { User } from "discord.js";

//define user pair tuple
const atMeListenersPair: [User, User][] = [];

@Discord()
@SlashGroup({
  description: "Notifies you when someone joins a vc",
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
    GuildMember: GuildMember,

    @SlashOption({
      name: "continuous",
      description: "Want to be notified continously?",
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    condition: boolean,
    interaction: CommandInteraction
  ): Promise<void> {
    //check if the user pair is already in the tuple
    const user = GuildMember.user;
    const userPair = atMeListenersPair.find((pair) => pair[1] === user);

    if (userPair) {
      //if it is, remove it
      atMeListenersPair.splice(atMeListenersPair.indexOf(userPair), 1);
      console.log("removed a pair, array currently is: " + atMeListenersPair);

      //reply for confirmation
      await interaction.reply(
        `You will no longer be notified when they join a voice channel`
      );

      //remove the listener
      GuildMember.user!.client.removeAllListeners("voiceStateUpdate");
    } else {
      //if it isn't, add it,
      atMeListenersPair.push([interaction.user, GuildMember.user]);
      console.log("new pair" + atMeListenersPair);
      //and add a listener for when the user joins the vc
      //check if the user wants to be notified continously or once-only
      if (condition === true) {
        //if they want to be notified continously, add a listener for when the user joins the vc
        GuildMember.user!.client.on(
          "voiceStateUpdate",
          (oldState, newState) => {
            if (
              oldState.channel === null &&
              newState.channel !== null &&
              newState.member!.id === GuildMember.user!.id
            ) {
              //if they did, send a message to the channel to ping the user
              interaction.channel!.send(
                `Hey ${interaction.user}, ${GuildMember.user.username} just joined ${newState.channel}!`
              );
            }
          }
        );
      } else {
        //if they want to be notified once-only, add a listener for when the user joins the vc
        GuildMember.user!.client.once(
          "voiceStateUpdate",
          (oldState, newState) => {
            if (
              oldState.channel === null &&
              newState.channel !== null &&
              newState.member!.id === GuildMember.user!.id
            ) {
              //if they did, ping the user
              interaction.channel!.send(
                `Hey ${interaction.user}, ${GuildMember.user.username} just joined ${newState.channel}!`
              );
            }
          }
        );
      }

      //reply for confirmation
      await interaction.reply(
        `Now notifying you whenever ${
          user!.username
        } joins a voice channel, with '${condition}' to continous notifications.`
      );
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
    GuildMember: GuildMember,
    interaction: CommandInteraction
  ): Promise<void> {
    const user = GuildMember.user;
    //check if the user pair is already in the atMeListeners array
    const userPair = atMeListenersPair.find((pair) => pair[0] === user);
    if (userPair) {
      //if it is, remove it
      atMeListenersPair.splice(atMeListenersPair.indexOf(userPair), 1);
      //reply for confirmation
      await interaction.reply(
        `No longer notifying you whenever ${user!.username} joins.`
      );
    } else {
      //if it isn't, reply for confirmation
      await interaction.reply(
        `You're not notifying yourself whenever ${user!.username} joins.`
      );
    }
  }
}
