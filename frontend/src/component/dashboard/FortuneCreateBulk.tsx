import { Checkbox } from "@kobalte/core";
import { createFortuneBulk } from "~/lib/fortune-data";
import Button from "../ButtonWrapper";
import { FaSolidCheck } from "solid-icons/fa";
import { useSubmission } from "@solidjs/router";
import FormResult from "./FormResult";

export default function CreateBulkContent() {
	const submissionResult = useSubmission(createFortuneBulk);
	return (
		<div class="flex flex-col gap-8 py-4">
			<FormResult result={submissionResult.result}>
				{(data) => <div>Create {data.length} fortunes</div>}
			</FormResult>
			<form
				action={createFortuneBulk}
				method="post"
				class="flex gap-4 flex-col px-4 size-full items-center"
			>
				<div class="flex gap-8 ">
					<label for="file" class="label-style">
						File :
					</label>
					<input
						type="file"
						name="file"
						accept="text/csv"
						class="flex"
						id="file"
					/>
				</div>

				<Checkbox.Root name="hasHeader" class="flex items-center gap-8">
					<Checkbox.Label class="ml-2 label-style text-gray-900 font-medium">
						Has header :
					</Checkbox.Label>
					<Checkbox.Input class="checkbox__input" />
					<Checkbox.Control class="h-6 w-6 rounded-md border border-gray-300 bg-gray-200">
						<Checkbox.Indicator class="flex justify-center items-center size-full">
							<FaSolidCheck />
						</Checkbox.Indicator>
					</Checkbox.Control>
				</Checkbox.Root>
				<Button
					color="bg-blue-200 hover:bg-blue-300"
					tailwindClass="w-1/2"
					type={"submit"}
				>
					Submit
				</Button>
			</form>
		</div>
	);
}
