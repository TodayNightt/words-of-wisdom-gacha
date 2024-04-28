import { For, createEffect, createSignal } from "solid-js";
import {
	type UploadFile,
	fileUploader,
	createFileUploader,
} from "@solid-primitives/upload";
import { createFortuneBulk } from "~/lib/fortune-data";

export default function Dropper() {
	const { files, selectFiles } = createFileUploader({ accept: "text/csv" });
	return (
		<button
			type="button"
			onClick={() => {
				selectFiles(async ([{ source, name, size, file }]) => {
					"use server";

					console.log({ source, name, size, file });
				});
			}}
		>
			Select
		</button>
	);
}
