import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
    middleware: "./src/middleware.ts",
    server: {
        prerender: {
            routes: ["/", "/admin/login"],
            crawlLinks: true
        }
    }
});
