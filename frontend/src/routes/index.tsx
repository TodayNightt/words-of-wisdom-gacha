import { Button } from "@kobalte/core";
import { Title } from "@solidjs/meta";
import { createAsync, type RouteDefinition } from "@solidjs/router";
import { Show } from "solid-js";
import CenterDiv from "~/component/CenterDiv";
// import DialogParent from "~/component/Dialog";
import FullHeightMain from "~/component/FullHeightMain";
import DialogProvider, { useDialog } from "~/context/DialogContext";

export default function Home() {
	const { openDialog, store } = useDialog();
	return (
		<>
			<Title>Ah ma Fortune</Title>
			<FullHeightMain>
				<CenterDiv tailwindClass="w-full bg-slate-200">
					<DialogProvider>
						<Button.Root
							class="rounded-xl bg-slate-100 p-2 hover:bg-slate-300"
							onClick={() => openDialog()}
						>
							Click Me
						</Button.Root>
					</DialogProvider>

					{/* <Show when={store.isOpen}></Show> */}
				</CenterDiv>
			</FullHeightMain>
		</>
	);
}
