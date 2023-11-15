import { fetchBackEnd } from "@utils/Utils";
import styles from "/styles/AdminPane.module.css";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

export default function GeneralPane({ LTISettings }) {
	const INTERVALS = [];
	let [secondsPassed, setSecondsPassed] = useState(0);
	const [frontData, setFrontData] = useState({ uptime: 0 });
	const [frontUptimeString, setFrontUptimeString] = useState("Cargando...");
	const [backStatus, setBackStatus] = useState("Cargando...");
	const [isBackOnline, setIsBackOnline] = useState(false);
	const [resourceUsage, setResourceUsage] = useState({});
	const [systemCPUTime, setSystemCPUTime] = useState(0);

	useEffect(() => {
		let timerInterval;
		fetch(`/api/getServerInfo`)
			.then((res) => res.json())
			.then((data) => {
				timerInterval = setInterval(() => {
					setSecondsPassed((prev) => prev + 1);
				}, 1000);

				setFrontData(data);
			});
		getBackStatus().then((data) => setBackStatus(data));
		const RESOURCE_INTERVAL = setInterval(() => getResourceUsage(), 1000);
		return () => {
			clearInterval(timerInterval);
			clearInterval(RESOURCE_INTERVAL);
		};
	}, []);

	function getTimeFromSeconds(seconds) {
		let hours = Math.floor(seconds / 3600);
		let minutes = Math.floor((seconds % 3600) / 60);
		seconds = seconds % 60;
		return { hours, minutes, seconds };
	}

	function getTimeFromSecondsString(seconds) {
		if (seconds) {
			const TIME = getTimeFromSeconds(seconds);
			return `${TIME.hours}h, ${TIME.minutes}m, ${TIME.seconds}s`;
		} else {
			return "Cargando...";
		}
	}

	async function getBackStatus() {
		if (!LTISettings.debugging.dev_files) {
			let pong = false;
			try {
				const RESPONSE = await fetchBackEnd(
					LTISettings,
					sessionStorage.getItem("token"),
					"api/lti/branding/ping",
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

	async function getResourceUsage() {
		const RESPONSE = await fetch("/api/getResourceUsage/", {
			//TODO: MOVE IT TO THE BACK END
			method: "POST",
			headers: { "Content-Type": "application/json" },
		});
		const RESOURCES = await RESPONSE.json();
		setResourceUsage(RESOURCES);
	}

	function getLocaleTime(time) {
		return new Date(time).toLocaleString("es-ES", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	}

	useEffect(() => {
		if (frontData.uptime) {
			setFrontUptimeString(
				getTimeFromSecondsString(Math.floor(frontData.uptime) + secondsPassed)
			);
		}
		if (resourceUsage) {
			setSystemCPUTime(
				getTimeFromSecondsString(resourceUsage.systemCPUTime / 1000000)
			);
		}
	}, [secondsPassed]);

	return (
		<>
			<h2 className="my-4">Información general</h2>
			<details open className={styles.detailBox}>
				<summary>Información de UNIAdaptive</summary>
				<Row>
					<Col>
						<h6>Front End</h6>
						<ul>
							<li>
								<b>Fecha y hora de inicio:</b>{" "}
								{getLocaleTime(frontData.start_time) || "Cargando..."}
							</li>
							<li>
								<b>Tiempo online:</b> {frontUptimeString}
							</li>
							<li>
								<b>Tiempo en CPU:</b> {systemCPUTime || "Cargando..."}
							</li>
						</ul>
					</Col>
					<Col>
						<h6>Back End</h6>
						<ul>
							<li>
								<b>Estado:</b> {backStatus}
							</li>
							<li>
								<b>URL:</b>{" "}
								{LTISettings.debugging.dev_files
									? "USING LOCAL FILES"
									: LTISettings.back_url}
							</li>
						</ul>
					</Col>
				</Row>
			</details>
		</>
	);
}
