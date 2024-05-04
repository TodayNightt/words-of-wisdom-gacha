import type { ErrorType } from "./error";

export type Unit = "unit";

export type BackendError = {
    type: ErrorType,
    req_uuid: string,
    message?: string,
}

export type BackendResult<T> = {
    result: T
} | {
    error: BackendError,
}

export type LoginResponse = {
    success: true,
    token: string,
}

export type LogoffResponse = Pick<LoginResponse, "success">;


export type FortuneInfo = Readonly<{
    id: string,
    fortune: string
    collectionName: string
}>

export type FortuneCreateResponse = Pick<FortuneInfo, "id">;

export type FortuneCreateBulkResponse = {
    added: Array<string>,
}

export type FortuneListResponse = {
    list: Array<FortuneInfo>
}

export type FortuneEditResponse = Pick<FortuneInfo, "id">;

export type FortuneDeleteResponse = {
    id: string
}

export type FortuneCountResponse = Pick<FortuneInfo & Readonly<{ count: number }>, "collectionName" | "count">;

export type FortuneRandomResponse = Pick<FortuneInfo, "fortune" | "collectionName">



export type CollectionInfo = Readonly<{
    id: string,
    collectionName: string,
}>;

export type CreateCollectionResponse = Pick<CollectionInfo & Readonly<{ created: true }>, "id" | "created">;

export type CollectionName = string;

export type CollectionList = {
    list: Array<CollectionName>
}

export type DeleteCollectionRespose = {
    success: true,
    deletedCollectionName: string,
    affected?: number,
    changeCollectionName?: string,
}










