import { redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";

//https://github.com/wmalarski/solid-puzzle/blob/master/src/server/utils.ts
export const getRequestEventOrThrow = () => {
    const event = getRequestEvent();

    if (!event) {
        throw redirect("/404", { status: 500 });
    }

    return event;
};