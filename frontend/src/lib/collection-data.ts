import { action, cache, redirect, reload } from "@solidjs/router";
import type { BackendResult, CollectionList, CreateCollectionResponse, DeleteCollectionRespose } from "./types";
import { catchIfAny } from "~/utils/catch-if-any";
import { getFortuneInfo, listFortune } from "./fortune-data";
import { ErrorWrapper } from "~/utils/error-wrapper";
import { toResult } from "./error";
import { getRequestEvent } from "solid-js/web";

export const collectionList = cache(async () => {
    "use server";

    const reqsLocal = getRequestEvent()?.locals;

    if (!reqsLocal?.sData?.jwtToken) {
        return redirect("/admin/login")
    }

    const session = reqsLocal.sData;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session?.jwtToken}`);

    const result = await catchIfAny<BackendResult<CollectionList>>(fetch(`${reqsLocal.env.API_URL}/api/collections/list`, { headers }).then(res => res.json()));

    if (result.isErr()) {
        throw ErrorWrapper.fromError(result.error);
    }

    const backendResult = toResult(result.value);

    if (backendResult.isErr()) {
        if (backendResult.error.type === "NOT_LOGGED_IN") {
            return redirect("/admin/login");
        }
        throw ErrorWrapper.fromBackendError(backendResult.error);
    }

    return backendResult.value.list;
}, "collectionList")

export const createCollection = action(async (collectionName: string) => {
    "use server";

    const reqsLocal = getRequestEvent()?.locals

    if (!reqsLocal?.sData?.jwtToken) {
        return redirect("/admin/login")
    }

    const session = reqsLocal.sData
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session?.jwtToken}`);

    const body = JSON.stringify({
        collectionName
    })

    const method = "post"

    const result = await catchIfAny<BackendResult<CreateCollectionResponse>>(fetch(`${reqsLocal.env.API_URL}/api/collections/create`, { headers, body, method }).then(res => res.json()));

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

    return reload({ revalidate: collectionList.key });
})

export const deleteCollection = action(async (
    collectionName: string,
    swapTo: string | null = null,
) => {
    "use server";

    const reqsLocal = getRequestEvent()?.locals

    if (!reqsLocal?.sData?.jwtToken) {
        return redirect("/admin/login")
    }
    const session = reqsLocal.sData
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session?.jwtToken}`);

    const body = JSON.stringify({
        toDeleteCollectionName: collectionName,
        swapToCollectionName: swapTo,
    })

    const method = "delete"

    const url = `${reqsLocal.env.API_URL}/api/collections/delete?swap=${Boolean(swapTo)}`

    const result = await catchIfAny<BackendResult<DeleteCollectionRespose>>(fetch(url, { headers, body, method }).then(res => res.json()));

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

    return reload({ revalidate: [listFortune.key, collectionList.key, getFortuneInfo.key] })
})