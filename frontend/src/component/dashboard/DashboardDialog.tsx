import { Dialog } from "@kobalte/core";
import { FaRegularCircleXmark } from "solid-icons/fa";
import { Suspense, Show, Switch, Match, lazy } from "solid-js";
import { DialogMode, useDialog } from "~/context/DialogContext";
import CreateDialog from "./DialogCreate";
import CenterDiv from "../CenterDiv";
import FullWidthDiv from "../FullWidthDiv";
import DialogEdit from "./DialogEdit";

//	Edit: 0,
// Create: 1,
// Alert: 2,
// DeleteAlert: 3,
// Nothing: 5,
const MODE_TITLE = [
	"Edit Dialog",
	"Create Dialog",
	"Alert",
	"Delete Alert",
	"Nothing",
];

export default function DialogParent() {
	const { store, closeDialog } = useDialog();

	return (
		<Show when={store.isOpen}>
			<Dialog.Root defaultOpen>
				<Dialog.Portal>
					<Dialog.Overlay class="fixed inset-0 z-30 blur-3xl bg-opacity-40 bg-white" />
					<Suspense fallback={<div>Loading</div>}>
						<div class="fixed inset-0 z-50 flex items-center justify-center">
							<Dialog.Content class="z-50 border border-solid rounded-xl bg-gray-50 md:w-3/5 h-4/5 sm:w-4/5">
								<CenterDiv tailwindClass="flex flex-col gap-4">
									<FullWidthDiv tailwindCss="p-8 col-span-3 flex justify-between items-center">
										<Dialog.Title class="text-3xl font-bold">
											{MODE_TITLE[store.mode]}
										</Dialog.Title>
										<Dialog.CloseButton
											onClick={closeDialog}
											class="p-3 flex justify-center items-center rounded-xl hover:bg-slate-200"
										>
											<FaRegularCircleXmark class="size-6" />
										</Dialog.CloseButton>
									</FullWidthDiv>
									<Switch>
										<Match when={store.mode === DialogMode.Edit}>
											<DialogEdit />
										</Match>
										<Match when={store.mode === DialogMode.Create}>
											<CreateDialog />
										</Match>
									</Switch>
								</CenterDiv>
							</Dialog.Content>
						</div>
					</Suspense>
				</Dialog.Portal>
			</Dialog.Root>
		</Show>
	);
}
