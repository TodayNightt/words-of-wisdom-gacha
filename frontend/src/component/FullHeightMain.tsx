import type { ParentProps } from "solid-js";

export default function FullHeightMain(
	props: ParentProps & { tailwind?: string },
) {
	return <main class={`h-full ${props.tailwind}`}>{props.children}</main>;
}
