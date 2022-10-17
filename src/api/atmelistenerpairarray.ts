//prisma api calls
import { Get, Middleware, Post, Router } from "@discordx/koa";
import koaBody from "koa-body";
import type { Context } from "koa";
import { prisma } from "../lib/prisma.js";
import { bot } from "../main.js";
import { atMeListenersPairArray } from "@prisma/client";
let atMeListenersPairArray: atMeListenersPairArray[] = [];

@Router()
export class API {
  @Get("/api/atMeListenersPairArray")
  async getAtMeListenersPairArray(context: Context): Promise<void> {
    context.body = await prisma.atMeListenersPairArray.findMany();
  }

  @Get("/api/getByGuildID")
  async getByGuildID(context: Context): Promise<void> {
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
  @Middleware(koaBody())
  async newAtMe(context: Context): Promise<void> {
    const request = context.request.body;
    console.log("!!!FROM API request- " + request);
    if (request) {
      console.log(
        "!!!FROM API textchannel- " + context.request.body.textChannel
      );
      const notifier = request.notifier;
      const notified = request.notified;
      const textChannel = request.textChannel;
      //turn the request.continuous into a boolean
      const continuous = request.continuous === "true" ? false : true;

      const newAtMe = await prisma.atMeListenersPairArray.create({
        data: {
          uniqueId: Math.floor(Math.random() * 100000) + 1,
          notifier: notifier as string,
          notified: notified as string,
          TextChannel: textChannel as string,
          continuous: continuous as boolean,
        },
      });
      //
      context.response.status = 201;
      context.body = {
        message: "New atMe created",
        data: newAtMe,
      };
      //if the request is null, return a 400 error
    } else {
      context.body = {
        error: "No request body",
      };
    }
  }
}
