import styles from "@components/styles/Footer.module.css";
import { useState } from "react";
import { Button, Container } from "react-bootstrap";
import { CaretDownFill, CaretUpFill } from "react-bootstrap-icons";

export default function Footer({ msg, className }) {
	const [expanded, setExpanded] = useState(msg === undefined ? false : true);

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
							border: msg ? "4px solid orange" : "4px solid green",
						}}
					></span>
				</span>
				<span
				className="d-flex "
				style={{
					alignItems: "center",
					justifyContent: "space-between",
				}}>
					{expanded ? <CaretDownFill /> : <CaretUpFill />}
				</span>
			</Container>
			<div
				className={styles.messageBox + " " + (expanded ? styles.expanded : "")}
			>
				<hr className="m-0 mb-2" />
				<Container fluid style={{ minHeight: 8 + "em" }}>
					<pre>{msg ? msg : "Sin mensajes."}</pre>
				</Container>
			</div>
		</footer>
	);
}
