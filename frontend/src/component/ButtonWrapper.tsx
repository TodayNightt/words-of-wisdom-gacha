import type { FlowProps } from "solid-js";
import { Button as KobalBtn } from "@kobalte/core";

type ButtonProps = FlowProps & {
	onClick?: () => void;
	color?: string;
	type?: HTMLButtonElement["type"];
	tailwindClass?: string;
};
export default function Button(props: ButtonProps) {
	return (
		<KobalBtn.Root
			onClick={props.onClick}
			class={`rounded-xl px-4 py-2  ${
				props.color ? props.color : "bg-slate-100 hover:bg-slate-300"
			} ${props.tailwindClass}`}
			type={props.type}
		>
			{props.children}
		</KobalBtn.Root>
	);
}
