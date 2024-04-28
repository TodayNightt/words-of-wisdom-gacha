import { type HTTPEvent, useSession } from "vinxi/http";

type SessionStore = {
  jwtToken: string | null,
}

export async function getSession(event?: HTTPEvent) {
  const password = process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace"
  if (event) {
    return await useSession<SessionStore>(event, {
      password
    })
  }
  return await useSession<SessionStore>({
    password
  });
}

