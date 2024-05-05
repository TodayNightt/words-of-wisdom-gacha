import { createAsync } from "@solidjs/router";
import { ErrorBoundary } from "solid-js";
import { getRequestEvent } from "solid-js/web";
import ErrorPage from "~/component/ErrorPage";
import { ErrorWrapper } from "~/utils/error-wrapper";

async function getHello(): Promise<string> {
	"use server";

	const reqsLocal = getRequestEvent()?.locals;

	if (!reqsLocal) {
		throw new ErrorWrapper("Unknown Error", []);
	}

	return await fetch(`${reqsLocal.env.API_URL}/server/health`).then((res) =>
		res.json(),
	);
}

export default function Health() {
	const res = createAsync(getHello);
	return (
		<ErrorBoundary fallback={<ErrorPage path="/health" />}>
			<h1>{res()}</h1>
		</ErrorBoundary>
	);
}
