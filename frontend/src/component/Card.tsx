import { FaRegularTrashCan, FaSolidPaintbrush } from "solid-icons/fa";
import { For, Show } from "solid-js";
import { isServer } from "solid-js/web";
import Button from "./ButtonWrapper";

type CardProps<T> = {
	data: T;
	deleteCallback: (id: string) => void;
	editCallback: (id: string) => void;
	tagsClickCallback: (tagName: string) => void;
};

export default function Card<
	T extends { title: string; id: string; tags?: string[] },
>(props: CardProps<T>) {
	return (
		<div class="container p-4 rounded-xl bg-white flex justify-between items-center">
			<div class="flex gap-4 items-center flex-wrap sm:w-2/5">
				<h2>{props.data.title}</h2>
				<Show when={props.data.tags}>
					<For each={props.data.tags}>
						{(item) => {
							return (
								<Button
									tailwindClass="text-sm"
									onClick={() => props.tagsClickCallback(item)}
								>
									{item}
								</Button>
							);
						}}
					</For>
				</Show>
			</div>
			<div class="flex gap-3 flex-wrap lg:w-fit sm:w-1/6">
				<Button onClick={() => props.editCallback(props.data.id)}>
					<FaSolidPaintbrush />
				</Button>
				<Button onClick={() => props.deleteCallback(props.data.id)}>
					<FaRegularTrashCan />
				</Button>
			</div>
		</div>
	);
}
