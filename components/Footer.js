import { SettingsContext } from "@root/pages/_app";
import styles from "@root/styles/Footer.module.css";
import { useEffect, useState, useContext } from "react";
import { Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";

export default function Footer({ msg, className }) {
	const [expandedFooter, setExpandedFooter] = useState(
		msg.length == 0 ? false : true
	);
	const { settings } = useContext(SettingsContext);

	const parsedSettings = JSON.parse(settings);
	let { autoExpandMSGBox, autoHideMSGBox, reducedAnimations } = parsedSettings;

	useEffect(() => {
		if (autoExpandMSGBox && msg.length > 0) {
			setExpandedFooter(true);
		}
		if (autoHideMSGBox && msg.length <= 0) {
			setExpandedFooter(false);
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
				onClick={() => setExpandedFooter(!expandedFooter)}
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
					{expandedFooter ? (
						<FontAwesomeIcon icon={faCaretDown} />
					) : (
						<FontAwesomeIcon icon={faCaretUp} />
					)}
				</span>
			</Container>
			<div
				className={
					styles.messageBox +
					" " +
					(expandedFooter ? styles.expanded : "") +
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
