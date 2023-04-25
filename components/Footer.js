import { SettingsContext } from "@components/pages/_app";
import styles from "@components/styles/Footer.module.css";
import { useEffect, useState, useContext } from "react";
import { Container } from "react-bootstrap";
import { CaretDownFill, CaretUpFill } from "react-bootstrap-icons";

export default function Footer({ msg, className }) {
	const [expanded, setExpanded] = useState(msg.length == 0 ? false : true);
	const { settings } = useContext(SettingsContext);

	const parsedSettings = JSON.parse(settings);
	let { autoExpandMSGBox, autoHideMSGBox, reducedAnimations } = parsedSettings;

	useEffect(() => {
		if (autoExpandMSGBox && msg.length > 0) {
			setExpanded(true);
		}
		if (autoHideMSGBox && msg.length <= 0) {
			setExpanded(false);
		}
	}, [msg.length]);

	return (
		<footer id="footer" className={className + " " + styles.footer}>
			<Container
				id="footerHeader"
				role="button"
				fluid
				className="d-flex justify-content-between my-2"
				style={{ height: "2.5em" }}
				onClick={() => setExpanded(!expanded)}
			>
				<span
					className="d-flex "
					style={{
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					Mensajes
					<span
						style={{
							marginBottom: "1em",
							marginLeft: "0.25em",
							borderRadius: "100%",
							border: msg.length > 0 ? "4px solid orange" : "4px solid green",
						}}
					></span>
				</span>
				<span
					className="d-flex "
					style={{
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					{expanded ? <CaretDownFill /> : <CaretUpFill />}
				</span>
			</Container>
			<div
				className={
					styles.messageBox +
					" " +
					(expanded ? styles.expanded : "") +
					" " +
					(reducedAnimations && styles.noAnimation)
				}
			>
				<hr className="m-0 mb-2" />
				<Container fluid style={{ height: 8 + "em" }}>
					<div>
						{msg.length > 0 ? msg.map((msg) => <p>{msg}</p>) : "Sin mensajes."}
					</div>
				</Container>
			</div>
		</footer>
	);
}
