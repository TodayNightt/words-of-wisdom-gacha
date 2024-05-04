import { useSubmission } from "@solidjs/router";
import FormResult from "./FormResult";
import { createFortune } from "~/lib/fortune-data";
import CollectionPicker from "./CollectionPicker";
import Button from "../ButtonWrapper";
import TextWrapper from "../TextFieldWrapper";
import { onCleanup } from "solid-js";

export default function FortuneCreateSingleContent() {
	const createSubmission = useSubmission(createFortune);

	onCleanup(() => {
		createSubmission.clear;
	});
	return (
		<>
			<FormResult result={createSubmission.result}>
				{(data) => (
					<h1>
						Create successfully with id :{" "}
						<span class="font-bold">{data.result}</span>
					</h1>
				)}
			</FormResult>
			<form
				action={createFortune}
				method="post"
				class="flex gap-4 flex-col px-4"
			>
				<CollectionPicker needLabel={true} editable={true} />

					<TextWrapper
						type={"textarea"}
						tailwind="flex-grow"
						name="fortune"
						label="Fortune :"
						disabled={false}
					/>

				<div class="flex justify-center mt-2">
					<Button
						color="bg-blue-200 hover:bg-blue-300"
						tailwindClass="w-1/2"
						type="submit"
					>
						Add
					</Button>
				</div>
			</form>
		</>
	);
}
