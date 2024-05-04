// @refresh roload
import { Button } from "@kobalte/core";
import { Title } from "@solidjs/meta";
import { clientOnly } from "@solidjs/start";
import { createSignal } from "solid-js";
import CenterDiv from "~/component/CenterDiv";
import FullHeightMain from "~/component/FullHeightMain";

const FortuneTellerDialog = clientOnly(
	() => import("~/component/FortuneTellerDialog"),
);

export default function Home() {
	const [show, setShow] = createSignal(false);
	return (
		<>
			<Title>Words of Wisdom</Title>
			<FullHeightMain>
				<CenterDiv tailwindClass="w-full bg-slate-200">
					<Button.Root
						class="rounded-xl bg-slate-100 p-2 hover:bg-slate-300"
						onClick={() => setShow(true)}
					>
						Click Me
					</Button.Root>
				</CenterDiv>
				<FortuneTellerDialog
					multiTime={false}
					open={show()}
					setOpen={setShow}
				/>
			</FullHeightMain>
		</>
	);
}
