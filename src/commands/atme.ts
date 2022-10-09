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
    //check if the userpair already exists
    const userPairExists = atMeListenersPair.some(
      (userPair) => userPair[0] === interaction.user && userPair[1] === user
    );
    //if the userpair doesn't exist, add it to the array
    if (!userPairExists) {
      console.log("adding userpair" + userPairExists);
      atMeListenersPair.push([interaction.user, user!]);
      //reply for confirmation
      await interaction.reply(
        `You will be notified when ${user} joins a voice channel`
      );
    } else {
      //if the userpair already exists, reply with an error message
      await interaction.reply(
        `You are already being notified when ${user} joins a voice channel`
      );
    }

    //create a new listener for the user pair, when the user joins a vc, the interaction user will be notified
    interaction.client.on("voiceStateUpdate", (oldState, newState) => {
      if (
        newState.member?.user === user &&
        newState.channel &&
        !oldState.channel
      ) {
        console.log("user joined vc");
        interaction.followUp(
          `Hey ${interaction.user}, ${user} just joined ${newState.channel}`
        );
      }
    });
  }
}
