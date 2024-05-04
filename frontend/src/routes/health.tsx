import { createAsync } from "@solidjs/router";
import { ErrorBoundary } from "solid-js";
import ErrorPage from "~/component/ErrorPage";
import { API_SERVER } from "~/lib/api-server_url";

async function getHello() : Promise<string> {
    "use server";

    return await fetch(`${API_SERVER}/server/health`).then((res)=> res.json())
}

export default function Health() {
    const res = createAsync(getHello);
    return <Suspense><h1>{ res()}</h1></Suspense>
}