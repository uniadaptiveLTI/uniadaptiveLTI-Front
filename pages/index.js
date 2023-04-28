import Head from "next/head";
import { useContext } from "react";
import { MapContext } from "./_app";
import BlockCanvas from "@components/components/BlockCanvas";

export default function Home() {
	const { map, setMap } = useContext(MapContext);
	return (
		<>
			<Head>
				<title>UNI Adaptive</title>
				<meta name="description" content="Uniadaptive LTI tool" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />
			</Head>
			{typeof map != "string" ? (
				<BlockCanvas></BlockCanvas>
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
		</>
	);
}
