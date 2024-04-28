import { createMiddleware } from "@solidjs/start/middleware";
import { getSession } from "./lib/session";
import { redirect } from "@solidjs/router";

export default createMiddleware({
    onRequest: [
        async (event) => {
            const session = await getSession(event.nativeEvent);

            if (!session.data.jwtToken) {
                redirect("/admin/login");
            }

        }
    ]
});