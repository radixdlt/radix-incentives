import { Context, Effect, Layer } from "effect";
import { AppConfigService } from "../../consultation/config/appConfig";
import { pino, type Logger } from "pino";

export class LoggerService extends Context.Tag("LoggerService")<
  LoggerService,
  Logger
>() {}

export const LoggerLive = Layer.effect(
  LoggerService,
  Effect.gen(function* () {
    const config = yield* AppConfigService;
    return pino({
      level: config.logLevel,
    });
  })
);
