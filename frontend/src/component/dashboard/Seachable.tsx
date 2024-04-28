import { TextField } from "@kobalte/core";
import { FaSolidPlus } from "solid-icons/fa";
import { DialogMode, useDialog } from "~/context/DialogContext";
import { useFilter } from "~/context/FilterContext";
import Button from "../ButtonWrapper";
import { Portal } from "solid-js/web";

export default function Seachable() {
	const { openDialog } = useDialog();
	const { store, setFilter } = useFilter();

	const handleClearFilter = () => {
		setFilter("");
	};

	const handleAddBtn = () => {
		openDialog(DialogMode.Create);
	};
	return (
		<div class="flex justify-between md:px-8 py-2 items-center box-border sm:px-2">
			<div class="flex gap-4 items-center flex-wrap flex-grow sm:gap-2">
				<TextField.Root
					onChange={setFilter}
					value={store.filter}
					class="md:w-3/5 sm:w-3/5"
				>
					<TextField.Input
						placeholder="search"
						class="rounded-3xl w-full md:px-4 md:py-2 sm:p-2"
					/>
				</TextField.Root>
				<Button onClick={handleClearFilter}>Clear filter</Button>
			</div>

			<div>
				<Button
					onClick={handleAddBtn}
					tailwindClass="flex gap-4 justify-center items-center md:flex sm:hidden"
				>
					<span>Create</span>
					<FaSolidPlus />
				</Button>
			</div>

			<Portal>
				<Button
					onClick={handleAddBtn}
					tailwindClass="absolute flex gap-4 justify-center items-center md:hidden sm:block"
				>
					<FaSolidPlus />
				</Button>
			</Portal>
		</div>
	);
}
