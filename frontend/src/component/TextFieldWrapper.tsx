import { TextField } from "@kobalte/core";
import { Match, Switch, createMemo } from "solid-js";

type TextFieldWithGridProps = {
	defaultValue?: string;
	name: string;
	label: string;
	disabled: boolean;
	type: "textfield" | "textarea";
	tailwind?: string;
};

export default function TextWrapper(props: TextFieldWithGridProps) {
	const defaultVal = createMemo(() => props.defaultValue);
	return (
		<TextField.Root
			defaultValue={defaultVal()}
			name={props.name}
			class={`flex items-center gap-4 flex-wrap ${
				props.disabled ? "pointer-events-none" : ""
			} ${props.tailwind}`}
		>
			<TextField.Label class="flex label-style min-w-24 md:justify-end sm:justify-start">
				{props.label}
			</TextField.Label>
			<Switch>
				<Match when={props.type === "textfield"}>
					<TextField.Input
						value={defaultVal()}
						placeholder={props.name}
						class={"rounded-xl px-4 py-2 font-medium min-w-[17.5rem]"}
					/>
				</Match>
				<Match when={props.type === "textarea"}>
					<TextField.TextArea
						value={defaultVal()}
						placeholder={props.name}
						class="rounded-xl px-4 py-2 font-medium flex-grow h-4/5  min-w-[17.5rem]"
					/>
				</Match>
			</Switch>
		</TextField.Root>
	);
}
