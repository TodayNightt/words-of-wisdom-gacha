
import { Err, Ok, type Result } from "ts-results-es";

export type ObjectValue<T> = T[keyof T];

export type Unit = "unit";

export const ErrorKind = {
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    NOT_LOGGED_IN: "NOT_LOGGED_IN",
} as const;

export type ErrorType = keyof typeof ErrorKind;




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

export function toResult<T>(result: BackendResult<T>): Result<T, BackendError> {
    if ('error' in result) {
        return new Err(result.error);
    }
    return new Ok(result.result);
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


export class ErrorWrapper extends Error {
    message: string;
    causes: string[];
    type: ErrorType; // Enforced type for error kind
    hasCause: boolean;

    constructor(message: string, causes: string[], type: ErrorType = ErrorKind.INTERNAL_SERVER_ERROR) {
        super(message);
        this.message = message;
        this.causes = causes;
        this.type = type; // Directly assign the type
        this.hasCause = causes.length !== 0;
    }

    static fromError(error: Error): ErrorWrapper {
        // FIXME: Handle potentially sensitive error information appropriately
        const causes = (error.cause?.errors as Error[]).map((a) => a.message);

        // Consider sanitizing error messages from external sources before exposing them:
        const sanitizedMessage = sanitizeErrorMessage(error.message);

        return new ErrorWrapper(sanitizedMessage.charAt(0).toUpperCase() + sanitizedMessage.slice(1), causes);
    }

    static fromBackendError(error: BackendError): ErrorWrapper {
        return new ErrorWrapper(error.message ?? "Unknown error", [], error.type);
    }
}

// Function to sanitize error messages (if necessary):
function sanitizeErrorMessage(message: string): string {
    // Implement your logic here to remove sensitive details from error messages
    // that should not be exposed to the user. This might involve redacting
    // specific error codes or database references.

    // Example (replace with your actual sanitization logic):
    return message.replace(/\d+/, 'XXX'); // Replace any digits with 'XXX' (placeholder for actual sanitization)
}



