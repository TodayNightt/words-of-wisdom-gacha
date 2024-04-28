import { type FlowProps, createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
type ContextStore = {
	needRefetch: boolean;
};

export const DashboardContext = createContext<{
	store: ContextStore;
	setNeedRefetch: (val: boolean) => void;
}>({
	store: {
		needRefetch: false,
	},
	setNeedRefetch: (val: boolean) => {},
});

export function useDashboardContext() {
	return useContext(DashboardContext);
}
export default function DashboardContextProvider(props: FlowProps) {
	const [store, setStore] = createStore<ContextStore>({
		needRefetch: false,
	});

	const setNeedRefetch = (val: boolean) => {
		setStore("needRefetch", val);
	};

	const value = {
		store,
		setNeedRefetch,
	};

	return (
		<DashboardContext.Provider value={value}>
			{props.children}
		</DashboardContext.Provider>
	);
}
