import { Dialog } from "@kobalte/core";
import {
  ErrorBoundary,
  Show,
  createComputed, createResource,
  type Setter
} from "solid-js";
import { getRandom } from "~/lib/fortune-data";
import CenterDiv from "./CenterDiv";
import FullWidthDiv from "./FullWidthDiv";
import { FaRegularCircleXmark } from "solid-icons/fa";

type FortuneTellerDialogProps = {
	open: boolean;
	setOpen: Setter<boolean>;
	multiTime: boolean;
};
export default function FortuneTellerDialog(props: FortuneTellerDialogProps) {
	const [fortune, { refetch }] = createResource(getRandom);

	createComputed(() => {
		if (props.open && props.multiTime) {
			refetch();
		}
	});

	return (
		<Dialog.Root open={props.open} onOpenChange={props.setOpen}>
			<Dialog.Portal>
				<Dialog.Overlay class="fixed inset-0 z-30 blur-3xl bg-opacity-40 bg-white" />
				<div class="fixed inset-0 z-50 flex items-center justify-center">
					<Dialog.Content class="z-50 border border-solid rounded-xl bg-gray-50 md:w-3/5 h-4/5 sm:w-4/5">
						<CenterDiv tailwindClass="flex flex-col size-full">
							<Show when={!fortune.loading}>
								<FullWidthDiv tailwindCss="p-4 h-[5rem]">
									<Dialog.CloseButton class="p-3 flex justify-center items-center rounded-xl hover:bg-slate-200 float-right">
										<FaRegularCircleXmark class="size-6" />
									</Dialog.CloseButton>
								</FullWidthDiv>
								<div class="flex justify-center items-center size-full box-border">
									<ErrorBoundary fallback={<ErrorContent />}>
										<div class="grid grid-cols-4 grid-rows-[80%] bg-slate-200 rounded-xl gap-4 size-4/5 p-8 box-border overflow-y-scroll">
											<textarea
												class="md:text-5xl font-bold col-span-4 text-center items-center border-0 resize-none bg-transparent mx-8 box-border text-2xl"
												name="fortune"
												id="fortune"
												disabled
												textContent={fortune()?.fortune}
											/>
											<div class="md:col-start-3 col-start-2 md:col-span-2 col-span-3 md:text-2xl font-bold flex gap-4 text-xl">
												<div class="text-wrap box-border flex-grow flex justify-end">
													{"-- "}
												</div>
												<div class="flex-shrink mr-8 min-w-[7rem] ">
													{fortune()?.collectionName}
												</div>
											</div>
										</div>
									</ErrorBoundary>
								</div>
							</Show>
						</CenterDiv>
					</Dialog.Content>
				</div>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

function ErrorContent() {
	return (
		<div class="flex flex-col items-center gap-4 justify-center text-2xl font-bold">
			<h1>Something went wrong!</h1>
			<Dialog.CloseButton class="rounded-xl px-3 py-2 text-xl text-white bg-red-500 hover:bg-red-400">
				Try again
			</Dialog.CloseButton>
		</div>
	);
}
