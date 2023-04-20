import "bootstrap/dist/css/bootstrap.min.css";
import "@components/styles/globals.css";
import "reactflow/dist/base.css";
import "styles/BlockFlow.css";

import React, { createContext, useState, useEffect } from "react";

import Layout from "../components/Layout";

export const MSGContext = createContext();
export const BlockInfoContext = createContext();
export const ItineraryInfoContext = createContext();
export const VersionInfoContext = createContext();
export const MapContext = createContext();
export const ExpandedContext = createContext();
export const VersionJsonContext = createContext();
export const BlockJsonContext = createContext(true);
export const CreateBlockContext = createContext();
export const DeleteBlockContext = createContext();
export const SettingsContext = createContext();
export const PlatformContext = createContext("moodle");
export const BlocksDataContext = createContext();
export const MainDOMContext = createContext();
export const OnlineContext = createContext();

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { useIsOnline } from "react-use-is-online";

const sessionStart = Date.now();

export default function App({ Component, pageProps }) {
	const [settings, setSettings] = useState(
		JSON.stringify({
			highContrast: false,
			showDetails: false,
			reducedAnimations: false,
			autoHideAside: false,
			autoExpandMSGBox: false,
			autoHideMSGBox: true,
		})
	);
	const { isOnline, isOffline } = useIsOnline();

	useEffect(() => {
		let localSettings = sessionStorage.getItem("settings");
		if (localSettings) {
			setSettings(localSettings);
		}
	}, []);

	useEffect(() => {
		if (isOnline) {
			if (Date.now() > sessionStart + 500) {
				//Small delay so it doesn't show up at start
				connectionRestored();
			}
		} else {
			connectionLost();
		}
	}, [isOnline]);

	return (
		<OnlineContext.Provider value={{ isOnline, isOffline }}>
			<SettingsContext.Provider value={{ settings, setSettings }}>
				<Layout>
					<ToastContainer />
					<Component {...pageProps} />
				</Layout>
			</SettingsContext.Provider>
		</OnlineContext.Provider>
	);
}

export const notImplemented = () => {
	toast("Esta función aún no ha sido implementada.", {
		hideProgressBar: false,
		autoClose: 2000,
		type: "error",
		position: "bottom-center",
		theme: "colored",
	});
};

const connectionRestored = () => {
	toast("La conexión a internet ha sido recuperada", {
		hideProgressBar: false,
		autoClose: 2000,
		type: "info",
		position: "bottom-center",
		theme: "light",
	});
};

const connectionLost = () => {
	toast("La conexión a internet se ha perdido", {
		hideProgressBar: false,
		autoClose: 2000,
		type: "info",
		position: "bottom-center",
		theme: "light",
	});
};
