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
	UserDataContext,
	LTISettingsContext,
	MapInfoContext,
	MetaDataContext,
} from "./_app";
import BlockFlow from "../components/BlockFlow";
import Layout from "../components/Layout";
import { HeaderToEmptySelectorContext } from "./_app";

import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { hasLessons } from "@utils/Platform";
import { capitalizeFirstLetter } from "@utils/Utils";
import { getAutomaticReusableStyles } from "@utils/Colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSquarePlus,
	faUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { parseBool } from "../utils/Utils";

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
	const [buttonStyles, setButtonStyles] = useState({});
	const { metaData } = useContext(MetaDataContext);
	const { userData } = useContext(UserDataContext);

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
									onClick={() => funcCreateMap(null, metaData, userData, maps)}
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
								{hasLessons(metaData.platform) ? (
									<Button
										variant="light"
										onClick={() =>
											funcImportMapFromLesson(null, metaData, userData, maps)
										}
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
												Importar desde{" "}
												{capitalizeFirstLetter(metaData.platform)}...
											</p>
										</div>
									</Button>
								) : (
									<Button
										variant="light"
										onClick={() =>
											funcImportMap(undefined, metaData, userData, maps)
										}
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
												Importar desde{" "}
												{capitalizeFirstLetter(metaData.platform)}
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

export default function Home() {
	const { currentBlocksData } = useContext(BlocksDataContext);
	const { LTISettings } = useContext(LTISettingsContext);
	const { mapSelected } = useContext(MapInfoContext);
	let [metaDataReady, setMetaDataReady] = useState(false);

	useEffect(() => {
		if (MetaDataContext) setMetaDataReady(true);
	}, [MetaDataContext]);

	useEffect(() => {
		if (parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
			console.warn(
				"DEV_FILES is true, communication with the backend is disabled."
			);
		}
	}, []);
	return (
		<>
			{LTISettings && (
				<>
					<Head>
						<title>UNI Adaptive</title>
						<meta name="description" content="Uniadaptive LTI tool" />
						<meta
							name="viewport"
							content="width=device-width, initial-scale=1"
						/>

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
					</Head>

					<Layout LTISettings={LTISettings}>
						{mapSelected !== undefined ? (
							currentBlocksData !== undefined && metaDataReady ? (
								<BlockFlow map={currentBlocksData} />
							) : (
								<div className="w-100 h-100 d-flex justify-content-center align-items-center">
									<Spinner animation="border" role="status" size="sm">
										<span className="visually-hidden">Cargando...</span>
									</Spinner>
								</div>
							)
						) : (
							<EmptySelector />
						)}
					</Layout>
				</>
			)}
		</>
	);
}
