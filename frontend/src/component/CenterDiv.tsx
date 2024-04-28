import type { ParentProps } from "solid-js";

export default function CenterDiv(
	props: ParentProps & { tailwindClass?: string },
) {
	return (
		<div
			class={`flex justify-center items-center h-full ${
				props.tailwindClass ?? ""
			}`}
		>
			{props.children}
		</div>
	);
}
