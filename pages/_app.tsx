import "bootstrap/dist/css/bootstrap.min.css";
import "/styles/globals.css";
import "reactflow/dist/base.css";
import "styles/BlockFlow.css";
import "styles/BlockFlowMoodle.css";
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
import React, { createContext, useState, useEffect, ReactNode } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { useIsOnline } from "react-use-is-online";
import { parseBool } from "../utils/Utils";
import ConfirmationModal from "../components/dialogs/ConfirmationModal";
import { ReactFlowInstance } from "reactflow";
import { IVersion } from "@components/interfaces/IVersion";
import { INodeType } from "@components/interfaces/INode";
import { IMetaData } from "@components/interfaces/IMetaData";
import LTIErrorMessage from "@components/messages/LTIErrors";
import { IMap } from "@components/interfaces/IMap";
import { ILTISettings } from "@components/interfaces/ILTISettings";
import getConf from "middleware/api/getConf";
import { INodeError } from "@components/interfaces/INodeError";

type MapInfoType = {
	mapSelected: IMap;
	setMapSelected: React.Dispatch<React.SetStateAction<IMap>>;
};

type CurrentVersionType = {
	versionJson: IVersion;
	setVersionJson: React.Dispatch<React.SetStateAction<IVersion>>;
};

type EditedVersionType = {
	editVersionSelected: IVersion;
	setEditVersionSelected: React.Dispatch<React.SetStateAction<IVersion>>;
};

type EditedNodeType = {
	nodeSelected: INodeType;
	setNodeSelected: React.Dispatch<React.SetStateAction<INodeType>>;
};

type BlocksDataType = {
	currentBlocksData: Array<INodeType>;
	setCurrentBlocksData: React.Dispatch<React.SetStateAction<Array<INodeType>>>;
};

type SettingsType = {
	settings: string;
	setSettings: React.Dispatch<React.SetStateAction<string>>;
};

type OnlineType = {
	isOnline: boolean;
	isOffline: boolean;
};

type ReactFlowInstanceType = {
	reactFlowInstance: ReactFlowInstance;
	setReactFlowInstance: React.Dispatch<React.SetStateAction<ReactFlowInstance>>;
};

type MetaDataType = {
	metaData: IMetaData;
	setMetaData: React.Dispatch<React.SetStateAction<IMetaData>>;
};

type UserDataType = {
	userData: IUserData;
	setUserData: React.Dispatch<React.SetStateAction<IUserData>>;
};

type HeaderToEmptySelectorType = {
	mapCount: number;
	setMapCount: React.Dispatch<React.SetStateAction<number>>;
	mapNames: Array<string>;
	setMapNames: React.Dispatch<React.SetStateAction<Array<string>>>;
	allowUseStatus: boolean;
	setAllowUseStatus: React.Dispatch<React.SetStateAction<boolean>>;
	maps: Array<IMap>;
	setMaps: React.Dispatch<React.SetStateAction<Array<IMap>>>;
	funcCreateMap: Function;
	setFuncCreateMap: React.Dispatch<React.SetStateAction<Function>>;
	funcImportMap: Function;
	setFuncImportMap: React.Dispatch<React.SetStateAction<Function>>;
	funcImportMapFromLesson: Function;
	setFuncImportMapFromLesson: React.Dispatch<React.SetStateAction<Function>>;
	funcMapChange: Function;
	setFuncMapChange: React.Dispatch<React.SetStateAction<Function>>;
};

type ExpandedAsideType = {
	expandedAside: boolean;
	setExpandedAside: React.Dispatch<React.SetStateAction<boolean>>;
};

type MainDOMType = {
	mainDOM: HTMLElement;
	setMainDOM: React.Dispatch<React.SetStateAction<HTMLElement>>;
};

type LTISettingsType = {
	LTISettings: ILTISettings;
	setLTISettings: React.Dispatch<React.SetStateAction<IUserData>>;
};

type ErrorListType = {
	errorList: Array<INodeError>;
	setErrorList: React.Dispatch<React.SetStateAction<Array<INodeError>>>;
};

export const MapInfoContext = createContext<MapInfoType | undefined>(undefined); // Contains the current selected map

export const CurrentVersionContext = createContext<
	CurrentVersionType | undefined
>(undefined); // Contains the current version

export const EditedVersionContext = createContext<
	EditedVersionType | undefined
>(undefined); // Contains the version that is being edited

export const EditedNodeContext = createContext<EditedNodeType | undefined>(
	undefined
); // Contains the node that is being edited

export const ExpandedAsideContext = createContext<ExpandedAsideType>({
	expandedAside: false,
	setExpandedAside: () => {},
}); // True/false if Aside is visible

export const SettingsContext = createContext<SettingsType>(undefined); // Contains user settings

export const BlocksDataContext = createContext<BlocksDataType | undefined>(
	undefined
); //Contains current version's blocksdata

export const MainDOMContext = createContext<MainDOMType | null>(null); //Contains the <Main> HTML Element

export const OnlineContext = createContext<OnlineType>({
	isOnline: true,
	isOffline: false,
}); //Contains true/false if online

export const ReactFlowInstanceContext = createContext<
	ReactFlowInstanceType | undefined
>(undefined); //Contains the current reactFlowInstance

export const MetaDataContext = createContext<MetaDataType | undefined>(
	undefined
); //Contains metadata information

export const UserDataContext = createContext<UserDataType | undefined>(
	undefined
); //Contains userdata information

export const HeaderToEmptySelectorContext = createContext<
	HeaderToEmptySelectorType | undefined
>(undefined); //References functionally from the Header to be able to use it in the empty selector.

export const LTISettingsContext = createContext<LTISettingsType | undefined>(
	undefined
); //Branding

export const ErrorListContext = createContext<ErrorListType | undefined>(
	undefined
); // Contains an array with error objects

const SESSION_START = Date.now();

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
	const [mapSelected, setMapSelected] = useState();
	const [LTISettings, setLTISettings] = useState(undefined);

	const { isOnline, isOffline } = useIsOnline();

	const [confirmationShow, setConfirmationShow] = useState(false);
	const [confirmationMessage, setConfirmationMessage] = useState<ReactNode>();
	const handleConfirmationClose = () => setConfirmationShow(false);
	const handleConfirmationShow = () => setConfirmationShow(true);

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
							handleConfirmationShow();
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

	async function getLTISettings() {
		if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
			try {
				getToken();
				const response = await getConf();
				setLTISettings(response);
			} catch (e) {
				setConfirmationMessage(
					<LTIErrorMessage error={"ERROR_INVALID_TOKEN"} />
				);
				handleConfirmationShow();
			}
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
		<MapInfoContext.Provider value={{ mapSelected, setMapSelected }}>
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
									<ConfirmationModal
										show={confirmationShow}
										handleClose={handleConfirmationClose}
										title="Error"
										message={confirmationMessage}
										cancel="Cerrar"
										callbackCancel={() => window.close()}
									/>
								</BlocksDataContext.Provider>
							</ErrorListContext.Provider>
						</ReactFlowInstanceContext.Provider>
					</SettingsContext.Provider>
				</LTISettingsContext.Provider>
			</OnlineContext.Provider>
		</MapInfoContext.Provider>
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
