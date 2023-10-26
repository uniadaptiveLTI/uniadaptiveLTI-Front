import styles from "/styles/Admin.module.css";
import { Button, Container, Col, Row, Form } from "react-bootstrap";
import { useId, useRef, useState } from "react";
import GeneralPane from "@components/panes/admin/GeneralPane";
import BrandingPane from "@components/panes/admin/BrandingPane";
import APIPane from "@components/panes/admin/APIPane";
import { toast } from "react-toastify";

import fs from "fs/promises";
import path from "path";
import Head from "next/head";

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
		if (!LTISettings.debugging.dev_files) {
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
		} else {
			setAuth(true);
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
		if (result.ok) {
			toast(
				"Se han modificado los ajustes. Reinicia para aplicar los cambios.",
				{
					hideProgressBar: false,
					autoClose: 4000,
					type: "success",
					position: "bottom-center",
					theme: "light",
				}
			);
		} else {
			toast("Ha ocurrido un error.", {
				hideProgressBar: false,
				autoClose: 2000,
				type: "error",
				position: "bottom-center",
				theme: "light",
			});
		}
	};
	return (
		<>
			<Head>
				<title>Panel de administración - UNI Adaptive</title>
				<meta name="description" content="Uniadaptive LTI tool" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
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
				<link rel="manifest" href="/site.webmanifest" />
			</Head>
			<div className={styles.bg}>
				<Container className={styles.mainContainer}>
					<div>
						<h1>Panel de administración</h1>
					</div>
					<Container className={styles.contentContainer}>
						{auth ? (
							<Row>
								<Col
									className={styles.navegationTabs}
									xs="12"
									sm="3"
									md="3"
									xl="2"
								>
									<img alt="Logo" src={LTISettings.branding.logo_path} />
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
								<Col
									className={styles.paneContainer}
									xs="12"
									sm="3"
									md="5"
									lg="7"
									xl="10"
								>
									{activeTab == 0 && <GeneralPane LTISettings={LTISettings} />}
									{activeTab == 1 && (
										<BrandingPane
											modifySettings={modifySettings}
											LTISettings={LTISettings}
										/>
									)}
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
										<Form action="#" method="" onSubmit={() => logIn()}>
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
											<Button
												variant="danger"
												padding="md"
												onClick={() => (window.location.href = "/")}
												style={{ width: "100%", marginTop: "1em" }}
											>
												Salir
											</Button>
										</Form>
									</div>
								</Col>
							</Row>
						)}
					</Container>
				</Container>
			</div>
		</>
	);
}
