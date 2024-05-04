import { type Result, Err, Ok } from "ts-results-es";
import type { BackendResult, BackendError } from "./types";

export const ErrorKind = {
    DEFAULT: "INTERNAL_SERVER_ERROR",
    LOGIN_FAIL: "LOGIN_FAIL",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    NOT_LOGGED_IN: "NOT_LOGGED_IN",
} as const;

export type ErrorType = typeof ErrorKind[keyof typeof ErrorKind];

export function toResult<T>(result: BackendResult<T>): Result<T, BackendError> {
    if ('error' in result) {
        return new Err(result.error);
    }
    return new Ok(result.result);
}