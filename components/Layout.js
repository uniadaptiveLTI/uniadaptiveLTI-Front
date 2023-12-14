import Header from "./Header";
import Aside from "./Aside";
import { ReactFlowProvider } from "reactflow";
import { Container } from "react-bootstrap";
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import {
	PlatformContext,
	NodeInfoContext,
	MapInfoContext,
	VersionJsonContext,
	ExpandedAsideContext,
	VersionInfoContext,
	MainDOMContext,
	MetaDataContext,
	HeaderToEmptySelectorContext,
	UserDataContext,
} from "../pages/_app.js";
import { applyBranding } from "@utils/Colors";

export default function Layout({ LTISettings, children }) {
	const [platform, setPlatform] = useState("moodle"); //default to moodle in testing phase
	const [metaData, setMetaData] = useState();
	const [userData, setUserData] = useState();
	const [sections, setSections] = useState();
	const [nodeSelected, setNodeSelected] = useState("");
	const [mapSelected, setMapSelected] = useState("");
	const [activeMap, setActiveMap] = useState("");
	const [editVersionSelected, setEditVersionSelected] = useState("");

	const [expandedAside, setExpandedAside] = useState(false);

	const [versionJson, setVersionJson] = useState("");

	const [fixedMainHeight, setFixedMainHeight] = useState("100vh");

	const [mainDOM, setMainDOM] = useState(null);

	//Header to Empty
	const [mapCount, setMapCount] = useState(0);
	const [mapNames, setMapNames] = useState([]);
	const [allowUseStatus, setAllowUseStatus] = useState(false);
	const emptyMap = { id: -1, name: "Seleccionar un mapa" };
	const [maps, setMaps] = useState([emptyMap]);
	const [funcCreateMap, setFuncCreateMap] = useState();
	const [funcImportMap, setFuncImportMap] = useState();
	const [funcImportMapFromLesson, setFuncImportMapFromLesson] = useState();
	const [funcMapChange, setFuncMapChange] = useState();

	//Referencias
	const headerDOM = useRef(null);
	const mainDOMRef = useRef(null);

	useLayoutEffect(() => {
		if (typeof window != "undefined") {
			window.addEventListener("resize", () => {
				setFixedMainHeight(getHeaderHeight());
			});
		}
	}, [headerDOM.current]);

	useLayoutEffect(() => {
		if (typeof window != "undefined") {
			setFixedMainHeight(getHeaderHeight());
		}
	}, [
		headerDOM.current && headerDOM.current.getBoundingClientRect().height,
		expandedAside,
	]);

	useLayoutEffect(() => {
		if (typeof window != "undefined") {
			setMainDOM(mainDOMRef);
		}
	}, [mainDOMRef]);

	useLayoutEffect(() => {
		if (typeof window != "undefined") {
			applyBranding(LTISettings);
		}
	}, [LTISettings]);

	/**
	 * Calculates the height of the header.
	 * @returns {number} The height of the header.
	 */
	function getHeaderHeight() {
		if (typeof window != "undefined") {
			const CURRENT_HEADER = headerDOM.current;
			if (CURRENT_HEADER) {
				const CURRENT_HEADER_HEIGHT =
					CURRENT_HEADER.getBoundingClientRect().height;
				return window.innerHeight - CURRENT_HEADER_HEIGHT;
			}
		} else {
			return "100vh";
		}
	}

	return (
		<PlatformContext.Provider value={{ platform, setPlatform }}>
			<MetaDataContext.Provider value={{ metaData, setMetaData }}>
				<UserDataContext.Provider value={{ userData, setUserData }}>
					<NodeInfoContext.Provider value={{ nodeSelected, setNodeSelected }}>
						<MapInfoContext.Provider
							value={{ mapSelected, setMapSelected, activeMap, setActiveMap }}
						>
							<VersionInfoContext.Provider
								value={{ editVersionSelected, setEditVersionSelected }}
							>
								<VersionJsonContext.Provider
									value={{ versionJson, setVersionJson }}
								>
									<HeaderToEmptySelectorContext.Provider
										value={{
											mapCount,
											setMapCount,
											mapNames,
											setMapNames,
											allowUseStatus,
											setAllowUseStatus,
											maps,
											setMaps,
											funcCreateMap,
											setFuncCreateMap,
											funcImportMap,
											setFuncImportMap,
											funcImportMapFromLesson,
											setFuncImportMapFromLesson,
											funcMapChange,
											setFuncMapChange,
										}}
									>
										<ExpandedAsideContext.Provider
											value={{ expandedAside, setExpandedAside }}
										>
											<MainDOMContext.Provider value={{ mainDOM, setMainDOM }}>
												<ReactFlowProvider>
													<Container
														className="g-0"
														fluid
														style={{ minHeight: 100 + "vh" }}
													>
														<div
															className="row g-0"
															style={{ height: 100 + "vh" }}
														>
															<Aside
																LTISettings={LTISettings}
																className={
																	expandedAside
																		? "col-12 col-sm-4 col-md-3 col-xl-2"
																		: "d-none"
																}
															/>
															<Container
																fluid
																className={
																	expandedAside
																		? "col-12 col-sm-8 col-md-9 col-xl-10 g-0"
																		: "g-0"
																}
																style={{
																	display: "flex",
																	flexDirection: "column",
																}}
															>
																<Container
																	className="g-0"
																	fluid
																	style={{ flex: "1 0 auto" }}
																>
																	<Header
																		LTISettings={LTISettings}
																		ref={headerDOM}
																	/>

																	<main
																		id="main"
																		ref={mainDOMRef}
																		style={{
																			height: fixedMainHeight,
																			overflow: "overlay",
																			scrollBehavior: "smooth",
																			position: "relative",
																			boxShadow:
																				"inset 0 0 10px var(--blockflow-inner-box-shadow-color)",
																		}}
																	>
																		{children}
																	</main>
																</Container>
															</Container>
														</div>
													</Container>
												</ReactFlowProvider>
											</MainDOMContext.Provider>
										</ExpandedAsideContext.Provider>
									</HeaderToEmptySelectorContext.Provider>
								</VersionJsonContext.Provider>
							</VersionInfoContext.Provider>
						</MapInfoContext.Provider>
					</NodeInfoContext.Provider>
				</UserDataContext.Provider>
			</MetaDataContext.Provider>
		</PlatformContext.Provider>
	);
}
