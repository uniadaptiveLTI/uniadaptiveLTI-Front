import Header from "./Header";
import Aside from "./Aside";
import Footer from "./Footer";
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
	MSGContext,
	MetaDataContext,
} from "../pages/_app.js";

export default function Layout({ LTISettings, children }) {
	const [platform, setPlatform] = useState("moodle"); //default to moodle in testing phase
	const [metaData, setMetaData] = useState();
	const [sections, setSections] = useState();

	const [nodeSelected, setNodeSelected] = useState("");
	const [mapSelected, setMapSelected] = useState("");
	const [activeMap, setActiveMap] = useState("");
	const [editVersionSelected, setEditVersionSelected] = useState("");

	const [expandedAside, setExpandedAside] = useState(false);

	const [versionJson, setVersionJson] = useState("");

	const [headerHeight, setHeaderHeight] = useState(0);
	const [footerHeight, setFooterHeight] = useState(0);
	const [mainHeightOffset, setMainHeightOffset] = useState(0);

	const [mainDOM, setMainDOM] = useState(null);
	const [msg, setMSG] = useState([]);

	//Referencias
	const headerDOM = useRef(null);
	const mainDOMRef = useRef(null);

	useLayoutEffect(() => {
		let footerHeight = getFooterHeight();
		let headerHeight = getHeaderHeight();
		setFooterHeight(footerHeight);
		setHeaderHeight(headerHeight);
		setMainHeightOffset(footerHeight + headerHeight);
		window.addEventListener("resize", () => {
			setFooterHeight(getFooterHeight());
			setHeaderHeight(getHeaderHeight());
		});
	}, [footerHeight, headerHeight, expandedAside]);

	useLayoutEffect(() => {
		setMainDOM(mainDOMRef);
	}, [mainDOMRef]);

	/**
	 * Calculates the height of the footer.
	 * @returns {number} The height of the footer.
	 */
	function getFooterHeight() {
		if (typeof window != "undefined") {
			const footer = document.getElementById("footerHeader");
			if (footer) {
				const footerHeight = footer.getBoundingClientRect().height + 16;
				return footerHeight;
			}
		}
	}

	/**
	 * Calculates the height of the header.
	 * @returns {number} The height of the header.
	 */
	function getHeaderHeight() {
		if (typeof window != "undefined") {
			const header = headerDOM.current;
			if (header) {
				const headerHeight = header.getBoundingClientRect().height;
				return headerHeight;
			}
		}
	}

	return (
		<PlatformContext.Provider value={{ platform, setPlatform }}>
			<MetaDataContext.Provider value={{ metaData, setMetaData }}>
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
								<ExpandedAsideContext.Provider
									value={{ expandedAside, setExpandedAside }}
								>
									<MainDOMContext.Provider value={{ mainDOM, setMainDOM }}>
										<MSGContext.Provider value={{ msg, setMSG }}>
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
																		height: `calc(100vh - ${mainHeightOffset}px)`,
																		overflow: "overlay",
																		scrollBehavior: "smooth",
																		position: "relative",
																		boxShadow: "inset 0 0 10px #ccc",
																	}}
																>
																	{children}
																</main>
																<Footer
																	msg={msg}
																	className={
																		expandedAside
																			? "col-12 col-sm-8 col-md-9 col-xl-10 g-0"
																			: "col-12 g-0"
																	}
																/>
															</Container>
														</Container>
													</div>
												</Container>
											</ReactFlowProvider>
										</MSGContext.Provider>
									</MainDOMContext.Provider>
								</ExpandedAsideContext.Provider>
							</VersionJsonContext.Provider>
						</VersionInfoContext.Provider>
					</MapInfoContext.Provider>
				</NodeInfoContext.Provider>
			</MetaDataContext.Provider>
		</PlatformContext.Provider>
	);
}
