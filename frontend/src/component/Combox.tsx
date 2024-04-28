import { Combobox } from "@kobalte/core";
import { FaSolidCaretLeft, FaSolidCheck } from "solid-icons/fa";
import type { Accessor, Setter } from "solid-js";
import {
	Show,
	createComputed,
	createEffect,
	createMemo,
	createSignal,
	onMount,
	splitProps,
} from "solid-js";
import FullWidthDiv from "./FullWidthDiv";

type ComboProps = {
	options?: Array<string>;
	useGivenValue?: {
		value: Accessor<boolean>;
		setter: Setter<boolean>;
	};
	value?: Accessor<string>;
	setValue?: Setter<string>;
	inputChangeSetter?: Setter<string>;
	defaultValue?: string;
	formName?: string;
	zIndex?: number;
	placeholder: string;
	label?: {
		label: string;
		vertical: boolean;
	};
};

export default function Combo(props: ComboProps) {
	const [valueProp, other] = splitProps(props, [
		"value",
		"useGivenValue",
		"setValue",
	]);
	const [value, setValue] = createSignal("");
	const zIndex = other.zIndex ? `z-${other.zIndex}` : "z-5";

	createComputed(() => {
		if (valueProp.value && valueProp.useGivenValue?.value()) {
			// FIXME : make this more readable
			// 		   In this current iteration the order of both
			//		   `setValue` and `valueProp.useGivenValue.setter` matters
			//		   as they are in the same dependency tracking scope
			setValue(valueProp.value());
			valueProp.useGivenValue.setter(false);
		}
	});

	createComputed(() => {
		if (valueProp.setValue) {
			valueProp.setValue(value());
		}
	});

	return (
		<Combobox.Root
			class={`flex gap-4 items-center w-30 flex-wrap ${
				other.label?.vertical ? "flex-row" : "flex-col"
			}`}
			value={value()}
			onChange={setValue}
			onInputChange={other.inputChangeSetter}
			options={other.options ?? []}
			defaultValue={other.defaultValue}
			name={other.formName}
			placeholder={other.placeholder}
			disallowEmptySelection={true}
			itemComponent={(props) => (
				<Combobox.Item
					item={props.item}
					class="flex items-center justify-between h-10 px-2 rounded-md text-gray-700 hover:bg-gray-100 select-none focus:outline-none"
				>
					<Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
					<Combobox.ItemIndicator class="h-8 w-8 flex items-center justify-center">
						<FaSolidCheck />
					</Combobox.ItemIndicator>
				</Combobox.Item>
			)}
		>
			<Combobox.HiddenSelect />
			<Combobox.Label class="flex label-style min-w-24  md:justify-end sm:justify-start">
				{props.label?.label}
			</Combobox.Label>
			<Combobox.Control class="flex justify-between rounded-md px-4 py-2 border border-gray-300 text-gray-700 focus:outline-none">
				<Combobox.Input class="appearance-none flex-grow focus:outline-none rounded-l-md pl-4" />
				<Combobox.Trigger class="flex items-center justify-center rounded-r-md py-2 px-4 text-gray-700 hover:bg-gray-100">
					<Combobox.Icon class="flex items-center ">
						<FaSolidCaretLeft />
					</Combobox.Icon>
				</Combobox.Trigger>
			</Combobox.Control>
			<Combobox.Portal>
				<Combobox.Content
					class={`bg-white rounded-md border border-gray-300 shadow-sm ${zIndex}`}
				>
					<Combobox.Listbox class="overflow-y-auto max-h-[240px] p-4 focus:outline-none" />
				</Combobox.Content>
			</Combobox.Portal>
		</Combobox.Root>
	);
}
