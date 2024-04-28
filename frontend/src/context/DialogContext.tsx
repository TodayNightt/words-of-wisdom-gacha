import { type JSX, createContext, useContext, type FlowProps } from "solid-js";
import { createStore } from "solid-js/store";

export const DialogMode = {
	Edit: 0,
	Create: 1,
	Alert: 2,
	DeleteAlert: 3,
	Nothing: 5,
} as const;

export type DialogModeType = (typeof DialogMode)[keyof typeof DialogMode];

type StoreItem = {
	isOpen: boolean;
	itemId: string | null;
	mode: DialogModeType;
};

const DialogContext = createContext<{
	openDialog: (mode: DialogModeType, id?: string) => void;
	closeDialog: () => void;
	store: StoreItem;
}>({
	openDialog: (mode: DialogModeType, id?: string) => {},
	closeDialog: () => {},
	store: {
		isOpen: false,
		itemId: null,
		mode: DialogMode.Nothing,
	},
});

export function useDialog() {
	return useContext(DialogContext);
}

export default function DialogProvider(props: FlowProps) {
	const [store, setStore] = createStore<StoreItem>({
		isOpen: false,
		itemId: null,
		mode: DialogMode.Nothing,
	});

	const openDialog = (mode: DialogModeType, id?: string) => {
		if (id) {
			setStore("itemId", id);
		}
		setStore("mode", mode);
		setStore("isOpen", true);
	};

	const closeDialog = () => {
		setStore("isOpen", false);
		setStore("itemId", null);
	};

	const value = {
		openDialog,
		closeDialog,
		store,
	};

	return (
		<DialogContext.Provider value={value}>
			{props.children}
		</DialogContext.Provider>
	);
}
