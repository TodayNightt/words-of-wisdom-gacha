// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { MetaProvider } from "@solidjs/meta";
import { Environment } from "./environments";

export default function App() {
	Environment.getInstance();
	return (
		<Router
			root={(props) => (
				<>
					<MetaProvider>
						<Suspense>{props.children}</Suspense>
					</MetaProvider>
				</>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
