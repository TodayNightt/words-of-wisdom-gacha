import { Button, Popover } from "@kobalte/core";
import { createAsync, useAction } from "@solidjs/router";
import { Match, type Setter, Suspense, Switch, createSignal } from "solid-js";
import { getFortuneCountByCollection } from "~/lib/fortune-data";
import CollectionPicker from "./CollectionPicker";
import { deleteCollection } from "~/lib/collection-data";

type DeletePopoverProps = {
	toDelete: string;
	popoverCloser: Setter<boolean>;
};

export default function DeletePopover(props: DeletePopoverProps) {
	const [collectionValue, setCollectionValue] = createSignal<
		string | undefined
	>(undefined);
	const deleteCollectionAction = useAction(deleteCollection);
	const associatedCount = createAsync(
		() => getFortuneCountByCollection(props.toDelete),
		{ initialValue: 0 },
	);

	const handleDelete = async () => {
		if (collectionValue()) {
			await deleteCollectionAction(props.toDelete, collectionValue());
			props.popoverCloser(false);
			return;
		}
		await deleteCollectionAction(props.toDelete);
		props.popoverCloser(false);
	};
	return (
		<Suspense fallback={"Loading..."}>
			<div class="flex gap-4 flex-col justify-center">
				<Switch
					fallback={
						<Popover.Title>Do you sure you want to delete this ?</Popover.Title>
					}
				>
					<Match when={associatedCount() > 0}>
						<Popover.Title>{`You have ${associatedCount()} number of fortune linked to this collection`}</Popover.Title>
						<CollectionPicker
							center={true}
							needLabel={false}
							getValue={setCollectionValue}
							editable={false}
						/>
					</Match>
				</Switch>
				<div class="flex items-center justify-center gap-4">
					<Button.Root
						onClick={handleDelete}
						class="rounded-xl px-3 py-2 bg-red-500 text-white disabled:opacity-30 over:bg-slate-100"
					>
						{associatedCount() > 0 ? "Swap and Delete" : "Delete"}
					</Button.Root>
					<Popover.CloseButton class="rounded-xl px-3 py-2 bg-slate-300 disabled:opacity-30 over:bg-slate-100">
						Cancel
					</Popover.CloseButton>
				</div>
			</div>
		</Suspense>
	);
}
