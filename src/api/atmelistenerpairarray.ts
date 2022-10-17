//prisma api calls
import { Get, Post, Router } from "@discordx/koa";
import type { Context } from "koa";
import { prisma } from "../lib/prisma.js";
import { thisGuildID, bot } from "../main.js";
import { atMeListenersPairArray } from "@prisma/client";
let atMeListenersPairArray: atMeListenersPairArray[] = [];

@Router()
export class API {
  @Get("/api/atMeListenersPairArray")
  async getAtMeListenersPairArray(context: Context): Promise<void> {
    context.body = await prisma.atMeListenersPairArray.findMany();
  }

  @Get("/api/:guildId")
  async getAtMeListenersPairArrayByGuildId2(context: Context): Promise<void> {
    const guildId = context.params.guildId;
    const guild = bot.guilds.cache.get(guildId);
    if (!guild) {
      context.status = 404;
      context.body = `Guild with id ${guildId} not found`;
      return;
    }
    context.body = await prisma.atMeListenersPairArray.findMany({
      where: {
        GuildData: guildId,
      },
    });
  }

  @Post("/api/newAtMe")
  async newAtMe(context: Context): Promise<void> {
    const { notifier, notified, textChannel, condition } = context.request.ctx;
    const newAtMe = await prisma.atMeListenersPairArray.create({
      data: {
        uniqueId: Math.floor(Math.random() * 100000) + 1,
        notifier: notifier as string,
        notified: notified as string,
        continuous: condition as boolean,
        TextChannel: textChannel as string,
        GuildData: {
          connectOrCreate: {
            where: {
              guildId: thisGuildID,
            },
            create: {
              guildId: thisGuildID,
            },
          },
        },
      },
    });
    context.body = newAtMe;
  }
}
