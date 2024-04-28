import { collectionList, createCollection } from "~/lib/collection-data";
import Combo from "../Combox";
import {
	type Accessor,
	createEffect,
	createMemo,
	createSignal,
	createComputed,
	Suspense,
	Show,
	type Setter,
} from "solid-js";
import { Button, Popover } from "@kobalte/core";
import { FaRegularTrashCan, FaSolidPlus } from "solid-icons/fa";
import { createAsync, useAction } from "@solidjs/router";
import DeletePopover from "./DeletePopover";
import FullWidthDiv from "../FullWidthDiv";

type CollectionPickerProps = {
	editable: boolean;
	defaultValue?: string;
	getValue?: Setter<string | undefined>;
	needLabel: boolean;
	center?: boolean;
};

export default function CollectionPicker(props: CollectionPickerProps) {
	let addButtonRef!: HTMLButtonElement;
	let deleteButtonRef!: HTMLButtonElement;
	const createCollectionAction = useAction(createCollection);
	const collections = createAsync(() => collectionList(), { initialValue: [] });

	const [openPopover, setOpenPopover] = createSignal(false);

	//#region : validation

	const [validationInput, setValidationInput] = createSignal<string>("");
	const validation: Accessor<"valid" | "invalid"> = createMemo(() => {
		if (!collections().includes(validationInput())) {
			return "invalid";
		}
		return "valid";
	});

	createEffect(() => {
		if (!props.editable) return;
		if (validation() === "invalid") {
			addButtonRef.disabled = false;
			deleteButtonRef.disabled = true;
		} else {
			addButtonRef.disabled = true;
			deleteButtonRef.disabled = false;
		}
	});

	//#endregion : validation

	//#region : combo value control
	const [useParent, setUseParent] = createSignal(false);
	const [comboValue, setComboValue] = createSignal<string>("");

	createComputed(() => {
		setComboValue(props.defaultValue ?? "");
		setUseParent(true);
	});

	createComputed(() => {
		if (props.getValue) {
			props.getValue(comboValue());
		}
	});

	//#endregion : combo value control

	const handleCreate = async () => {
		await createCollectionAction(validationInput());
		// In this current iteration the order of `setComboValue` and `setUseParent` matters
		setComboValue(validationInput());
		setUseParent(true);
	};

	const handleDeleteBtn = () => {
		setOpenPopover(true);
	};

	return (
		<Popover.Root open={openPopover()} onOpenChange={setOpenPopover}>
			<Popover.Anchor>
				<FullWidthDiv
					tailwindCss={`flex gap-4 items-center flex-wrap ${
						props.center ? "justify-center" : ""
					}`}
				>
					<Suspense fallback={<div>Loading...</div>}>
						<Combo
							useGivenValue={{
								value: useParent,
								setter: setUseParent,
							}}
							setValue={setComboValue}
							value={comboValue}
							inputChangeSetter={setValidationInput}
							placeholder="Collection"
							options={collections()}
							formName="collection"
							zIndex={50}
							label={
								props.needLabel
									? { label: "Collections :", vertical: true }
									: undefined
							}
						/>
					</Suspense>
					<Show when={props.editable}>
						<div class="flex gap-4 ml-4">
							<Button.Root
								// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
								ref={(el) => (addButtonRef = el)}
								onClick={handleCreate}
								class="rounded-xl bg-slate-300 disabled:opacity-30 over:bg-slate-100"
								disabled
							>
								<FaSolidPlus class="m-4" />
							</Button.Root>
							<Button.Root
								// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
								ref={(el) => (deleteButtonRef = el)}
								onClick={handleDeleteBtn}
								class="rounded-xl bg-slate-300 disabled:opacity-30 over:bg-slate-100"
							>
								<FaRegularTrashCan class="m-4" />
							</Button.Root>
						</div>
					</Show>
				</FullWidthDiv>
			</Popover.Anchor>
			<Show when={props.editable}>
				<Popover.Portal>
					<Popover.Content class="z-50 max-w-xs sm:max-w-md border border-gray-200 rounded-md p-4 bg-white shadow-md">
						<Popover.Arrow />
						<DeletePopover
							popoverCloser={setOpenPopover}
							toDelete={validationInput()}
						/>
					</Popover.Content>
				</Popover.Portal>
			</Show>
		</Popover.Root>
	);
}
