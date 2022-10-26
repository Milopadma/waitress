import { atMeListenersPairArray } from "@prisma/client";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildMember,
  TextBasedChannel,
  // TextBasedChannel,
  VoiceState,
  Message,
} from "discord.js";
import {
  Bot,
  Discord,
  On,
  Once,
  Slash,
  SlashGroup,
  SlashOption,
} from "discordx";

// MIGRATING from local array to prisma-type orm db
import fetch from "node-fetch";
let atMeListenersPairArray: any[] = [];

let thisGuildID: number | null;

@Discord()
@Bot()
@SlashGroup({
  description: "Notifies you when someone joins a vc",
  name: "atme",
})
export class AtMe {
  @On({ event: "voiceStateUpdate" })
  async onVoiceStateUpdate(states: VoiceState[]): Promise<void> {
    const newStateChannelID = states[1].channelId;
    const oldStateChannelID = states[0].channelId;

    const userID = states[1].id;
    const voiceChannel = states[1].channel;

    //if oldStateChannelID is null and newStateChannelID is not null, then continue
    if (oldStateChannelID === null && newStateChannelID !== null) {
      //iterate through the array to find userID, using
      for (let index = 0; index < atMeListenersPairArray.length; index++) {
        const notifier = atMeListenersPairArray[index].notifier;
        const notifiedID = atMeListenersPairArray[index].notified;
        //turn the notifiedID to a notified name with discordjs
        const notifiedName = states[1].guild.members.cache.get(notifiedID);

        if (userID === notifiedID) {
          const textChannelID = atMeListenersPairArray[index].textChannel;
          //use the textChannelID to send a message to the textbasedchannel
          const textChannel = states[1].guild.channels.cache.get(
            textChannelID
          ) as TextBasedChannel;
          if (textChannel) {
            textChannel.send(
              `Hey ${notifier}, ${notifiedName} has joined ${voiceChannel}`
            );
          }
          // if the condition is false, remove the user pair from the array
          if (!atMeListenersPairArray[index].continuous) {
            atMeListenersPairArray.splice(index, 1);
          }
        }
      }
    } else {
      //then a user has just left a voice channel
      return;
    }
  }
  ////////////////////////////////////////////////////////////////////////*
  //                                                                     /
  //                                                                     //
  ////////////////////////////////////////////////////////////////////////*
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

    //fetch the array from the db first, then check if the user pair is already in the array,
    //then add it to the array, then update the db
    const response = await fetch(
      "http://localhost:3300/api/atMeListenersPairArray",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const here_atMeListenersPairArray =
      (await response.json()) as atMeListenersPairArray[];
    const here_userPairArray = here_atMeListenersPairArray.find(
      (userPair) =>
        userPair.notifier === notifierUser.id &&
        userPair.notified === notifiedUser.id
    );
    if (here_userPairArray) {
      interaction.reply(
        `You are already listening to ${notifiedUser.username}`
      );
      return;
    }
    //if it isn't, add it
    const userPair = {
      notifier: notifierUser.id,
      notified: notifiedUser.id,
      continuous: condition,
      textChannel: interaction.channelId,
    };
    //add the user pair to the array
    atMeListenersPairArray.push(userPair);

    const userPairArray = atMeListenersPairArray.find(
      (userPair) =>
        userPair.notifier === notifierUser.id &&
        userPair.notified === notifiedUser.id
    );

    if (userPairArray) {
      //if the user pair is already in the array
      if (userPairArray.continuous === condition) {
        //if the condition is the same
        await interaction.reply(
          `You are already being notified ${
            condition ? "continously" : "once"
          } when ${notifiedUser.username} joins a voice channel`
        );
      } else {
        //if the condition is different
        userPairArray.continuous = condition; //set the condition to the new one
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
      thisGuildID = Number(interaction.guildId);
      if (textChannel) {
        //and then add the data to the db using the src/api
        const response = await fetch(`http://localhost:3300/api/newAtMe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notifier: notifierUser.id,
            notified: notifiedUser.id,
            textChannel: textChannel.id,
            continuous: condition,
            guildID: thisGuildID,
          }),
        });
        console.log(response);
        console.log("This Guild ID FROM 150 = " + thisGuildID);

        if (response.status === 201) {
          textChannel.send(
            `You will now be notified ${
              condition ? "continuously" : "once"
            } when ${notifiedUser.username} joins a voice channel`
          );
        } else
          await textChannel.send(
            `There was an error adding ${notifiedUser.username} to the database`
          );
      }
    }
  }
  ////////////////////////////////////////////////////////////////////////*
  //                                                                     /
  //                                                                     //
  ////////////////////////////////////////////////////////////////////////*
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
    //check if the user pair is already in the array
    const notifierUser = interaction.user; //the one that sent the command [1]
    const notifiedUser = GuildMember.user; //the one that was mentioned as a command parameter [2]
    const userPairArray = atMeListenersPairArray.find(
      (userPair) =>
        userPair.notifier === notifierUser.id &&
        userPair.notified === notifiedUser.id
    );

    if (userPairArray) {
      //if it is, remove it
      atMeListenersPairArray.splice(
        atMeListenersPairArray.indexOf(userPairArray),
        1
      );
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
  ////////////////////////////////////////////////////////////////////////*
  //                                                                     /
  //                                                                     //
  ////////////////////////////////////////////////////////////////////////*
  @Slash({ description: "list all listeners" })
  @SlashGroup("atme")
  async list(interaction: CommandInteraction): Promise<void> {
    const response = await fetch(
      "http://localhost:3300/api/atMeListenersPairArray",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const here_atMeListenersPairArray =
      (await response.json()) as atMeListenersPairArray[];
    //find in the here_atMeListenersPairArray the notifier that is the same as the user that sent the command
    const notifierUser = interaction.user;
    const textChannel = interaction.channel;
    const notifierUserArray = here_atMeListenersPairArray.filter(
      (userPair) => userPair.notifier === notifierUser.id
    );

    if (!textChannel) return;
    //if the notifierUserArray is empty, reply with a message
    if (notifierUserArray.length === 0) {
      await textChannel.send(
        "You are not notifying yourself for anyone joining a voice channel"
      );
    } else {
      //if the notifierUserArray is not empty, reply with a message
      await textChannel.send(
        `You are notifying yourself for the following users joining a voice channel: ${notifierUserArray
          .map((userPair) => `<@${userPair.notified}>`)
          .join(", ")}`
      );
    }
  }
}

//   const notifierUser = interaction.user;
//   const userPairArray = atMeListenersPairArray.find(
//     (userPair) => userPair.notifier === notifierUser.id
//   );
//   if (userPairArray) {
//     for (let index = 0; index < userPairArray; index++) {
//       const element = userPairArray[index];
//       if (interaction.guild) {
//         const notifiedUser = interaction.guild.members.cache.get(
//           element.notified
//         );
//         await interaction.reply(
//           `You are being notified ${
//             element.continuous ? "continuously" : "once"
//           } when ${notifiedUser} joins a voice channel`
//         );
//       } else {
//         await interaction.reply(
//           `You are being notified ${
//             element.continuous ? "continuously" : "once"
//           } when ${element.notified} joins a voice channel`
//         );
//       }
//     }
//   } else {
//     await interaction.reply(
//       `You are not being notified whenever anyone joins.`
//     );
//   }
//   }
// }
