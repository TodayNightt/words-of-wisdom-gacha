import { Alert } from "@kobalte/core";
import {
	Match, Switch,
	Show, For,
	lazy, createMemo,
	children, type JSX
} from "solid-js";
import type { ErrorWrapper } from "~/lib/types";

const FullWidthDiv = lazy(() => import("../FullWidthDiv"));

type FormResultProps<T> = {
	responsiveWidth?: string;
	height?: string;
	result?: T | ErrorWrapper;
	children?: (data: T) => JSX.Element;
	// pendingState: boolean;
};

export default function FormResult<T>(props: FormResultProps<T>) {
	// const [isSubmitted, setIsSubmitted] = createSignal(false);

	const checkResult = createMemo(() => {
		if (!props.result) {
			return undefined;
		}
		if (props.result instanceof Error) {
			console.log(props.result);
			return {
				result: {
					success: false,
					err: props.result as ErrorWrapper,
				},
			};
		}
		return {
			result: {
				success: true,
				value: props.result as T,
			},
		};
	});

	// createComputed(() => {
	// 	if (props.pendingState) {
	// 		setIsSubmitted(true);
	// 	}
	// });

	const childrenContent = children(() => {
		return (
			checkResult()?.result.success &&
			props.children?.(checkResult()?.result.value as T)
		);
	});

	return (
		<Show when={checkResult()}>
			<div class={`${props.height} ${props.responsiveWidth}`}>
				<Switch>
					<Match when={!checkResult()?.result.success}>
						<Alert.Root class="h-full flex flex-col justify-center items-center border-4 border-dashed rounded-xl p-4 w-full border-red-400 bg-red-200 bg-opacity-40">
							<h1 class="font-bold text-xl flex justify-start w-full">
								{checkResult()?.result.err?.message}
							</h1>
							<Show when={checkResult()?.result.err?.hasCause}>
								<FullWidthDiv tailwindCss="pl-8 overflow-y-scroll">
									<ul class="list-disc">
										<For each={checkResult()?.result.err?.causes}>
											{(cause, index) => (
												<li class="font-bold text-base">{cause}</li>
											)}
										</For>
									</ul>
								</FullWidthDiv>
							</Show>
						</Alert.Root>
					</Match>
					<Match when={checkResult()?.result.success}>
						<Alert.Root class="h-full flex flex-col justify-center items-center border-4 border-dashed rounded-xl p-4 w-full border-green-400 bg-green-200 bg-opacity-40">
							{childrenContent()}
						</Alert.Root>
					</Match>
				</Switch>
			</div>
		</Show>
	);
}
