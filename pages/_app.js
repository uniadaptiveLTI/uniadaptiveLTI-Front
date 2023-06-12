import "bootstrap/dist/css/bootstrap.min.css";
import "@root/styles/globals.css";
import "reactflow/dist/base.css";
import "styles/BlockFlow.css";
import "styles/BlockFlowMoodle.css";
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
import React, { createContext, useState, useEffect } from "react";

export const MSGContext = createContext(); // Used for displaying messages in the footer
export const NodeInfoContext = createContext(); // Contains the node data that is being edited
export const ErrorListContext = createContext(); // Contains an array with error objects
export const MapInfoContext = createContext(""); //
export const VersionInfoContext = createContext(); //
export const MapContext = createContext(); //
export const ExpandedAsideContext = createContext(); // True/false if Aside is visible
export const VersionJsonContext = createContext(); // Contains the current version
export const BlockJsonContext = createContext(true); //
export const DeleteEdgeContext = createContext(); //
export const LTISettingsContext = createContext(); // Contains LTI Settings (updates on restart)
export const SettingsContext = createContext(); // Contains user settings
export const PlatformContext = createContext("moodle"); //Contains the LMS that is connected to (deprecated, use MetaDataContext)
export const BlocksDataContext = createContext(); //Contains current map version's blocksdata
export const MainDOMContext = createContext(); //
export const OnlineContext = createContext(); //Contains true/false if online
export const ReactFlowInstanceContext = createContext(); //Contains reactFlowInstance (deprecated)
export const MetaDataContext = createContext(); //Contains metadata information

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { useIsOnline } from "react-use-is-online";
import { parseBool } from "@utils/Utils";

export const BACK_URL = process.env.NEXT_PUBLIC_BACK_URL;
const sessionStart = Date.now();

export default function App({ Component, pageProps }) {
	const [settings, setSettings] = useState(
		JSON.stringify({
			highContrast: false,
			showDetails: false,
			snapping: true,
			snappingInFragment: false,
			reducedAnimations: false,
			autoHideAside: true,
			autoExpandMSGBox: false,
			autoHideMSGBox: true,
		})
	);
	const [reactFlowInstance, setReactFlowInstance] = useState();
	const [errorList, setErrorList] = useState();
	const [currentBlocksData, setCurrentBlocksData] = useState();

	const { isOnline, isOffline } = useIsOnline();

	useEffect(() => {
		let localSettings = localStorage.getItem("settings");
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

	if (parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
		console.warn(
			"DEV_FILES is true, communication with the backend is disabled."
		);
	}

	return (
		<OnlineContext.Provider value={{ isOnline, isOffline }}>
			<SettingsContext.Provider value={{ settings, setSettings }}>
				<ReactFlowInstanceContext.Provider
					value={{ reactFlowInstance, setReactFlowInstance }}
				>
					<ErrorListContext.Provider value={{ errorList, setErrorList }}>
						<BlocksDataContext.Provider
							value={{ currentBlocksData, setCurrentBlocksData }}
						>
							<ToastContainer />
							<Component {...pageProps} />
						</BlocksDataContext.Provider>
					</ErrorListContext.Provider>
				</ReactFlowInstanceContext.Provider>
			</SettingsContext.Provider>
		</OnlineContext.Provider>
	);
}

export const notImplemented = (name) => {
	typeof name != "string" ? (name = undefined) : null;
	let finalString = name
		? "La funcionalidad de " + name + " todavía no ha sido implementada"
		: "Esta función aún no ha sido implementada.";
	toast(finalString, {
		hideProgressBar: false,
		autoClose: 2000,
		type: "error",
		position: "bottom-center",
		theme: "colored",
	});
};

const connectionRestored = () => {
	if (window)
		toast("La conexión a internet ha sido recuperada", {
			hideProgressBar: false,
			autoClose: 2000,
			type: "info",
			position: "bottom-center",
			theme: "light",
		});
};

const connectionLost = () => {
	if (window)
		toast("La conexión a internet se ha perdido", {
			hideProgressBar: false,
			autoClose: 2000,
			type: "info",
			position: "bottom-center",
			theme: "light",
		});
};
