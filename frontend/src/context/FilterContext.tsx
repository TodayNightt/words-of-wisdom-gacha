import {
	type FlowProps,
	createContext,
	useContext,
	createSignal,
	type Setter,
	type Accessor,
} from "solid-js";
import { createStore } from "solid-js/store";

type FilterContextItem = {
	setFilter: (val: string) => void;
	store: { filter: string };
};

const FilterContext = createContext<FilterContextItem>({
	setFilter: (val: string) => {},
	store: {
		filter: "",
	},
});

export function useFilter() {
	return useContext(FilterContext);
}

export default function FilterProvider(props: FlowProps) {
	const [store, setStore] = createStore<FilterContextItem["store"]>({
		filter: "",
	});

	const setFilter = (val: string) => {
		setStore("filter", val);
	};

	return (
		<FilterContext.Provider
			value={{
				setFilter,
				store,
			}}
		>
			{props.children}
		</FilterContext.Provider>
	);
}
