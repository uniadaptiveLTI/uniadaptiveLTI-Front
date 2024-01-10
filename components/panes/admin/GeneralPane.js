import { fetchBackEnd } from "@utils/Utils";
import styles from "/styles/AdminPane.module.css";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { parseBool } from "../../../utils/Utils";

export default function GeneralPane() {
	const [backStatus, setBackStatus] = useState("Cargando...");
	const [isBackOnline, setIsBackOnline] = useState(false);

	useEffect(() => {
		getBackStatus().then((data) => setBackStatus(data));
	}, []);

	async function getBackStatus() {
		if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
			let pong = false;
			try {
				const RESPONSE = await fetchBackEnd(
					sessionStorage.getItem("token"),
					"api/lti/ping",
					"POST",
					{ ping: "ping" }
				);
				const RESULT = await RESPONSE;
				pong = RESULT.pong;
			} catch (e) {
				console.error("No se puede conectar con el back end");
			}

			if (pong == "pong") {
				setIsBackOnline(true);
				return <span style={{ color: "var(--bs-success)" }}>OK</span>;
			} else {
				return <span style={{ color: "var(--bs-error)" }}>Error</span>;
			}
		} else {
			return (
				<span style={{ color: "var(--bs-warning)" }}>Using DEV_FILES</span>
			);
		}
	}

	return (
		<>
			<h2 className="my-4">Información general</h2>
			<details open className={styles.detailBox}>
				<summary>Información del Back End de UNIAdaptive </summary>
				<Row>
					<Col>
						<ul>
							<li>
								<b>Estado:</b> {backStatus}
							</li>
							<li>
								<b>URL:</b>{" "}
								{parseBool(process.env.NEXT_PUBLIC_DEV_FILES)
									? "USING LOCAL FILES"
									: process.env.NEXT_PUBLIC_BACK_URL}
							</li>
						</ul>
					</Col>
				</Row>
			</details>
		</>
	);
}
