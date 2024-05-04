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

export type LogoffResponse = {
    success: true
}

export type FortuneDeleteResponse = {
    id: string
}

export type FortuneInfo = {
    id: string,
    fortune: string
    collection: string
}

export type FortuneList = {
    list: Array<FortuneInfo>
}

export type EditResponse = {
    id: string
}

export type FortuneCountResponse = {
    collectionName: string,
    count: number
}

export type CollectionList = {
    list: Array<CollectionName>
}

export type CollectionEntity = {
    id: string,
    collectionName: string,
}

export type CollectionName = string

export type FortuneCreateResponse = {
    id: string
}

export type FortuneCreateBulkResponse = {
    added: string[]
}


export type CreateCollectionResponse = {
    created: true,
    id: string
}

export type DeleteCollectionRespose = {
    success: true,
    deletedCollectionName: string,
    affected?: number,
    changeCollectionName?: string,
}










