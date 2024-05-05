import { getRequestEventOrThrow } from "~/utils/get-request-event";

export const API_SERVER = getRequestEventOrThrow().locals.env.API_URL;