import { type HTTPEvent, useSession } from "vinxi/http";
import { Environment } from "~/environments";

type SessionStore = {
  jwtToken: string | null,
}

export async function getSession() {
  "use server";
  const password = Environment.getInstance().get("SESSION_SECRET")
  return await useSession<SessionStore>({
    password
  });
}

