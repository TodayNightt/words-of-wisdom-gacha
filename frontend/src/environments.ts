import { z } from "zod";

const env = z.object({
    SESSION_SECRET: z.string().min(30, "SESSION_SECRET are not long enough"),
    API_URL: z.string().default("http://localhost:51000"),
});


export class Environment {
    static instance: Environment;

    env: z.infer<typeof env>

    constructor() {
        const parsedResult = env.safeParse(process.env);
        if (!parsedResult.success) {
            console.error(parsedResult.error.issues)
            process.exit(1)
        }

        this.env = parsedResult.data;
    }


    static getInstance() {
        if (!Environment.instance) {
            Environment.instance = new Environment();
        }
        return Environment.instance
    }

    get(key: keyof z.infer<typeof env>): Readonly<string> {
        return this.env[key];
    }
}
