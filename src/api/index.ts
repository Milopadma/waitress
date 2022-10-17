//prisma api calls
// Path: src/api/index.ts

import { Get, Post, Router } from "@discordx/koa";
import type { Context } from "koa";

import { prisma } from "../lib/prisma.js";

import { thisGuildID, bot } from "../main.js";

import { atMeListenersPairArray } from "@prisma/client";

let atMeListenersPairArray: atMeListenersPairArray[] = [];

@Router()
export class API {
  @Get("/")
  index(context: Context): void {}

  @Get()
  guilds(context: Context): void {
    context.body = `${bot.guilds.cache.map((g) => `${g.id}: ${g.name}\n`)}`;
  }

  @Get("/getAtMeListenersPairArray")
  async getAtMeListenersPairArray(context: Context): Promise<void> {
    atMeListenersPairArray = await prisma.atMeListenersPairArray.findMany();
    context.body = atMeListenersPairArray;
  }

  @Post("/newAtMe")
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
