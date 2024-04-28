

//https://gist.github.com/karlhorky/3593d8cd9779cf9313f9852c59260642

import { Err, Ok, type Result } from "ts-results-es";

type FetchResult<Ok> = Result<Ok, Error>;

export async function catchIfAny<Ok>(
    promise: Promise<Ok>
): Promise<FetchResult<Ok>> {
    try {
        return new Ok(await promise);
    } catch (error) {
        const err = error as Error;
        return new Err(err);
    }
}