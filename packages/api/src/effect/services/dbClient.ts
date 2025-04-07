import { Context } from "effect";
import type { Db } from "db";

export class DbClient extends Context.Tag("DbClient")<DbClient, Db>() {}
