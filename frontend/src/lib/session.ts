import { type HTTPEvent, useSession } from "vinxi/http";
import { Environment } from "~/environments";

type SessionStore = {
  jwtToken: string | null,
}

export async function getSession(event?: HTTPEvent) {
  const password = Environment.getInstance().get("SESSION_SECRET")
  if (event) {
    return await useSession<SessionStore>(event, {
      password
    })
  }
  return await useSession<SessionStore>({
    password
  });
}

