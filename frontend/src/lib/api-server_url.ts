import { getRequestEvent } from "solid-js/web";

export const API_SERVER = getRequestEvent()?.locals.env.API_URL ?? "";