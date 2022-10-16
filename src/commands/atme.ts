import {
  ApplicationCommandOptionType,
  CommandInteraction,
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

    console.log(states);

    //if oldStateChannelID is null and newStateChannelID is not null, then continue
    if (oldStateChannelID === null && newStateChannelID !== null) {
      //iterate through the array to find userID, using
      for (let index = 0; index < atMeListenersPairArray.length; index++) {
        const notifier = atMeListenersPairArray[index][0][0].id;
        const notifiedID = atMeListenersPairArray[index][0][1].id;
        const notifiedName = atMeListenersPairArray[index][0][1].username;

        if (userID === notifiedID) {
          const textChannel = atMeListenersPairArray[index][1];
          if (textChannel) {
            await textChannel.send(
              `Hey <@${notifier}>, <${notifiedName}> joined ${voiceChannel}`
            );
          }
          // if the condition is false, remove the user pair from the array
          if (!atMeListenersPairArray[index][2]) {
            atMeListenersPairArray.splice(index, 1);
          }
        }
      }
    } else {
      //then a user has just left a voice channel
      return;
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
      (userPairArray) =>
        userPairArray[0][0].id === notifierUser.id &&
        userPairArray[0][1].id === notifiedUser.id
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
}
