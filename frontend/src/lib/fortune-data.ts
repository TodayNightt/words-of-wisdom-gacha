import { catchIfAny } from "~/utils/catch-if-any";
import type { BackendResult, FortuneInfo, FortuneDeleteResponse, FortuneEditResponse, FortuneCreateResponse, FortuneCountResponse, Unit, FortuneCreateBulkResponse, FortuneListResponse, FortuneRandomResponse } from "./types";
import { action, cache, redirect, reload } from "@solidjs/router";
import { z } from "zod";
import { ErrorWrapper } from "~/utils/error-wrapper";
import { toResult } from "./error";
import { getRequestEvent } from "solid-js/web";

export const listFortune = cache(async () => {
    "use server";

    const reqsLocal = getRequestEvent()?.locals

    console.log("HELLO after getSession")
    if (!reqsLocal?.sData?.jwtToken) {
        throw redirect("/admin/login")
    }
    const session = reqsLocal.sData;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session?.jwtToken}`)

    const result = await catchIfAny<BackendResult<FortuneListResponse>>(fetch(`${reqsLocal.env.API_URL}/api/fortune/list`, { headers }).then(res => res.json()));

    if (result.isErr()) {
        console.log("HELLO fetching error")
        throw ErrorWrapper.fromError(result.error);
    }

    const backendResult = toResult(result.value);

    if (backendResult.isErr()) {
        if (backendResult.error.type === "NOT_LOGGED_IN") {
            throw redirect("/admin/login");
        }
        throw ErrorWrapper.fromBackendError(backendResult.error);
    }

    return backendResult.value.list;
}, "fortuneList")

export async function getRandom() {
    "use server";

    const reqsLocal = getRequestEvent()?.locals;

    if (!reqsLocal) {
        return new ErrorWrapper("Unknown Er ror", []);
    }

    const result = await catchIfAny<BackendResult<FortuneRandomResponse>>(fetch(`${reqsLocal.env.API_URL}/api/fortune/random`).then((res => res.json())));

    if (result.isErr()) {
        throw ErrorWrapper.fromError(result.error);
    }

    const backendResult = toResult(result.value);

    if (backendResult.isErr()) {
        throw ErrorWrapper.fromBackendError(backendResult.error);
    }

    return backendResult.value;
}

export const getFortuneInfo = cache(async (id: string) => {
    "use server";

    const reqsLocal = getRequestEvent()?.locals

    if (!reqsLocal?.sData?.jwtToken) {
        throw redirect("/admin/login")
    }
    const session = reqsLocal.sData;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session?.jwtToken}`);

    const result = await catchIfAny<BackendResult<FortuneInfo>>(fetch(`${reqsLocal.env.API_URL}/api/fortune/get?id=${id}`, { headers }).then(res => res.json()));

    if (result.isErr()) {
        throw ErrorWrapper.fromError(result.error);
    }

    const backendResult = toResult(result.value);

    if (backendResult.isErr()) {
        if (backendResult.error.type === "NOT_LOGGED_IN") {
            throw redirect("/admin/login");
        }
        throw ErrorWrapper.fromBackendError(backendResult.error)
    }

    return backendResult.value
}, "fortuneInfo")


export const removeFortune = action(async (id: string) => {
    "use server";
    const reqsLocal = getRequestEvent()?.locals

    if (!reqsLocal?.sData?.jwtToken) {
        return redirect("/admin/login")
    }
    const session = reqsLocal.sData;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session?.jwtToken}`)


    const result = await catchIfAny<BackendResult<FortuneDeleteResponse>>(
        fetch(`${reqsLocal.env.API_URL}/api/fortune/delete?id=${id}`, {
            headers,
            method: "delete",
        }).then((res) => res.json()),
    );

    if (result.isErr()) {
        return ErrorWrapper.fromError(result.error);
    }

    const backendResult = toResult(result.value);

    if (backendResult.isErr()) {
        return ErrorWrapper.fromBackendError(backendResult.error);
    }

    if (backendResult.value.id !== id) {
        return new ErrorWrapper("Deleted value are not the right id", []);
    }

    return reload({ revalidate: listFortune.key })
})

export const editFortune = action(async (formData: FormData): Promise<ErrorWrapper | {
    reload: never;
    result: Unit;
}> => {
    "use server";

    const id = String(formData.get("id"));
    const fortune = String(formData.get("fortune"));
    const collection = String(formData.get("collection"))

    const schema = z.object({
        id: z.string(),
        fortune: z.string().min(1, { message: "Fortune must be longer" }),
    })

    const parsedResult = schema.safeParse({ id, fortune });
    if (!parsedResult.success) {
        const causes = parsedResult.error.issues.map(issue => issue.message);
        return new ErrorWrapper("Validation Error", causes);
    }

    const body = JSON.stringify({
        id: id,
        collectionName: collection,
        data: fortune
    })

    const reqsLocal = getRequestEvent()?.locals

    if (!reqsLocal?.sData?.jwtToken) {
        return redirect("/admin/login")
    }
    const session = reqsLocal.sData;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session?.jwtToken}`)

    const result = await catchIfAny<BackendResult<FortuneEditResponse>>(
        fetch(`${reqsLocal.env.API_URL}/api/fortune/update`, {
            method: "post",
            headers,
            body: body,
        }).then((res) => res.json()),
    )

    if (result.isErr()) {
        return ErrorWrapper.fromError(result.error);
    }

    const backendResult = toResult(result.value);

    if (backendResult.isErr()) {
        return ErrorWrapper.fromBackendError(backendResult.error);
    }

    if (backendResult.value.id !== id) {
        return new ErrorWrapper("Edit value are not the right id", []);
    }

    return { reload: reload({ revalidate: listFortune.key }), result: "unit" }
})

export const createFortune = action(async (formData: FormData) => {
    "use server";

    const fortune = String(formData.get("fortune"));
    const collectionName = String(formData.get("collection"))

    const schema = z.object({
        collectionName: z.string(),
        fortune: z.string().min(1, { message: "Fortune must be longer" }),
    })

    const parsedResult = schema.safeParse({ collectionName, fortune });
    if (!parsedResult.success) {
        const causes = parsedResult.error.issues.map(issue => issue.message);
        return new ErrorWrapper("Validation Error", causes);
    }

    const reqsLocal = getRequestEvent()?.locals

    if (!reqsLocal?.sData?.jwtToken) {
        return redirect("/admin/login")
    }
    const session = reqsLocal.sData;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session?.jwtToken}`)

    const method = "post"

    const body = JSON.stringify(parsedResult.data)

    const result = await catchIfAny<BackendResult<FortuneCreateResponse>>(
        fetch(`${reqsLocal.env.API_URL}/api/fortune/create`, {
            headers,
            method,
            body,
        }).then((res) => res.json()),
    );

    if (result.isErr()) {
        return ErrorWrapper.fromError(result.error);
    }

    const backendResult = toResult(result.value);

    if (backendResult.isErr()) {
        if (backendResult.error.type === "NOT_LOGGED_IN") {
            return redirect("/admin/login");
        }
        return ErrorWrapper.fromBackendError(backendResult.error);
    }

    return { reload: reload({ revalidate: listFortune.key }), result: backendResult.value.id }
})


export const getFortuneCountByCollection = cache(async (collectionName: string) => {
    "use server";

    const reqsLocal = getRequestEvent()?.locals

    if (!reqsLocal?.sData?.jwtToken) {
        throw redirect("/admin/login")
    }
    const session = reqsLocal.sData;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session?.jwtToken}`)

    const method = "post"

    const body = JSON.stringify({
        collectionName
    })


    const result = await catchIfAny<BackendResult<FortuneCountResponse>>(
        fetch(`${reqsLocal.env.API_URL}/api/fortune/count`, {
            headers,
            method,
            body,
        }).then((res) => res.json()),
    );

    if (result.isErr()) {
        throw ErrorWrapper.fromError(result.error);
    }

    const backendResult = toResult(result.value);

    if (backendResult.isErr()) {
        if (backendResult.error.type === "NOT_LOGGED_IN") {
            throw redirect("/admin/login");
        }
        throw ErrorWrapper.fromBackendError(backendResult.error);
    }

    if (backendResult.value.collectionName !== collectionName) {
        throw new ErrorWrapper("The count getted are not the requested collectionName", [], "INTERNAL_SERVER_ERROR");
    }

    return backendResult.value.count
}, "fortuneCountByCollection")

export const createFortuneBulk = action(async (form: FormData) => {
    "use server";

    const reqsLocal = getRequestEvent()?.locals

    if (!reqsLocal?.sData?.jwtToken) {
        return redirect("/admin/login")
    }
    const session = reqsLocal.sData;
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${session?.jwtToken}`)

    const method: RequestInit["method"] = "post"

    const file = form.get("file") as File;

    const formData = new FormData();
    formData.set("file", file);
    formData.set("hasHeader", form.get("hasHeader") ? "true" : "false");

    const result = await catchIfAny<BackendResult<FortuneCreateBulkResponse>>(
        fetch(`${reqsLocal.env.API_URL}/api/fortune/bulk`, {
            headers,
            method,
            body: form,
        }).then((res) => {
            return res.json();
        }),
    );

    if (result.isErr()) {
        return ErrorWrapper.fromError(result.error);
    }

    const backendResult = toResult(result.value);

    if (backendResult.isErr()) {
        if (backendResult.error.type === "NOT_LOGGED_IN") {
            return redirect("/admin/login");
        }
        return ErrorWrapper.fromBackendError(backendResult.error);
    }

    return backendResult.value.added
})