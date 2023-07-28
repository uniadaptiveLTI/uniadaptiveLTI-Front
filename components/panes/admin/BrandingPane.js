import InlineColorSelector from "@components/forms/components/InlineColorSelector";
import InlineButtonSelector from "@components/forms/components/InlineButtonSelector";
import styles from "@root/styles/AdminPane.module.css";
import { getRootStyle, getAutomaticTextColorsObject } from "@utils/Colors";
import { useState, useId, useRef } from "react";
import { Col, Row, Button, Form } from "react-bootstrap";

export default function BrandingPane({ modifySettings, LTISettings }) {
	const favFallbackDOM = useRef(null);
	const favFallbackId = useId();
	const favx16DOM = useRef(null);
	const favx16Id = useId();
	const [rtfavx16URL, setRTfavx16URL] = useState(
		LTISettings.branding.faviconx16_path
	);
	const favx32DOM = useRef(null);
	const favx32Id = useId();
	const [rtfavx32URL, setRTfavx32URL] = useState(
		LTISettings.branding.faviconx32_path
	);
	const favx180DOM = useRef(null);
	const favx180Id = useId();
	const [rtfavx180URL, setRTfavx180URL] = useState(
		LTISettings.branding.faviconx180_path
	);
	const logoDOM = useRef(null);
	const logoId = useId();
	const [rtLogoURL, setRTLogoURL] = useState(LTISettings.branding.logo_path);
	const smallLogoDOM = useRef(null);
	const smallLogoId = useId();
	const [rtSmallLogoURL, setRTSmallLogoURL] = useState(
		LTISettings.branding.small_logo_path
	);

	//Colors
	//-------Main
	const [mainFontColor, setMainFontColor] = useState(
		getRootStyle("--main-font-color")
	);
	const [mainDefaultBackground, setMainDefaultBackground] = useState(
		getRootStyle("--main-ui-default-background")
	);
	const [mainSecondaryBackground, setMainSecondaryBackground] = useState(
		getRootStyle("--main-ui-secondary-background")
	);
	const [mainThirdBackground, setMainThirdBackground] = useState(
		getRootStyle("--main-ui-third-background")
	);
	//-------Reusable
	const [primaryBackgroundColor, setPrimaryBackgroundColor] = useState(
		getRootStyle("--primary-background-color")
	);
	const [primaryBorders, setPrimaryBorders] = useState({
		line: getRootStyle("--primary-border"),
		radius: getRootStyle("--primary-border-radius"),
	});
	const [secondaryBackgroundColor, setSecondaryBackgroundColor] = useState(
		getRootStyle("--secondary-background-color")
	);
	const [secondaryBorders, setSecondaryBorders] = useState({
		line: getRootStyle("--secondary-border"),
		radius: getRootStyle("--secondary-border-radius"),
	});

	const [lightBackgroundColor, setLightBackgroundColor] = useState(
		getRootStyle("--light-background-color")
	);
	const [lightBorders, setLightBorders] = useState({
		line: getRootStyle("--light-border"),
		radius: getRootStyle("--light-border-radius"),
	});

	const [successBackground, setSuccessBackground] = useState(
		getRootStyle("--success-background-color")
	);
	const [successBorders, setSuccessBorders] = useState({
		line: getRootStyle("--success-border"),
		radius: getRootStyle("--success-border-radius"),
	});

	const [warningBackground, setWarningBackground] = useState(
		getRootStyle("--warning-background-color")
	);
	const [warningBorders, setWarningBorders] = useState({
		line: getRootStyle("--warning-border"),
		radius: getRootStyle("--warning-border-radius"),
	});

	const [errorBackground, setErrorBackground] = useState(
		getRootStyle("--error-background-color")
	);
	const [errorBorders, setErrorBorders] = useState({
		line: getRootStyle("--error-border"),
		radius: getRootStyle("--error-border-radius"),
	});
	//-------Header
	const [headerBackgroundColor, setHeaderBackgroundColor] = useState(
		getRootStyle("--header-background-color")
	);
	const [
		headerActionButtonsBackgroundColor,
		setHeaderActionButtonsBackgroundColor,
	] = useState(getRootStyle("--header-action-buttons-background-color"));
	const [
		headerVersionDropdownContainerBackgroundColor,
		setHeaderVersionDropdownContainerBackgroundColor,
	] = useState(
		getRootStyle("--header-version-dropdown-container-background-color")
	);
	//-------Aside
	const [asideBackgroundColor, setAsideBackgroundColor] = useState(
		getRootStyle("--aside-background-color")
	);
	const [asideCollapseIconColor, setAsideCollapseIconColor] = useState(
		getRootStyle("--aside-collapse-icon-color")
	);
	const [
		asideCollapseIconBackgroundColor,
		setAsideCollapseIconBackgroundColor,
	] = useState(getRootStyle("--aside-collapse-icon-background-color"));
	//-------Footer
	const [footerBackgroundColor, setFooterBackgroundColor] = useState(
		getRootStyle("--footer-background-color")
	);
	const [footerMsgboxBackgroundColor, setFooterMsgboxBackgroundColor] =
		useState(getRootStyle("--footer-msgbox-background-color"));
	//-------Blockflow
	const [blockflowFontColor, setBlockflowFontColor] = useState(
		getRootStyle("--blockflow-font-color")
	);
	const [blockflowBackgroundColor, setBlockflowBackgroundColor] = useState(
		getRootStyle("--blockflow-background-color")
	);
	const [blockflowTextBackgroundColor, setBlockflowTextBackgroundColor] =
		useState(getRootStyle("--blockflow-text-background-color"));
	const [blockflowEdgeBackground, setBlockflowEdgeBackground] = useState(
		getRootStyle("--blockflow-edge-background")
	);
	const [blockflowEdgeFontColor, setBlockflowEdgeFontColor] = useState(
		getRootStyle("--blockflow-edge-font-color")
	);
	const [
		blockflowControlsButtonBackgroundColor,
		setBlockflowControlsButtonBackgroundColor,
	] = useState(getRootStyle("--blockflow-controls-button-background-color"));
	const [
		blockflowControlsButtonFontColor,
		setBlockflowControlsButtonFontColor,
	] = useState(getRootStyle("--blockflow-controls-button-font-color"));
	return (
		<>
			<h2 className="my-4">Branding</h2>

			<h4 className="my-2">Favicons</h4>

			<table className={styles.detailTable + " w-100 my-2"}>
				<thead>
					<tr>
						<th>Fallback</th>
						<th>x16</th>
						<th>x32</th>
						<th>x180</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className={styles.center}>
							<img
								src={"favicon.ico"}
								alt="Imagen válida como favicon"
								width={48}
							/>
						</td>
						<td className={styles.center}>
							<img
								src={rtfavx16URL}
								alt="Imagen válida como favicon"
								width={16}
							></img>
						</td>
						<td className={styles.center}>
							<img
								src={rtfavx32URL}
								alt="Imagen válida como favicon"
								width={32}
							></img>
						</td>
						<td className={styles.center}>
							<img
								src={rtfavx180URL}
								alt="Imagen válida como favicon"
								width={180}
							></img>
						</td>
					</tr>
				</tbody>
			</table>
			<Form>
				<Row>
					<Col>
						<Form.Label htmlFor={favFallbackId}>
							Fallback (Ha de ser editado manualmente)
						</Form.Label>
						<Form.Control
							type="url"
							ref={favFallbackDOM}
							id={favFallbackId}
							defaultValue={"favicon.ico"}
							disabled={true}
						></Form.Control>
					</Col>
					<Col>
						<Form.Label htmlFor={favx16Id}>x16</Form.Label>
						<Form.Control
							type="url"
							ref={favx16DOM}
							id={favx16Id}
							defaultValue={LTISettings.branding.faviconx16_path}
							onChange={(e) => setRTfavx16URL(e.target.value)}
						></Form.Control>
					</Col>
				</Row>
				<Row>
					<Col>
						<Form.Label htmlFor={favx32Id}>x32</Form.Label>
						<Form.Control
							type="url"
							ref={favx32DOM}
							id={favx32Id}
							defaultValue={LTISettings.branding.faviconx32_path}
							onChange={(e) => setRTfavx32URL(e.target.value)}
						></Form.Control>
					</Col>
					<Col>
						<Form.Label htmlFor={favx180Id}>x180</Form.Label>
						<Form.Control
							type="url"
							ref={favx180DOM}
							id={favx180Id}
							defaultValue={LTISettings.branding.faviconx180_path}
							onChange={(e) => setRTfavx180URL(e.target.value)}
						></Form.Control>
					</Col>
				</Row>
			</Form>

			<h4 className="my-4">Logos</h4>

			<table className={styles.detailTable + " w-100 my-2"}>
				<thead>
					<tr>
						<th>Logo</th>
						<th>Logo reducido</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className={styles.center}>
							<img
								src={rtLogoURL}
								alt="Imagen válida para usar como logo de la aplicación"
								width={350}
							/>
						</td>
						<td className={styles.center}>
							<img
								src={rtSmallLogoURL}
								alt="Imagen válida para usar como logo reducido de la aplicación"
								width={80}
							></img>
						</td>
					</tr>
				</tbody>
			</table>
			<Form>
				<Row>
					<Col>
						<Form.Label htmlFor={logoId}>URL hacia el logo</Form.Label>
						<Form.Control
							type="url"
							ref={logoDOM}
							id={logoId}
							defaultValue={LTISettings.branding.logo_path}
							onChange={(e) => setRTLogoURL(e.target.value)}
						></Form.Control>
					</Col>
					<Col>
						<Form.Label htmlFor={smallLogoId}>
							URL hacia el logo reducido
						</Form.Label>
						<Form.Control
							type="url"
							ref={smallLogoDOM}
							id={smallLogoId}
							defaultValue={LTISettings.branding.small_logo_path}
							onChange={(e) => setRTSmallLogoURL(e.target.value)}
						></Form.Control>
					</Col>
				</Row>
			</Form>

			<h4 className="my-4">Colores</h4>
			<p
				style={{
					...getAutomaticTextColorsObject("--warning-background-color"),
					padding: "1rem",
					textAlign: "center",
				}}
			>
				<b>Atención:</b> Es posible que la accesibilidad de la aplicación se vea
				afectada si se cambia algún ajuste de colores.
			</p>
			<h5>Interfaz principal</h5>
			<i>Principales colores utilizados para gran parte de la interfaz</i>

			<InlineColorSelector
				label={
					<span>
						Color de la fuente{" "}
						<b>(Valores distintos al negro pueden presentar problemas)</b>
					</span>
				}
				color={mainFontColor}
				setColor={setMainFontColor}
			></InlineColorSelector>
			<InlineColorSelector
				label={"Color de fondo principal"}
				color={mainDefaultBackground}
				setColor={setMainDefaultBackground}
			></InlineColorSelector>
			<InlineColorSelector
				label={"Color de fondo secundario"}
				color={mainSecondaryBackground}
				setColor={setMainSecondaryBackground}
			></InlineColorSelector>
			<InlineColorSelector
				label={"Color de fondo terciario"}
				color={mainThirdBackground}
				setColor={setMainThirdBackground}
			></InlineColorSelector>

			<h5>Colores reusables</h5>
			<i>
				Colores utilizados en diversos componentes de la interfaz, el borde se
				utilzará en elementos que requieran borde (si ha sido proporcionado)
			</i>
			<div>
				<InlineButtonSelector
					label="Color de tipo primario"
					background={primaryBackgroundColor}
					setBackground={setPrimaryBackgroundColor}
					border={primaryBorders}
					setBorder={setPrimaryBorders}
				/>
				<InlineButtonSelector
					label="Color de tipo secundario"
					background={secondaryBackgroundColor}
					setBackground={setSecondaryBackgroundColor}
					border={secondaryBorders}
					setBorder={setSecondaryBorders}
				/>
				<InlineButtonSelector
					label="Color de tipo ligero"
					background={lightBackgroundColor}
					setBackground={setLightBackgroundColor}
					border={lightBorders}
					setBorder={setLightBorders}
				/>
				<InlineButtonSelector
					label="Color de tipo éxito"
					background={successBackground}
					setBackground={setSuccessBackground}
					border={successBorders}
					setBorder={setSuccessBorders}
				/>
				<InlineButtonSelector
					label="Color de tipo advertencia"
					background={warningBackground}
					setBackground={setWarningBackground}
					border={warningBorders}
					setBorder={setWarningBorders}
				/>
				<InlineButtonSelector
					label="Color de tipo error"
					background={errorBackground}
					setBackground={setErrorBackground}
					border={errorBorders}
					setBorder={setErrorBorders}
				/>
			</div>

			<h5>Encabezado</h5>
			<InlineColorSelector
				label={"Color de fondo del encabezado"}
				color={headerBackgroundColor}
				setColor={setHeaderBackgroundColor}
			></InlineColorSelector>
			<InlineColorSelector
				label={"Color de fondo de los botones de acción del encabezado"}
				color={headerActionButtonsBackgroundColor}
				setColor={setHeaderActionButtonsBackgroundColor}
			></InlineColorSelector>
			<InlineColorSelector
				label={
					"Color de fondo del contenedor del desplegable de versión del encabezado"
				}
				color={headerVersionDropdownContainerBackgroundColor}
				setColor={setHeaderVersionDropdownContainerBackgroundColor}
			></InlineColorSelector>

			<h5>Panel lateral</h5>

			<InlineColorSelector
				label={"Color de fondo del panel lateral"}
				color={asideBackgroundColor}
				setColor={setAsideBackgroundColor}
			></InlineColorSelector>
			<InlineColorSelector
				label={"Color del icono de colapso del panel lateral"}
				color={asideCollapseIconColor}
				setColor={setAsideCollapseIconColor}
			></InlineColorSelector>
			<InlineColorSelector
				label={"Color de fondo del icono de colapso del panel lateral"}
				color={asideCollapseIconBackgroundColor}
				setColor={setAsideCollapseIconBackgroundColor}
			></InlineColorSelector>

			<h5>Pie de página</h5>

			<InlineColorSelector
				label={"Color de fondo del pie de página"}
				color={footerBackgroundColor}
				setColor={setFooterBackgroundColor}
			></InlineColorSelector>
			<InlineColorSelector
				label={"Color de fondo del cuadro de mensaje del pie de página"}
				color={footerMsgboxBackgroundColor}
				setColor={setFooterMsgboxBackgroundColor}
			></InlineColorSelector>

			<h5>Flujo</h5>

			<InlineColorSelector
				label={"Color de la fuente del flujo de bloques"}
				color={blockflowFontColor}
				setColor={setBlockflowFontColor}
			></InlineColorSelector>
			<InlineColorSelector
				label={`Color de fondo del flujo de bloques (utilizar "none" para hacerlo transparente)`}
				color={blockflowBackgroundColor}
				setColor={setBlockflowBackgroundColor}
			></InlineColorSelector>
			<InlineColorSelector
				label={`Color de fondo del texto del flujo de bloques (utilizar "none" para hacerlo transparente)`}
				color={blockflowTextBackgroundColor}
				setColor={setBlockflowTextBackgroundColor}
			></InlineColorSelector>
			<InlineColorSelector
				label={"Color de fondo del borde del flujo de bloques"}
				color={blockflowEdgeBackground}
				setColor={setBlockflowEdgeBackground}
			></InlineColorSelector>
			<InlineColorSelector
				label={"Color de la fuente del borde del flujo de bloques"}
				color={blockflowEdgeFontColor}
				setColor={setBlockflowEdgeFontColor}
			></InlineColorSelector>
			<InlineColorSelector
				label={"Color de fondo del botón de controles del flujo de bloques"}
				color={blockflowControlsButtonBackgroundColor}
				setColor={setBlockflowControlsButtonBackgroundColor}
			></InlineColorSelector>
			<InlineColorSelector
				label={"Color de la fuente del botón de controles del flujo de bloques"}
				color={blockflowControlsButtonFontColor}
				setColor={setBlockflowControlsButtonFontColor}
			></InlineColorSelector>

			<Button
				className="mt-2"
				onClick={() => {
					modifySettings({
						branding: {
							...LTISettings.branding,
							faviconx16_path: favx16DOM.current.value,
							faviconx32_path: favx32DOM.current.value,
							faviconx180_path: favx180DOM.current.value,
							logo_path: logoDOM.current.value,
							small_logo_path: smallLogoDOM.current.value,
						},
					});
				}}
			>
				Modificar
			</Button>
		</>
	);
}
