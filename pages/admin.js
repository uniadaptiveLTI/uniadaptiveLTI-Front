import styles from "/styles/Admin.module.css";
import { Button, Container, Col, Row, Form } from "react-bootstrap";
import { useContext, useId, useLayoutEffect, useRef, useState } from "react";
import GeneralPane from "@components/panes/admin/GeneralPane";
import BrandingPane from "@components/panes/admin/BrandingPane";
import APIPane from "@components/panes/admin/APIPane";
import { toast } from "react-toastify";

import Head from "next/head";
import { fetchBackEnd, parseBool } from "../utils/Utils";
import { LTISettingsContext } from "./_app";
import { applyBranding } from "../utils/Colors";
import Link from "next/link";

export default function Admin() {
	const { LTISettings } = useContext(LTISettingsContext);

	const [activeTab, setActiveTab] = useState(0);
	const [auth, setAuth] = useState(false);
	const [lastPassword, setLastPassword] = useState("");

	const loginInputDOM = useRef();
	const LOGIN_INPUT_ID = useId();

	useLayoutEffect(() => {
		if (LTISettings) {
			applyBranding(LTISettings);
		}
	}, [LTISettings]);

	const logIn = async () => {
		if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
			try {
				setLastPassword(loginInputDOM.current.value);
				const RESPONSE = await fetchBackEnd(
					sessionStorage.getItem("token"),
					"api/lti/auth",
					"POST",
					{ password: loginInputDOM.current.value }
				);
				setAuth(RESPONSE.valid);

				if (!RESPONSE.valid) {
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
		const NEW_SETTINGS = { ...LTISettings, ...modifiedSettings };

		const RESPONSE = await fetchBackEnd(
			sessionStorage.getItem("token"),
			"api/lti/set_conf",
			"POST",
			{ password: lastPassword, settings: NEW_SETTINGS }
		);

		if (RESPONSE.ok) {
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
			{LTISettings && (
				<>
					<Head>
						<title>Panel de administración - UNI Adaptive</title>
						<meta name="description" content="Uniadaptive LTI tool" />
						<meta
							name="viewport"
							content="width=device-width, initial-scale=1"
						/>
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
												{/* <Button variant="dark" onClick={() => setActiveTab(2)}>
													Funcionalidad
												</Button> */}

												<Link
													href="/"
													style={{ marginTop: "auto", width: "100%" }}
												>
													<Button variant="dark" style={{ width: "100%" }}>
														Salir
													</Button>
												</Link>
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
											{activeTab == 0 && (
												<GeneralPane LTISettings={LTISettings} />
											)}
											{activeTab == 1 && (
												<BrandingPane
													modifySettings={modifySettings}
													LTISettings={LTISettings}
												/>
											)}
											{/* {activeTab == 2 && (
												<APIPane
													modifySettings={modifySettings}
													LTISettings={LTISettings}
												/>
											)} */}
										</Col>
									</Row>
								) : (
									<Row>
										<Col className={styles.paneContainer}>
											<div
												style={{ display: "flex", justifyContent: "center" }}
											>
												<Form
													action="#"
													method=""
													onSubmit={(e) => {
														e.preventDefault();
														logIn();
													}}
												>
													<Form.Label htmlFor={LOGIN_INPUT_ID}>
														Introduzca contraseña de administración
													</Form.Label>
													<Form.Control
														ref={loginInputDOM}
														id={LOGIN_INPUT_ID}
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
													<Link
														href="/"
														style={{ width: "100%", marginTop: "1em" }}
													>
														<Button
															variant="danger"
															padding="md"
															style={{ width: "100%" }}
														>
															Salir
														</Button>
													</Link>
												</Form>
											</div>
										</Col>
									</Row>
								)}
							</Container>
						</Container>
					</div>
				</>
			)}
		</>
	);
}
