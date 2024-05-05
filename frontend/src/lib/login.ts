import { action, redirect } from "@solidjs/router";
import { z } from "zod";
import type { BackendResult, LoginResponse, LogoffResponse } from "./types";
import { catchIfAny } from "~/utils/catch-if-any";
import { API_SERVER } from "./api-server_url";
import { ErrorWrapper } from "~/utils/error-wrapper";
import { toResult } from "./error";
import { getRequestEventOrThrow } from "~/utils/get-request-event";
import { updateSessionData } from "./session";


export const login = action(async (formData: FormData) => {
  "use server";

  const username = String(formData.get("username"));
  const password = String(formData.get("password"));


  const schema = z.object({
    username: z.string().min(1, { message: "Username must be longer" }),
    password: z.string().min(1, { message: "Password must be longer" }),
  })

  const parsedResult = schema.safeParse({ username, password });
  if (!parsedResult.success) {
    const causes = parsedResult.error.issues.map(issue => issue.message);
    return new ErrorWrapper("Validation Error", causes);
  }

  const loginResult = await catchIfAny<BackendResult<LoginResponse>>(fetch(`${API_SERVER}/api/admin/login`, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      password
    })
  }).then(res => res.json()
  ));

  if (loginResult.isErr()) {
    return ErrorWrapper.fromError(loginResult.error);
  }

  const backendResult = toResult(loginResult.value);

  if (backendResult.isErr()) {
    return ErrorWrapper.fromBackendError(backendResult.error);
  }

  const loginRes = backendResult.value;

  const token = loginRes.token;

  const requestEvent = getRequestEventOrThrow();

  await updateSessionData(requestEvent, { jwtToken: token });

  throw redirect("/admin");
});

export const logout = action(async () => {
  "use server";

  const session = getRequestEventOrThrow().locals.sData;

  if (session.jwtToken) {

    const headers = new Headers();
    headers.append("Authorization", `Bearer ${session.jwtToken}`)


    const logoffResult = await catchIfAny<BackendResult<LogoffResponse>>(
      fetch(`${API_SERVER}/api/admin/logoff`, {
        method: "post",
        headers,
      }).then((res) => res.json()),
    );

    if (logoffResult.isErr()) {
      return ErrorWrapper.fromError(logoffResult.error);
    }

    const backendResult = toResult(logoffResult.value);

    if (backendResult.isErr()) {
      return ErrorWrapper.fromBackendError(backendResult.error);
    }

    const requestEvent = getRequestEventOrThrow();
    await updateSessionData(requestEvent, { jwtToken: null })
  }


  return redirect("/admin/login");
});
