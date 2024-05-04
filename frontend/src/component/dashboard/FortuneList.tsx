import { createAsync, useAction } from "@solidjs/router";
import { For, Match, Switch, createMemo, lazy } from "solid-js";
import { useDashboardContext } from "~/context/DashboardContext";
import { DialogMode, useDialog } from "~/context/DialogContext";
import { useFilter } from "~/context/FilterContext";
import { listFortune, removeFortune } from "~/lib/fortune-data";
import Card from "../Card";

export default function FortuneList() {
	const deleteAction = useAction(removeFortune);
	const { openDialog } = useDialog();
	const { store: filterStore, setFilter } = useFilter();
	const data = createAsync(async () =>
		(await listFortune()).map((val) => {
			return { id: val.id, title: val.fortune, tags: [val.collectionName] };
		}),
	);

	// This handle the realtime filtering
	const displayData = createMemo(() =>
		data()?.filter(
			(val) =>
				val.title.includes(filterStore.filter) ||
				val.tags.includes(filterStore.filter),
		),
	);

	const handleDelete = async (id: string) => {
		await deleteAction(id);
	};

	const handleEdit = async (id: string) => {
		openDialog(DialogMode.Edit, id);
	};

	return (
		<div class="flex-grow box-border overflow-y-scroll p-2">
			<Switch>
				{/* This branch is when `props.filter` are not an empty string and the data suppose to display `displayData` are empty 
					which means that there are no item that fulfil the filter condition
				*/}
				<Match when={filterStore.filter && displayData()?.length === 0}>
					{`There are nothing to match with the keyword '${filterStore.filter}'`}
				</Match>
				<Match when={displayData()?.length === 0}>There are nothing here</Match>
				<Match when={displayData()?.length !== 0}>
					<ul class="m-0 flex-grow box-border flex flex-col gap-3">
						<For each={displayData()}>
							{(data, index) => {
								return (
									<li class="box-border">
										<Card
											data={data}
											deleteCallback={handleDelete}
											editCallback={handleEdit}
											tagsClickCallback={setFilter}
										/>
									</li>
								);
							}}
						</For>
					</ul>
				</Match>
			</Switch>
		</div>
	);
}
