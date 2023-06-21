import styles from "@root/styles/AdminPane.module.css";
import { BACK_URL } from "pages/_app";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

export default function GeneralPane() {
	const intervals = [];
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
		const resourceInterval = setInterval(() => getResourceUsage(), 1000);
		return () => {
			clearInterval(timerInterval);
			clearInterval(resourceInterval);
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
			const time = getTimeFromSeconds(seconds);
			return `${time.hours}h, ${time.minutes}m, ${time.seconds}s`;
		} else {
			return "Cargando...";
		}
	}

	async function getBackStatus() {
		if (!process.env.NEXT_PUBLIC_DEV_FILES) {
			const response = await fetch("/api/auth/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify("ping"),
			});
			const result = await response.json();
			const pong = result.response;

			if (pong) {
				setIsBackOnline(true);
				return (
					<span style={{ color: "var(--success-background-color)" }}>OK</span>
				);
			} else {
				return (
					<span style={{ color: "var(--error-background-color)" }}>Error</span>
				);
			}
		} else {
			return (
				<span style={{ color: "var(--warning-background-color)" }}>
					Using DEV_FILES
				</span>
			);
		}
	}

	async function getResourceUsage() {
		const response = await fetch("/api/getResourceUsage/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		});
		const resources = await response.json();
		setResourceUsage(resources);
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
			<h2>Información general</h2>
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
								{process.env.NEXT_PUBLIC_DEV_FILES
									? "USING LOCAL FILES"
									: BACK_URL}
							</li>
							<li>
								<b>Fecha y hora de inicio:</b>{" "}
								{process.env.NEXT_PUBLIC_DEV_FILES
									? "USING LOCAL FILES"
									: "Ver abajo"}
							</li>
							<li>
								<b>Tiempo online:</b>{" "}
								{process.env.NEXT_PUBLIC_DEV_FILES
									? "USING LOCAL FILES"
									: "Faltan funciones en el back"}
							</li>
						</ul>
					</Col>
				</Row>
			</details>
		</>
	);
}
