import type { RouteSectionProps } from "@solidjs/router";
import { lazy } from "solid-js";
import DashboardContextProvider from "~/context/DashboardContext";
import DialogProvider from "~/context/DialogContext";

const FullHeightMain = lazy(() => import("~/component/FullHeightMain"));

export default function AdminLayout(props: RouteSectionProps) {
	return (
		<DashboardContextProvider>
			<DialogProvider>
				<FullHeightMain tailwind="size-full p- flex-col gap-3 box-border bg-background">
					{props.children}
				</FullHeightMain>
			</DialogProvider>
		</DashboardContextProvider>
	);
}
