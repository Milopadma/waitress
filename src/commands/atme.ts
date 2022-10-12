import {
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildBasedChannel,
  GuildMember,
  TextBasedChannel,
  VoiceState,
} from "discord.js";
import { Discord, On, Slash, SlashGroup, SlashOption } from "discordx";
import type { User } from "discord.js";

//define user pair, text channel and boolean
type UserPair = [User, User]; // [notifier, notified]
type TextChannel = TextBasedChannel | null;
type Boolean = boolean;

//define array
const atMeListenersPairArray: [UserPair, TextChannel, Boolean][] = [];

@Discord()
@SlashGroup({
  description: "notifies you when someone joins a vc",
  name: "atme",
})
export class AtMe {
  @On({ event: "voiceStateUpdate" })
  async onVoiceStateUpdate(states: VoiceState[]): Promise<void> {
    const userID = states[1].id;
    const channelID = states[1].channelId;
    //iterate through the array to find userID, using
    for (let index = 0; index < atMeListenersPairArray.length; index++) {
      const notifier = atMeListenersPairArray[index][0][0].id;
      const notifiedID = atMeListenersPairArray[index][0][1].id;
      const notifiedName = atMeListenersPairArray[index][0][1].username;

      if (userID === notifiedID) {
        const channel = atMeListenersPairArray[index][1];
        if (channel) {
          await channel.send(
            `Hey <@${notifier}>, <@${notifiedName}> joined ${channelID}`
          );
        }
        // if the condition is false, remove the user pair from the array
        if (!atMeListenersPairArray[index][2]) {
          atMeListenersPairArray.splice(index, 1);
        }
      }
    }
  }

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
    // below are array checks //
    //check if the user pair is already in the array
    const notifierUser = interaction.user; //the one that sent the command [1]
    const notifiedUser = GuildMember.user; //the one that was mentioned as a command parameter [2]
    const userPairArray = atMeListenersPairArray.find(
      (userPairArray) =>
        userPairArray[0][0].id === notifierUser.id &&
        userPairArray[0][1].id === notifiedUser.id
    );
    if (userPairArray) {
      //if the user pair is already in the array
      if (userPairArray[2] === condition) {
        //if the condition is the same
        await interaction.reply(
          `You are already being notified ${
            condition ? "continously" : "once"
          } when ${notifiedUser.username} joins a voice channel`
        );
      } else {
        //if the condition is different
        userPairArray[2] = condition; //set the condition to the new one
        await interaction.reply(
          `You are now being notified ${
            condition ? "continously" : "once"
          } when ${notifiedUser.username} joins a voice channel`
        );
      }
    } else {
      //if the user pair is not in the array
      //get the text channel where the command interaction happened
      const textChannel = interaction.channel;
      atMeListenersPairArray.push([
        [notifierUser, notifiedUser],
        textChannel,
        condition,
      ]);
      await interaction.reply(
        `You will now be notified ${condition ? "continously" : "once"} when ${
          notifiedUser.username
        } joins a voice channel`
      );
    }
  }
}

//
//event listeners methods
//check whenever a user joins a vc, then check if the user is a notifiedUser in the array

//     if (isUserPairExist) {
//       //if it is, remove it
//       atMeListenersPair.splice(atMeListenersPair.indexOf(userPair), 1);
//       console.log("CLG + Removed a pair, array currently is: " + atMeListenersPair);

//       //reply for confirmation
//       await notified.channel.send(
//       `You will no longer be notified when they join a voice channel`
//       );

//       //remove the listener
//       GuildMember.user!.client.removeAllListeners("voiceStateUpdate");
//     } else {
//       //if it isn't, add it,
//       atMeListenersPair.push([interaction.user, GuildMember.user, condition]);
//       console.log("CLG + New pair" + atMeListenersPair);
//       //and add a listener for when the user joins the vc
//       //check if the user wants to be notified continously or once-only
//       if (condition === true) {
//         //if they want to be notified continously, add a listener for when the user joins the vc
//         const EventListener = GuildMember.user!.client.on(
//           "voiceStateUpdate",
//           (oldState, newState) => {
//             if (
//               oldState.channel === null &&
//               newState.channel !== null &&
//               newState.member!.id === GuildMember.user!.id
//             ) {
//               //if they did, send a message to the channel to ping the user
//               interaction.channel!.send(
//                 `Hey ${interaction.user}, ${GuildMember.user.username} just joined ${newState.channel}!`
//               );
//             }
//           }
//         );
//       } else {
//         //if they want to be notified once-only, add a listener for when the user joins the vc
//         GuildMember.user!.client.once(
//           "voiceStateUpdate",
//           (oldState, newState) => {
//             if (
//               oldState.channel === null &&
//               newState.channel !== null &&
//               newState.member!.id === GuildMember.user!.id
//             ) {
//               //if they did, ping the user
//               interaction.channel!.send(
//                 `Hey ${interaction.user}, ${GuildMember.user.username} just joined ${newState.channel}!`
//               );
//             }
//           }
//         );
//       }

//       //reply for confirmation
//       await interaction.reply(
//         `Now notifying you whenever ${
//           user!.username
//         } joins a voice channel, with '${condition}' to continous notifications.`
//       );
//     }
//   }
//   @Slash({ description: "remove a listener" })
//   @SlashGroup("atme")
//   async remove(
//     @SlashOption({
//       name: "user",
//       description:
//         "Who do you want to be notified for when they join a voice channel?",
//       required: true,
//       type: ApplicationCommandOptionType.User,
//     })
//     GuildMember: GuildMember,
//     interaction: CommandInteraction
//   ): Promise<void> {
//     const user = GuildMember.user;
//     //check if the user pair is already in the atMeListeners array
//     const userPair = atMeListenersPair.find((pair) => pair[0] === user);
//     if (userPair) {
//       //if it is, remove it
//       atMeListenersPair.splice(atMeListenersPair.indexOf(userPair), 1);
//       //reply for confirmation
//       await interaction.reply(
//         `No longer notifying you whenever ${user!.username} joins.`
//       );
//     } else {
//       //if it isn't, reply for confirmation
//       await interaction.reply(
//         `You're not notifying yourself whenever ${user!.username} joins.`
//       );
//     }
//   }
// }
