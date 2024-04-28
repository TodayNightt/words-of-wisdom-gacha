import { action, redirect } from "@solidjs/router";
import { getSession } from "./session";
import { z } from "zod";


import { type BackendResult, type LoginResponse, toResult, ErrorWrapper, type LogoffResponse } from "./types";
import { catchIfAny } from "~/utils/catch-if-any";


export const API_SERVER = "http://0.0.0.0:51000"

// export const getUser = cache(async () => {
//   "use server";
//   try {
//     const session = await getSession();
//     const userId = session.data.userId;
//     if (userId === undefined) throw new Error("User not found");
//     // const user = await db.user.findUnique({ where: { id: userId } });
//     // if (!user) throw new Error("User not found");
//     // return { id: user.id, username: user.username };
//   } catch {
//     await logoutSession();
//     throw redirect("/login");
//   }
// }, "user");

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

  console.log(backendResult.value)

  const loginRes = backendResult.value;

  const token = loginRes.token;

  const session = await getSession();

  await session.update({ jwtToken: token });

  return redirect("/admin");
});

export const logout = action(async () => {
  "use server";

  const session = await getSession();

  if (session.data.jwtToken) {

    const headers = new Headers();
    headers.append("Authorization", `Bearer ${session.data.jwtToken}`)


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

    await session.update({ jwtToken: null });
  }


  return redirect("/admin/login");
});
