import { action, cache, redirect, reload } from "@solidjs/router";
import { type BackendResult, ErrorWrapper, toResult, type CollectionList, type CreateCollectionResponse, type Unit, type DeleteCollectionRespose } from "./types";
import { catchIfAny } from "~/utils/catch-if-any";
import { API_SERVER } from "./login";
import { getSession } from "./session";
import { getFortuneInfo, listFortune } from "./fortune-data";

export const collectionList = cache(async () => {
    "use server";

    const session = await getSession();

    if (!session.data.jwtToken) {
        return redirect("/admin/login")
    }
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session.data.jwtToken}`);

    const result = await catchIfAny<BackendResult<CollectionList>>(fetch(`${API_SERVER}/api/collections/list`, { headers }).then(res => res.json()));

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

    const session = await getSession();

    if (!session.data.jwtToken) {
        return redirect("/admin/login")
    }
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session.data.jwtToken}`);

    const body = JSON.stringify({
        collectionName
    })

    const method = "post"

    const result = await catchIfAny<BackendResult<CreateCollectionResponse>>(fetch(`${API_SERVER}/api/collections/create`, { headers, body, method }).then(res => res.json()));

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

    const session = await getSession();

    if (!session.data.jwtToken) {
        return redirect("/admin/login")
    }
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session.data.jwtToken}`);

    const body = JSON.stringify({
        toDeleteCollectionName: collectionName,
        swapToCollectionName: swapTo,
    })

    const method = "delete"

    const url = `${API_SERVER}/api/collections/delete?swap=${Boolean(swapTo)}`

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