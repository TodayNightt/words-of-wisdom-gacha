import type { FetchEvent } from "@solidjs/start/server";
import { z } from "zod";
import { ErrorWrapper } from "./utils/error-wrapper";

// https://github.com/wmalarski/solid-puzzle/blob/master/src/server/env.ts

if (typeof window !== "undefined") {
    throw new ErrorWrapper("SERVER ON CLIENT!", []);
}

const envSchema = () => z.object({
    SESSION_SECRET: z.string().min(30, "SESSION_SECRET are not long enough"),
    API_URL: z.string().default("http://localhost:51000"),
});


export type Environments = z.output<ReturnType<typeof envSchema>>


export const mwEnvironments = async (event: FetchEvent) => {
    const schema = envSchema();

    const parsedResult = await schema.safeParseAsync(process.env);

    if (parsedResult.success) {
        event.locals.env = parsedResult.data;
    }
}


declare module "@solidjs/start/server" {
    interface RequestEventLocals {
        env: Environments
    }
}


