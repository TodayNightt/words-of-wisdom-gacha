import { createMiddleware } from "@solidjs/start/middleware";
import { mwEnvironments } from "./environments";
import { mwGetSession } from "./lib/session";

export default createMiddleware({
    onRequest: [mwEnvironments, mwGetSession]
});