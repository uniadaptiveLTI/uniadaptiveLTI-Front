import Head from "next/head";
import { createContext, useContext, useEffect } from "react";
import { BlocksDataContext, DevModeStatusContext } from "./_app";
import BlockFlow from "@root/components/BlockFlow";
import Layout from "../components/Layout";

import fs from "fs/promises";
import path from "path";

export async function getStaticProps() {
	const filePath = path.join(process.cwd(), "configuration.json");
	const LTISettings = JSON.parse(await fs.readFile(filePath));
	return { props: { LTISettings } };
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
					href={process.env.NEXT_PUBLIC_FAVICONx180_PATH}
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href={process.env.NEXT_PUBLIC_FAVICONx32_PATH}
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href={process.env.NEXT_PUBLIC_FAVICONx16_PATH}
				/>
				<link rel="manifest" href="/site.webmanifest" />
			</Head>
			{LTISettings && (
				<Layout LTISettings={LTISettings}>
					{currentBlocksData ? (
						<BlockFlow map={currentBlocksData}></BlockFlow>
					) : (
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								height: "100%",
							}}
						>
							<h1>No se ha seleccionado ningún mapa</h1>
						</div>
					)}
				</Layout>
			)}
		</>
	);
}
