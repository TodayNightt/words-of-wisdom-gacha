import { useSubmission } from "@solidjs/router";
import { createSignal, lazy } from "solid-js";
import { login } from "~/lib/login";
import { TextField } from "@kobalte/core";
import Button from "~/component/ButtonWrapper";


import CenterDiv from "~/component/CenterDiv";
import FormResult from "~/component/dashboard/FormResult";


export default function Login() {
	const loginResult = useSubmission(login);
	const [username, setUsername] = createSignal("");
	const [password, setPassword] = createSignal("");

	return (
		<CenterDiv>
			<div class="flex flex-col gap-8 rounded-3xl p-8 h-4/6 bg-slate-100 items-center justify-center">
				<h1 class="text-3xl font-bold">Login</h1>
				{/* FIXME : the responsive for larger screen does not work */}
				<FormResult
					height="h-2/6"
					responsiveWidth="w-full md:w-4/5 sm:w-full"
					result={loginResult.result}
				>
					{(_data) => <h1 class="font-bold text-xl">Login success</h1>}
				</FormResult>
				<form
					class="rounded-xl p-2 flex flex-col gap-4"
					action={login}
					method="post"
				>
					<TextField.Root
						onChange={setUsername}
						value={username()}
						name="username"
						class="flex flex-col gap-2"
					>
						<TextField.Label class="text-m font-bold">
							Username :
						</TextField.Label>
						<TextField.Input
							placeholder="username"
							class="rounded-xl p-2 font-medium"
						/>
					</TextField.Root>
					<TextField.Root
						name="password"
						class="flex flex-col gap-2"
						onChange={setPassword}
						value={password()}
					>
						<TextField.Label class="text-m font-bold">
							Password :
						</TextField.Label>
						<TextField.Input
							placeholder="password"
							type="password"
							class="rounded-xl p-2 font-medium"
						/>
					</TextField.Root>

					<Button color="bg-blue-200 hover:bg-blue-300" type={"submit"}>
						Login
					</Button>
				</form>
			</div>
			{/* <AlertDialog.Root open={errorDialog()}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay class="alert-dialog__overlay" />
            <div class="alert-dialog__positioner">
              <AlertDialog.Content class="alert-dialog__content">
                <div class="alert-dialog__header">
                  <AlertDialog.Title class="alert-dialog__title">
                    {errorMessage()}
                  </AlertDialog.Title>
                  <AlertDialog.CloseButton class="alert-dialog__close-button" />
                </div>
                <AlertDialog.Description class="alert-dialog__description">
                  <ul>
                    <For each={errorCause()}>
                      {(cause, _index) => <li>{cause}</li>}
                    </For>
                  </ul>
                </AlertDialog.Description>
              </AlertDialog.Content>
            </div>
          </AlertDialog.Portal>
        </AlertDialog.Root> */}
		</CenterDiv>
	);
}
