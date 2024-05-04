// @refresh roload
import { Suspense, lazy } from "solid-js";
import { Title } from "@solidjs/meta";
import FilterContext from "~/context/FilterContext";
import { useAction } from "@solidjs/router";
import { logout } from "~/lib/login";
import Seachable from "~/component/dashboard/Seachable";
import Button from "~/component/ButtonWrapper";
import { ImExit } from "solid-icons/im";
import FortuneList from "~/component/dashboard/FortuneList";
import DashboardDialog from "~/component/dashboard/DashboardDialog";
import ErrorPage from "~/component/ErrorPage";

export default function Dashboard() {
	const logoffAction = useAction(logout);
	return (
		<>
			<Title>Dashboard</Title>
			<nav class="p-4 flex items-center w-full h-[100px] justify-between box-border">
				<h1 class="text-4xl font-bold p-2 text-ellipsis">Fortune Dashboard</h1>
				<Button
					onClick={logoffAction}
					tailwindClass="sm:mx-4 sm:px-2 flex gap-2 items-center min-w-[6rem]"
				>
					<ImExit class="size-5" />
					<span class="flex text-ellipsis flex-grow">Log off</span>
				</Button>
			</nav>
			<div class="cal-height container flex flex-col bg-gray-50 rounded-xl box-border p-4 size-full">
				<FilterContext>
					<Seachable />
					<Suspense fallback={"Loading..."}>
						<FortuneList />
					</Suspense>
				</FilterContext>
				<DashboardDialog />
			</div>
		</>
	);
}
