import { Select, Button } from "@kobalte/core";
import "./style.css";
import { Show, createSignal } from "solid-js";
import { FaSolidCaretLeft } from "solid-icons/fa";

type SelectProps = {
	options?: Array<string>;
	label: string;
	defaultValue?: string;
	formName?: string;
	zIndex?: number;
};

export default function SelectWrapper(props: SelectProps) {
	const zIndex = props.zIndex ? `z-${props.zIndex}` : "z-5";

	return (
		<Show when={props.options && props.defaultValue}>
			<Select.Root
				class="flex items-center gap-2"
				name={props.formName}
				defaultValue={props.defaultValue}
				options={props.options ?? []}
				placeholder="Select"
				itemComponent={(props) => (
					<Select.Item item={props.item} class="select__item">
						<Select.ItemLabel>
							{props.item.rawValue === "add" ? (
								<Button.Root class="p-4 rounded-xl bg-slate-200">
									Add
								</Button.Root>
							) : (
								props.item.rawValue
							)}
						</Select.ItemLabel>

						{/* <Select.ItemIndicator class="select__item-indicator">
						<CheckIcon />
					</Select.ItemIndicator> */}
					</Select.Item>
				)}
			>
				<Select.HiddenSelect />
				<Select.Label class="flex text-m font-bold w-1/5 justify-end">
					{props.label}
				</Select.Label>
				<Select.Trigger
					class="inline-flex items-center justify-between w-52 rounded-md p-3 bg-white"
					aria-label={props.formName}
				>
					<Select.Value class="">
						{(state) => state.selectedOption()}
					</Select.Value>
					<Select.Icon class="transition-transform ease-out duration-300 ui-expanded:-rotate-90">
						<FaSolidCaretLeft />
					</Select.Icon>
				</Select.Trigger>
				<Select.Portal>
					<Select.Content
						class={`bg-white rounded-md border border-white ${zIndex}`}
					>
						<Select.Listbox class="select__listbox" />
					</Select.Content>
				</Select.Portal>
			</Select.Root>
		</Show>
	);
}
