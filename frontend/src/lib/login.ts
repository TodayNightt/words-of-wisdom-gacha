import { action, redirect } from "@solidjs/router";
import { z } from "zod";
import type { BackendResult, LoginResponse, LogoffResponse } from "./types";
import { catchIfAny } from "~/utils/catch-if-any";
import { ErrorWrapper } from "~/utils/error-wrapper";
import { toResult } from "./error";
import { getRequestEventOrThrow } from "~/utils/get-request-event";
import { updateSessionData } from "./session";
import { getRequestEvent } from "solid-js/web";


export const login = action(async (formData: FormData) => {
  "use server";

  const reqs = getRequestEvent();

  if (!reqs) {
    return new ErrorWrapper("Unknown Error", []);
  }

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

  const loginResult = await catchIfAny<BackendResult<LoginResponse>>(fetch(`${reqs.locals.env.API_URL}/api/admin/login`, {
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



  await updateSessionData(reqs, { jwtToken: token });

  throw redirect("/admin");
});

export const logout = action(async () => {
  "use server";

  const reqs = getRequestEvent();

  if (reqs?.locals?.sData.jwtToken) {

    const headers = new Headers();
    headers.append("Authorization", `Bearer ${reqs.locals.sData.jwtToken}`)


    const logoffResult = await catchIfAny<BackendResult<LogoffResponse>>(
      fetch(`${reqs.locals.env.API_URL}/api/admin/logoff`, {
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

    await updateSessionData(reqs, { jwtToken: null })
  }


  return redirect("/admin/login");
});
