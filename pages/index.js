import Head from "next/head";
import {
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useState,
} from "react";
import {
	BlocksDataContext,
	DevModeStatusContext,
	PlatformContext,
	MetaDataContext,
} from "./_app";
import BlockFlow from "/components/BlockFlow";
import Layout from "../components/Layout";
import { HeaderToEmptySelectorContext } from "./_app";

import fs from "fs/promises";
import path from "path";
import { Button, Col, Container, Row } from "react-bootstrap";
import { hasLessons } from "@utils/Platform";
import { capitalizeFirstLetter } from "@utils/Utils";
import { getAutomaticReusableStyles } from "@utils/Colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSquarePlus,
	faUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";

export async function getStaticProps() {
	const filePath = path.join(process.cwd(), "configuration.json");
	const LTISettings = JSON.parse(await fs.readFile(filePath));
	return { props: { LTISettings } };
}

function EmptySelector() {
	const {
		mapCount,
		mapNames,
		allowUseStatus,
		maps,
		funcCreateMap,
		funcImportMap,
		funcImportMapFromLesson,
		funcMapChange,
	} = useContext(HeaderToEmptySelectorContext);
	const { platform } = useContext(PlatformContext);
	const [buttonStyles, setButtonStyles] = useState({});
	const { metaData } = useContext(MetaDataContext);

	useLayoutEffect(() => {
		setButtonStyles(getAutomaticReusableStyles("light", true, true, false));
	}, []);

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100%",
			}}
		>
			<Container fluid>
				{allowUseStatus ? (
					<>
						{mapCount < 2 && (
							<>
								<h1 className="text-center">
									No se han encontrado mapas asociados al curso
								</h1>
								<p className="text-center">
									Seleccione una de las dos opciones inferiores para crear su
									primer mapa
								</p>
							</>
						)}
						<Row>
							<Col>
								<Button
									variant="light"
									onClick={() => funcCreateMap(null, null, maps)}
									className="w-100"
									style={{
										...buttonStyles,
										height: "20rem",
										fontSize: "150%",
									}}
								>
									<div className="d-flex justify-content-center align-items-center m-1">
										<FontAwesomeIcon icon={faSquarePlus} />
										<p className="m-1">Crear nuevo mapa vacío</p>
									</div>
								</Button>
							</Col>
							<Col>
								{hasLessons(platform) ? (
									<Button
										variant="light"
										onClick={() => funcImportMapFromLesson(null, maps)}
										className="w-100"
										style={{
											...buttonStyles,
											height: "20rem",
											fontSize: "150%",
										}}
									>
										<div className="d-flex justify-content-center align-items-center m-1">
											<FontAwesomeIcon icon={faUpRightFromSquare} />
											<p className="m-1">
												Importar desde {capitalizeFirstLetter(platform)}...
											</p>
										</div>
									</Button>
								) : (
									<Button
										variant="light"
										onClick={() => funcImportMap(undefined, metaData, maps)}
										className="w-100"
										style={{
											...buttonStyles,
											height: "20rem",
											fontSize: "150%",
										}}
									>
										<div className="d-flex justify-content-center align-items-center m-1">
											<FontAwesomeIcon icon={faUpRightFromSquare} />
											<p className="m-1">
												Importar desde {capitalizeFirstLetter(platform)}
											</p>
										</div>
									</Button>
								)}
							</Col>
							{mapCount > 1 && (
								<p className="text-center">
									Alternativamente, seleccione uno desde el selector superior.
								</p>
							)}
						</Row>
					</>
				) : (
					<h1 className="text-center">Cargando...</h1>
				)}
			</Container>
		</div>
	);
}

export default function Home({ LTISettings }) {
	const { currentBlocksData } = useContext(BlocksDataContext);
	const { devModeStatus, setDevModeStatus } = useContext(DevModeStatusContext);

	useEffect(() => {
		if (LTISettings.debugging.dev_files) {
			console.warn(
				"DEV_FILES is true, communication with the backend is disabled."
			);
		}
		if (LTISettings.debugging.dev_mode) {
			setDevModeStatus(LTISettings.debugging.dev_mode);
		}
	}, []);
	return (
		<>
			<Head>
				<title>UNI Adaptive</title>
				<meta name="description" content="Uniadaptive LTI tool" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href={LTISettings.branding.faviconx180_path}
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href={LTISettings.branding.faviconx32_path}
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href={LTISettings.branding.faviconx16_path}
				/>
				<link rel="manifest" href="/site.webmanifest" />
			</Head>
			{LTISettings && (
				<Layout LTISettings={LTISettings}>
					{currentBlocksData != "" && currentBlocksData != undefined ? (
						<BlockFlow map={currentBlocksData}></BlockFlow>
					) : (
						<EmptySelector />
					)}
				</Layout>
			)}
		</>
	);
}
