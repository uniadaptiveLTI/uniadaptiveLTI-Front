import "bootstrap/dist/css/bootstrap.min.css";
import "/styles/globals.css";
import "reactflow/dist/base.css";
import "styles/BlockFlow.css";
import "styles/BlockFlowMoodle.css";
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
import React, {
	createContext,
	useState,
	useEffect,
	useLayoutEffect,
} from "react";

export const NodeInfoContext = createContext(); // Contains the node data that is being edited
export const ErrorListContext = createContext(); // Contains an array with error objects
export const MapInfoContext = createContext(""); //
export const VersionInfoContext = createContext(); //
export const ExpandedAsideContext = createContext(); // True/false if Aside is visible
export const VersionJsonContext = createContext(); // Contains the current version
export const BlockJsonContext = createContext(true); //
export const DeleteEdgeContext = createContext(); //
export const SettingsContext = createContext(); // Contains user settings
export const PlatformContext = createContext("moodle"); //Contains the LMS that is connected to (deprecated, use MetaDataContext)
export const BlocksDataContext = createContext(); //Contains current map version's blocksdata
export const MainDOMContext = createContext(); //
export const OnlineContext = createContext(); //Contains true/false if online
export const ReactFlowInstanceContext = createContext(); //Contains reactFlowInstance (deprecated)
export const MetaDataContext = createContext(); //Contains metadata information
export const UserDataContext = createContext(); //Contains userdata information
export const HeaderToEmptySelectorContext = createContext(); //References functionally from the Header to be able to use it in the empty selector.
export const LTISettingsContext = createContext(); //Branding

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { useIsOnline } from "react-use-is-online";
import { fetchBackEnd, parseBool } from "../utils/Utils";

const SESSION_START = Date.now();

function getToken() {
	const PARAMS = new URLSearchParams(window.location.href.split("?")[1]);
	const TOKEN = PARAMS.get("token");
	let newUrl = window.location.href.split("?")[0];
	window.history.replaceState({}, document.title, newUrl);
	if (TOKEN) {
		//if there is a token in the url
		sessionStorage.setItem("token", TOKEN);
		return TOKEN;
	} else {
		//if there isn't a token in the url
		let attempts = 0;
		const MAX_ATTEMPTS = 20;
		const INTERVAL = setInterval(() => {
			const STORED_TOKEN = sessionStorage.getItem("token");
			if (STORED_TOKEN == undefined) {
				if (attempts < MAX_ATTEMPTS) {
					attempts++;
				} else {
					if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
						alert(
							`Error: Interfaz lanzada sin identificador de sesión apropiado. Vuelva a lanzar la herramienta desde el gestor de contenido. Cerrando.`
						);
						window.close();
					}
					clearInterval(INTERVAL);
				}
			} else {
				clearInterval(INTERVAL);
				return STORED_TOKEN;
			}
		}, 100);
	}
}

export default function App({ Component, pageProps }) {
	const [settings, setSettings] = useState(
		JSON.stringify({
			highContrast: false,
			showDetails: false,
			snapping: true,
			snappingInFragment: false,
			reducedAnimations: false,
			autoHideAside: true,
			hoverConditions: false,
		})
	);
	const [reactFlowInstance, setReactFlowInstance] = useState();
	const [errorList, setErrorList] = useState();
	const [currentBlocksData, setCurrentBlocksData] = useState();
	const [LTISettings, setLTISettings] = useState();

	const { isOnline, isOffline } = useIsOnline();

	async function getLTISettings() {
		if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
			const response = await fetchBackEnd(
				getToken(),
				"api/lti/get_conf",
				"POST"
			);
			setLTISettings(response);
		} else {
			fetch("resources/devconfiguration.json")
				.then((response) => response.json())
				.then((data) => {
					setLTISettings(data);
				});
		}
	}

	useEffect(() => {
		let localSettings = localStorage.getItem("settings");
		if (localSettings) {
			setSettings(localSettings);
		}
	}, []);

	useEffect(() => {
		if (isOnline) {
			if (Date.now() > SESSION_START + 500) {
				//Small delay so it doesn't show up at start
				connectionRestored();
			}
			getLTISettings();
		} else {
			connectionLost();
		}
	}, [isOnline]);

	return (
		<OnlineContext.Provider value={{ isOnline, isOffline }}>
			<LTISettingsContext.Provider value={{ LTISettings, setLTISettings }}>
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
			</LTISettingsContext.Provider>
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
