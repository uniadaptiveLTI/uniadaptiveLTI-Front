import Header from "./Header";
import Aside from "./Aside";
import Footer from "./Footer";

import { Container } from "react-bootstrap";
import { useState, useRef, useLayoutEffect } from "react";
import {
	PlatformContext,
	BlockInfoContext,
	MapInfoContext,
	BlockJsonContext,
	VersionJsonContext,
	ExpandedContext,
	VersionInfoContext,
	BlocksDataContext,
	MainDOMContext,
	MSGContext,
} from "../pages/_app.js";

export default function Layout({ children }) {
	const [platform, setPlatform] = useState("moodle"); //default to moodle in testing phase

	const [blockSelected, setBlockSelected] = useState("");
	const [mapSelected, setMapSelected] = useState("");
	const [activeMap, setActiveMap] = useState("");
	const [selectedEditVersion, setSelectedEditVersion] = useState("");

	const [expanded, setExpanded] = useState(false);
	const [blockJson, setBlockJson] = useState("");
	const [versionJson, setVersionJson] = useState("");
	const [currentBlocksData, setCurrentBlocksData] = useState();

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
	}, [footerHeight, headerHeight, expanded]);

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
			<BlockInfoContext.Provider value={{ blockSelected, setBlockSelected }}>
				<MapInfoContext.Provider
					value={{ mapSelected, setMapSelected, activeMap, setActiveMap }}
				>
					<VersionInfoContext.Provider
						value={{ selectedEditVersion, setSelectedEditVersion }}
					>
						<BlockJsonContext.Provider value={{ blockJson, setBlockJson }}>
							<VersionJsonContext.Provider
								value={{ versionJson, setVersionJson }}
							>
								<ExpandedContext.Provider value={{ expanded, setExpanded }}>
									<BlocksDataContext.Provider
										value={{ currentBlocksData, setCurrentBlocksData }}
									>
										<MainDOMContext.Provider value={{ mainDOM, setMainDOM }}>
											<MSGContext.Provider value={{ msg, setMSG }}>
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
															className={
																expanded
																	? "col-12 col-sm-4 col-md-3 col-xl-2"
																	: "d-none"
															}
														/>
														<Container
															fluid
															className={
																expanded
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
																<Header ref={headerDOM} />

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
																		expanded
																			? "col-12 col-sm-8 col-md-9 col-xl-10 g-0"
																			: "col-12 g-0"
																	}
																/>
															</Container>
														</Container>
													</div>
												</Container>
											</MSGContext.Provider>
										</MainDOMContext.Provider>
									</BlocksDataContext.Provider>
								</ExpandedContext.Provider>
							</VersionJsonContext.Provider>
						</BlockJsonContext.Provider>
					</VersionInfoContext.Provider>
				</MapInfoContext.Provider>
			</BlockInfoContext.Provider>
		</PlatformContext.Provider>
	);
}
