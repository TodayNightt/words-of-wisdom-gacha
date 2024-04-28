import { Button } from "@kobalte/core";
import { createAsync, useSubmission } from "@solidjs/router";
import {
	Suspense, type JSX, lazy
} from "solid-js";

import { useDialog } from "~/context/DialogContext";
import { editFortune, getFortuneInfo } from "~/lib/fortune-data";
import FormResult from "./FormResult";
import CollectionPicker from "./CollectionPicker";
import TextFieldWrapper from "../TextFieldWithGrid";

const CenterDiv = lazy(() => import("../CenterDiv"));
const FullWidthDiv = lazy(() => import("../FullWidthDiv"));
const SelectWrapper = lazy(() => import("../SelectWrapper"));

export default function DialogEdit(): JSX.Element {
	const { store } = useDialog();
	const editResult = useSubmission(editFortune);
	const data = createAsync(() => getFortuneInfo(store.itemId ?? ""), {
		initialValue: {
			id: store.itemId ?? "",
			fortune: "",
			collection: "",
		},
	});

	return (
		<>
			{/* <Dialog.Content class="z-50 border border-solid rounded-xl bg-gray-50 w-2/5 h-3/5 sm:w-4/5 xl:w-2/5"> */}
			<FormResult
				height="h-1/5"
				responsiveWidth="w-4/5"
				result={editResult.result}
			>
				{(_data) => <h1>Edit success</h1>}
			</FormResult>
			<Suspense fallback={<div>Loading</div>}>
				<div class="container px-4 flex-grow flex justify-center">
					<form
						action={editFortune}
						method="post"
						class="flex gap-4 flex-col px-4"
					>
						<TextFieldWrapper
							defaultValue={store.itemId ?? undefined}
							name="id"
							label="Internal ID :"
							disabled={true}
						/>

						<Suspense fallback={<div>Loading</div>}>
							<CollectionPicker
								needLabel={true}
								editable={true}
								defaultValue={data().collection}
							/>
						</Suspense>

						<TextFieldWrapper
							defaultValue={data().fortune}
							name="fortune"
							label="Fortune :"
							disabled={false}
						/>

						<div class="flex justify-center mt-2">
							<Button.Root
								class="rounded-xl p-2 bg-blue-200 w-1/2 hover:bg-blue-300"
								type="submit"
							>
								Edit
							</Button.Root>
						</div>
					</form>
				</div>
				{/* </CenterDiv> */}
			</Suspense>
			{/* </Dialog.Content> */}
		</>
	);
}
