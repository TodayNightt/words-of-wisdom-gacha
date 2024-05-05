import type { FetchEvent } from "@solidjs/start/server";
import { type SessionConfig, getSession, updateSession } from "vinxi/http";


//https://github.com/peerreynders/solid-start-sse-chat/blob/main/src/server/session.ts

type SessionStore = {
  jwtToken: string | null,
}

export async function mwGetSession(event: FetchEvent) {
  const session = await getSession<SessionStore>(event.nativeEvent, getSessionConfig(event));
  event.locals.sData = session.data;
}

const getSessionConfig = (event: FetchEvent) => {
  return {
    password: event.locals.env.SESSION_SECRET
  } as SessionConfig;
}

export const updateSessionData = async (event: FetchEvent, data: SessionStore) => {
  await updateSession<SessionStore>(event.nativeEvent, getSessionConfig(event), data);
}

declare module "@solidjs/start/server" {
  interface RequestEventLocals {
    sData: SessionStore
  }
}

