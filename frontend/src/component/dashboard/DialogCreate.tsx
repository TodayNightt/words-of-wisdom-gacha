import { Tabs } from "@kobalte/core";

import { Suspense } from "solid-js";
import CreateBulkContent from "./FortuneCreateBulk";
import FortuneCreateSingleContent from "./FortuneCreateContent";

export default function DialogCreate() {
	return (
		<Tabs.Root
			aria-label="Main navigation"
			class="w-full flex-grow px-4"
			// defaultValue="dashboard"
		>
			<Tabs.List class="flex relative items-center">
				<Tabs.Trigger
					class="inline-block px-4 py-2 rounded-lg outline-none hover:bg-slate-300"
					value="single"
				>
					Single
				</Tabs.Trigger>
				<Tabs.Trigger
					class="inline-block px-4 py-2 outline-none hover:bg-slate-300"
					value="dashboard"
				>
					Bulk
				</Tabs.Trigger>
				<Tabs.Indicator class="abosolute bg-slate-400" />
			</Tabs.List>
			<Tabs.Content
				class="container px-4 py-8 flex-grow flex flex-col gap-8 justify-center"
				value="single"
			>
				<Suspense fallback={"Loading..."}>
					<FortuneCreateSingleContent />
				</Suspense>
			</Tabs.Content>
			<Tabs.Content
				class="container px-4 py-8 flex-grow flex justify-center"
				value="dashboard"
			>
				<CreateBulkContent />
			</Tabs.Content>
		</Tabs.Root>
	);
}
