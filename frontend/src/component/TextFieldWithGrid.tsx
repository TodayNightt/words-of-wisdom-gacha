import { TextField } from "@kobalte/core";
import { createEffect, createMemo } from "solid-js";

type TextFieldWithGridProps = {
	defaultValue?: string;
	name: string;
	label: string;
	disabled: boolean;
};

export default function TextFieldWrapper(props: TextFieldWithGridProps) {
	const defaultVal = createMemo(() => props.defaultValue);
	return (
		<TextField.Root
			defaultValue={defaultVal()}
			name={props.name}
			class={`flex items-center gap-4 flex-wrap ${
				props.disabled ? "pointer-events-none" : ""
			}`}
		>
			<TextField.Label class="flex label-style min-w-24 md:justify-end sm:justify-start">
				{props.label}
			</TextField.Label>
			<TextField.Input
				value={defaultVal()}
				placeholder={props.name}
				class={"rounded-xl px-4 py-2 font-medium"}
			/>
		</TextField.Root>
	);
}
