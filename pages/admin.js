import styles from "@root/styles/Admin.module.css";
import { Button, Container, Col, Row, Form } from "react-bootstrap";
import { useId, useRef, useState } from "react";
import GeneralPane from "@panes/admin/GeneralPane";
import BrandingPane from "@panes/admin/BrandingPane";
import APIPane from "@panes/admin/APIPane";
import { toast } from "react-toastify";

import fs from "fs/promises";
import path from "path";

export async function getStaticProps() {
	const filePath = path.join(process.cwd(), "configuration.json");
	const LTISettings = JSON.parse(await fs.readFile(filePath));
	return { props: { LTISettings } };
}

export default function Admin({ LTISettings }) {
	const [activeTab, setActiveTab] = useState(0);
	const [auth, setAuth] = useState(false);
	const [lastPassword, setLastPassword] = useState("");

	const loginInputDOM = useRef();
	const loginInputId = useId();

	const logIn = async () => {
		try {
			setLastPassword(loginInputDOM.current.value);
			const response = await fetch("/api/auth/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(loginInputDOM.current.value),
			});
			const result = await response.json();
			setAuth(result.valid);

			if (!result.valid) {
				toast("Contraseña incorrecta.", {
					hideProgressBar: false,
					autoClose: 4000,
					type: "error",
					position: "bottom-center",
					theme: "light",
				});
			}
		} catch (e) {
			setAuth(false);
			toast("No se puede conectar con el servidor.", {
				hideProgressBar: false,
				autoClose: 4000,
				type: "error",
				position: "bottom-center",
				theme: "light",
			});
		}
	};

	const modifySettings = async (modifiedSettings) => {
		const newSettings = { ...LTISettings, ...modifiedSettings };
		console.log(LTISettings, modifiedSettings, newSettings);
		const response = await fetch("/api/modifyLTISettings/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ password: lastPassword, settings: newSettings }),
		});
		const result = await response.json();
		console.log(result);
	};
	return (
		<div className={styles.bg}>
			<Container className={styles.mainContainer}>
				<div>
					<h1>Panel de administración</h1>
				</div>
				<Container className={styles.contentContainer}>
					{auth ? (
						<Row>
							<Col className={styles.navegationTabs} md="2">
								<img alt="Logo" src={process.env.NEXT_PUBLIC_LOGO_PATH} />
								<div className={styles.logoContainer}></div>
								<div className={styles.buttonContainer}>
									<Button variant="dark" onClick={() => setActiveTab(0)}>
										General
									</Button>
									<Button variant="dark" onClick={() => setActiveTab(1)}>
										Branding
									</Button>
									<Button variant="dark" onClick={() => setActiveTab(2)}>
										Funcionalidad
									</Button>
									<Button
										variant="dark"
										onClick={() => (window.location.href = "/")}
										style={{ marginTop: "auto" }}
									>
										Salir
									</Button>
								</div>
							</Col>
							<Col className={styles.paneContainer}>
								{activeTab == 0 && <GeneralPane {...LTISettings} />}
								{activeTab == 1 && <BrandingPane {...LTISettings} />}
								{activeTab == 2 && (
									<APIPane
										modifySettings={modifySettings}
										LTISettings={LTISettings}
									/>
								)}
							</Col>
						</Row>
					) : (
						<Row>
							<Col className={styles.paneContainer}>
								<div style={{ display: "flex", justifyContent: "center" }}>
									<Form>
										<Form.Label htmlFor={loginInputId}>
											Introduzca contraseña de administración
										</Form.Label>
										<Form.Control
											ref={loginInputDOM}
											id={loginInputId}
											type="password"
											placeholder="Contraseña"
										></Form.Control>
										<Button
											variant="primary"
											padding="md"
											style={{ width: "100%", marginTop: "2em" }}
											onClick={() => logIn()}
										>
											Enviar
										</Button>
									</Form>
								</div>
							</Col>
						</Row>
					)}
				</Container>
			</Container>
		</div>
	);
}
