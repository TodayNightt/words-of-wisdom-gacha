import { createAsync } from "@solidjs/router";
import { Suspense } from "solid-js";
import { API_SERVER } from "~/lib/login";

async function getHello() : Promise<string> {
    "use server";

    return await fetch(`${API_SERVER}/server/health`).then((res)=> res.json())
}

export default function Health() {
    const res = createAsync(getHello);
    return <Suspense><h1>{ res()}</h1></Suspense>
}