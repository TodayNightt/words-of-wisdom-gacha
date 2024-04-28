import type { ParentProps } from "solid-js";

export default function FullWidthDiv(
	props: ParentProps & { tailwindCss?: string },
) {
	return <div class={`w-full ${props.tailwindCss}`}>{props.children}</div>;
}
