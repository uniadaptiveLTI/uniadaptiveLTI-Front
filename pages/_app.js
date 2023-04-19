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

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

export default function App({ Component, pageProps }) {
	const [settings, setSettings] = useState(
		JSON.stringify({
			highContrast: false,
			showDetails: false,
			reducedAnimations: false,
			autoExpandMSGBox: false,
			autoHideMSGBox: true,
		})
	);

	useEffect(() => {
		let localSettings = sessionStorage.getItem("settings");
		if (localSettings) {
			setSettings(localSettings);
		}
	}, []);

	return (
		<SettingsContext.Provider value={{ settings, setSettings }}>
			<Layout>
				<ToastContainer />
				<Component {...pageProps} />
			</Layout>
		</SettingsContext.Provider>
	);
}

export const notImplemented = () => {
	toast("Esta función no ha sido implementada.", {
		hideProgressBar: false,
		autoClose: 2000,
		type: "error",
		position: "bottom-center",
		theme: "colored",
	});
};
