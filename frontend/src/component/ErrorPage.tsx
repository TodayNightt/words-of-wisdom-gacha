import { useNavigate } from "@solidjs/router";
import Button from "./ButtonWrapper";
import CenterDiv from "./CenterDiv";

export default function ErrorPage(props: { path: string }) {
	const navigate = useNavigate();
	return (
		<CenterDiv tailwindClass="flex flex-col gap-8">
			<div class="text-2xl font-bold">Something went wrong!</div>
			<Button
				onClick={() => {
					navigate(props.path, { replace: true });
				}}
				type={"button"}
				tailwindClass="w-fit"
				color={"bg-red-500 hover:bg-red-400 text-white"}
			>
				Please try again
			</Button>
		</CenterDiv>
	);
}
