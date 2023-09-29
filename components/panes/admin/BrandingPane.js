import InlineColorSelector from "@components/forms/components/InlineColorSelector";
import UISelection from "@components/forms/components/UISelection";
import styles from "/styles/AdminPane.module.css";
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
	const [mainFontFamily, setMainFontFamily] = useState(
		getRootStyle("--main-font-family")
	);
	const [mainBorderRadius, setMainBorderRadius] = useState(
		getRootStyle("--main-border-radius")
	);
	const [mainDefaultBackground, setMainDefaultBackground] = useState(
		getRootStyle("--main-background-color")
	);
	const [mainSecondaryBackground, setMainSecondaryBackground] = useState(
		getRootStyle("--main-secondary-background-color")
	);
	const [mainThirdBackground, setMainThirdBackground] = useState(
		getRootStyle("--main-third-background-color")
	);
	//-------Main
	const [uiSelected, setUISelected] = useState(-1);
	//-------Header
	const [headerFontColor, setHeaderFontColor] = useState(
		getRootStyle("--header-font-color")
	);
	const [headerFontFamily, setHeaderFontFamily] = useState(
		getRootStyle("--header-font-family")
	);
	const [headerBackgroundColor, setHeaderBackgroundColor] = useState(
		getRootStyle("--header-background-color")
	);
	const [headerUserImageBorderRadius, setHeaderUserImageBorderRadius] =
		useState(getRootStyle("--header-user-image-border-radius"));
	const [headerUserImageBorderWidth, setHeaderUserImageBorderWidth] = useState(
		getRootStyle("--header-user-image-border-width")
	);
	const [headerUserImageBorderColor, setHeaderUserImageBorderColor] = useState(
		getRootStyle("--header-user-image-border-color")
	);
	//-------Header---ActionButtons
	const [headerActionButtonsSvgFilter, setHeaderActionButtonsSvgFilter] =
		useState(getRootStyle("--header-action-buttons-svg-filter"));
	const [
		headerActionButtonsBackgroundColor,
		setHeaderActionButtonsBackgroundColor,
	] = useState(getRootStyle("--header-action-buttons-background-color"));
	const [headerActionButtonsBorderRadius, setHeaderActionButtonsBorderRadius] =
		useState(getRootStyle("--header-action-buttons-border-radius"));
	//-------Header---versionDropdown
	const [
		headerVersionDropdownContainerFontColor,
		setVersionDropdownContainerHeaderFontColor,
	] = useState(getRootStyle("--header-version-dropdown-container-font-color"));
	const [
		headerVersionDropdownContainerFontFamily,
		setVersionDropdownContainerHeaderFontFamily,
	] = useState(getRootStyle("--header-version-dropdown-container-font-family"));
	const [
		headerVersionDropdownContainerBackgroundColor,
		setHeaderVersionDropdownContainerBackgroundColor,
	] = useState(
		getRootStyle("--header-version-dropdown-container-background-color")
	);
	const [
		headerVersionDropdownContainerBoxShadowColor,
		setHeaderVersionDropdownContainerBoxShadowColor,
	] = useState(getRootStyle("--header-version-dropdown-box-shadow-color"));
	//-------Aside
	const [asideFontColor, setAsideFontColor] = useState(
		getRootStyle("--aside-font-color")
	);
	const [asideFontFamily, setAsideFontFamily] = useState(
		getRootStyle("--aside-font-family")
	);
	const [asideBackgroundColor, setAsideBackgroundColor] = useState(
		getRootStyle("--aside-background-color")
	);
	//-------Aside---Collapse
	const [asideCollapseIconColor, setAsideCollapseIconColor] = useState(
		getRootStyle("--aside-collapse-icon-color")
	);
	const [
		asideCollapseIconBackgroundColor,
		setAsideCollapseIconBackgroundColor,
	] = useState(getRootStyle("--aside-collapse-icon-background-color"));
	//-------Aside---Logo
	const [asideLogoBackgroundColor, setAsideLogoBackgroundColor] = useState(
		getRootStyle("--aside-logo-background-color")
	);
	//-------Blockflow
	const [blockflowFontColor, setBlockflowFontColor] = useState(
		getRootStyle("--blockflow-font-color")
	);
	const [blockflowFontFamily, setBlockflowFontFamily] = useState(
		getRootStyle("--blockflow-font-family")
	);
	const [blockflowBackgroundColor, setBlockflowBackgroundColor] = useState(
		getRootStyle("--blockflow-background-color")
	);
	const [blockflowInnerBoxShadowColor, setBlockflowInnerBoxShadowColor] =
		useState(getRootStyle("--blockflow-inner-box-shadow-color"));
	//-------Blockflow---Nodes
	const [blockflowNodeBorderRadius, setBlockflowNodeBorderRadius] = useState(
		getRootStyle("--blockflow-node-border-radius")
	);
	const [blockflowNodeBorderWidth, setBlockflowNodeBorderWidth] = useState(
		getRootStyle("--blockflow-node-border-width")
	);
	const [blockflowNodeBorderColor, setBlockflowNodeBorderColor] = useState(
		getRootStyle("--blockflow-node-border-color")
	);
	const [blockflowHandlesBorderRadius, setBlockflowHandlesBorderRadius] =
		useState(getRootStyle("--blockflow-handles-border-radius"));
	const [blockflowLabelFontColor, setBlockflowLabelFontColor] = useState(
		getRootStyle("--blockflow-label-font-color")
	);
	const [blockflowLabelFontFamily, setBlockflowLabelFontFamily] = useState(
		getRootStyle("--blockflow-label-font-family")
	);
	const [blockflowLabelBackgroundColor, setBlockflowLabelBackgroundColor] =
		useState(getRootStyle("--blockflow-label-background-color"));
	//-------Blockflow---Edge
	const [blockflowEdgeFontColor, setBlockflowEdgeFontColor] = useState(
		getRootStyle("--blockflow-edge-font-color")
	);
	const [blockflowEdgeBackgroundColor, setBlockflowEdgeBackgroundColor] =
		useState(getRootStyle("--blockflow-edge-background-color"));
	const [blockflowEdgeBorderRadius, setBlockflowEdgeBorderRadius] = useState(
		getRootStyle("--blockflow-edge-border-radius")
	);
	const [blockflowEdgeBorderWidth, setBlockflowEdgeBorderWidth] = useState(
		getRootStyle("--blockflow-edge-border-width")
	);
	const [blockflowEdgeBorderColor, setBlockflowEdgeBorderColor] = useState(
		getRootStyle("--blockflow-edge-border-color")
	);
	//-------Blockflow---Controls
	const [blockflowControlsBorder, setBlockflowControlsBorder] = useState(
		getRootStyle("--blockflow-controls-border")
	);
	const [
		blockflowControlsButtonBackgroundColor,
		setBlockflowControlsButtonBackgroundColor,
	] = useState(getRootStyle("--blockflow-controls-button-background-color"));
	const [
		blockflowControlsButtonFontColor,
		setBlockflowControlsButtonFontColor,
	] = useState(getRootStyle("--blockflow-controls-button-font-color"));
	const [blockflowControlsButtonBorder, setBlockflowControlsButtonBorder] =
		useState(getRootStyle("--blockflow-controls-button-border"));
	const [
		blockflowControlsButtonSvgFilter,
		setBlockflowControlsButtonSvgFilter,
	] = useState(getRootStyle("--blockflow-controls-button-svg-filter"));
	//-------Blockflow---Minimap
	const [blockflowMinimapBorder, setBlockflowMinimapBorder] = useState(
		getRootStyle("--blockflow-minimap-border")
	);
	const [blockflowMinimapBackgroundColor, setBlockflowMinimapBackgroundColor] =
		useState(getRootStyle("--blockflow-minimap-background-color"));
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

			<InlineColorSelector
				label={
					<span>
						Color de la fuente por defecto{" "}
						<b>(Valores claros pueden presentar problemas)</b>
					</span>
				}
				color={mainFontColor}
				setColor={setMainFontColor}
			></InlineColorSelector>
			<div>
				<Form.Label htmlFor="mainFontFamily">
					Familia de las fuentes principales
				</Form.Label>
				<Form.Control
					id="mainFontFamily"
					onChange={setMainFontFamily}
					defaultValue={mainFontFamily}
				></Form.Control>
			</div>
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
			<div>
				<Form.Label htmlFor="mainBorderRadius">
					Redondeo de los bordes
				</Form.Label>
				<Form.Control
					id="mainFontFamily"
					onChange={setMainBorderRadius}
					defaultValue={mainBorderRadius}
				></Form.Control>
			</div>

			<div style={{ padding: "2em 0em" }}>
				<p>Selección de fragmentos de la interfaz:</p>
				<UISelection
					currentSelection={uiSelected}
					setSelection={setUISelected}
				></UISelection>
			</div>

			{uiSelected == 0 && (
				<>
					<h5>Panel lateral</h5>

					<InlineColorSelector
						label={"Color de la fuente"}
						color={asideFontColor}
						setColor={setAsideFontColor}
					></InlineColorSelector>
					<div>
						<Form.Label htmlFor="asideFontFamily">
							Familia de las fuentes
						</Form.Label>
						<Form.Control
							id="mainFontFamily"
							onChange={setAsideFontFamily}
							defaultValue={asideFontFamily}
						></Form.Control>
					</div>
					<InlineColorSelector
						label={"Color de fondo"}
						color={asideBackgroundColor}
						setColor={setAsideBackgroundColor}
					></InlineColorSelector>
					<InlineColorSelector
						label={"Color del icono de colapso"}
						color={asideCollapseIconColor}
						setColor={setAsideCollapseIconColor}
					></InlineColorSelector>
					<InlineColorSelector
						label={"Color de fondo del icono de colapso"}
						color={asideCollapseIconBackgroundColor}
						setColor={setAsideCollapseIconBackgroundColor}
					></InlineColorSelector>
					<InlineColorSelector
						label={"Color de fondo del logo"}
						color={asideLogoBackgroundColor}
						setColor={setAsideLogoBackgroundColor}
					></InlineColorSelector>
				</>
			)}

			{uiSelected == 1 && (
				<>
					<h5>Encabezado</h5>

					<InlineColorSelector
						label={"Color de la fuente"}
						color={headerFontColor}
						setColor={setHeaderFontColor}
					></InlineColorSelector>
					<div>
						<Form.Label htmlFor="headerFontFamily">
							Familia de las fuentes
						</Form.Label>
						<Form.Control
							id="headerFontFamily"
							onChange={setHeaderFontFamily}
							defaultValue={headerFontFamily}
						></Form.Control>
					</div>
					<InlineColorSelector
						label={"Color de fondo"}
						color={headerBackgroundColor}
						setColor={setHeaderBackgroundColor}
					></InlineColorSelector>
					<h6>Imagen de usuario</h6>
					<div>
						<Form.Label htmlFor="headerUserImageBorderRadius">
							Redondeado del borde de la imagen de usuario
						</Form.Label>
						<Form.Control
							id="headerUserImageBorderRadius"
							onChange={setHeaderUserImageBorderRadius}
							defaultValue={headerUserImageBorderRadius}
						></Form.Control>
					</div>
					<div>
						<Form.Label htmlFor="headerUserImageBorderWidth">
							Tamaño del borde de la imagen de usuario
						</Form.Label>
						<Form.Control
							id="headerUserImageBorderWidth"
							onChange={setHeaderUserImageBorderWidth}
							defaultValue={headerUserImageBorderWidth}
						></Form.Control>
					</div>
					<InlineColorSelector
						label={"Color del borde de la imagen de usuario"}
						color={headerUserImageBorderColor}
						setColor={setHeaderUserImageBorderColor}
					></InlineColorSelector>
					<h6>Botones de acción</h6>
					<InlineColorSelector
						label={"Color de fondo de los botones de acción"}
						color={headerActionButtonsBackgroundColor}
						setColor={setHeaderActionButtonsBackgroundColor}
					></InlineColorSelector>
					<div>
						<Form.Label htmlFor="headerActionButtonsBorderRadius">
							Redondeado del borde de los botones de acción
						</Form.Label>
						<Form.Control
							id="headerActionButtonsBorderRadius"
							onChange={setHeaderActionButtonsBorderRadius}
							defaultValue={headerActionButtonsBorderRadius}
						></Form.Control>
					</div>
					<div>
						<Form.Label htmlFor="headerActionButtonsSvgFilter">
							Filtro SVG de los botones de acción
						</Form.Label>
						<Form.Control
							id="headerActionButtonsSvgFilter"
							onChange={setHeaderActionButtonsSvgFilter}
							defaultValue={headerActionButtonsSvgFilter}
						></Form.Control>
					</div>
					<h6>Selector de versiones</h6>
					<InlineColorSelector
						label={"Color de la fuente del selector de versiones"}
						color={headerVersionDropdownContainerFontColor}
						setColor={setVersionDropdownContainerHeaderFontColor}
					></InlineColorSelector>
					<div>
						<Form.Label htmlFor="headerVersionDropdownContainerFontFamily">
							Familia de las fuentes del selector de versiones
						</Form.Label>
						<Form.Control
							id="headerVersionDropdownContainerFontFamily"
							onChange={setVersionDropdownContainerHeaderFontFamily}
							defaultValue={headerVersionDropdownContainerFontFamily}
						></Form.Control>
					</div>
					<InlineColorSelector
						label={"Color de fondo del contenedor del selector de versiones"}
						color={headerVersionDropdownContainerBackgroundColor}
						setColor={setHeaderVersionDropdownContainerBackgroundColor}
					></InlineColorSelector>
					<InlineColorSelector
						label={
							"Color de la sombra del contenedor del selector de versiones"
						}
						color={headerVersionDropdownContainerBoxShadowColor}
						setColor={setHeaderVersionDropdownContainerBoxShadowColor}
					></InlineColorSelector>
				</>
			)}

			{uiSelected == 2 && (
				<>
					<h5>Flujo de bloques</h5>

					<InlineColorSelector
						label={"Color de la fuente"}
						color={blockflowFontColor}
						setColor={setBlockflowFontColor}
					></InlineColorSelector>
					<div>
						<Form.Label htmlFor="blockflowFontFamily">
							Familia de las fuentes
						</Form.Label>
						<Form.Control
							id="blockflowFontFamily"
							onChange={setBlockflowFontFamily}
							defaultValue={blockflowFontFamily}
						></Form.Control>
					</div>
					<InlineColorSelector
						label={`Color de fondo (utilizar "none" para hacerlo transparente)`}
						color={blockflowBackgroundColor}
						setColor={setBlockflowBackgroundColor}
					></InlineColorSelector>
					<InlineColorSelector
						label={`Color de la sombra interna (utilizar "none" para hacerlo transparente)`}
						color={blockflowInnerBoxShadowColor}
						setColor={setBlockflowInnerBoxShadowColor}
					></InlineColorSelector>
					<h6>Etiquetas</h6>
					<InlineColorSelector
						label={`Color de la fuente de las etiquetas`}
						color={blockflowLabelFontColor}
						setColor={setBlockflowLabelFontColor}
					></InlineColorSelector>
					<div>
						<Form.Label htmlFor="blockflowLabelFontFamily">
							Familia de las fuentes de las etiquetas
						</Form.Label>
						<Form.Control
							id="blockflowLabelFontFamily"
							onChange={setBlockflowLabelFontFamily}
							defaultValue={blockflowLabelFontFamily}
						></Form.Control>
					</div>
					<InlineColorSelector
						label={`Color de fondo del texto de las etiquetas (utilizar "none" para hacerlo transparente)`}
						color={blockflowLabelBackgroundColor}
						setColor={setBlockflowLabelBackgroundColor}
					></InlineColorSelector>
					<h6>Lineas</h6>
					<InlineColorSelector
						label={"Color de la fuente de las etiquetas de las líneas"}
						color={blockflowEdgeFontColor}
						setColor={setBlockflowEdgeFontColor}
					></InlineColorSelector>
					<InlineColorSelector
						label={"Color de fondo de las etiquetas de las líneas"}
						color={blockflowEdgeBackgroundColor}
						setColor={setBlockflowEdgeBackgroundColor}
					></InlineColorSelector>
					<div>
						<Form.Label htmlFor="blockflowEdgeBorderRadius">
							Redondeado de las etiquetas de las líneas
						</Form.Label>
						<Form.Control
							id="blockflowEdgeBorderRadius"
							onChange={setBlockflowEdgeBorderRadius}
							defaultValue={blockflowEdgeBorderRadius}
						></Form.Control>
					</div>
					<div>
						<Form.Label htmlFor="blockflowEdgeBorderWidth">
							Tamaño del borde de las etiquetas de las líneas
						</Form.Label>
						<Form.Control
							id="blockflowEdgeBorderWidth"
							onChange={setBlockflowEdgeBorderWidth}
							defaultValue={blockflowEdgeBorderWidth}
						></Form.Control>
					</div>
					<InlineColorSelector
						label={"Color de la fuente de las etiquetas de las líneas"}
						color={blockflowEdgeBorderColor}
						setColor={setBlockflowEdgeBorderColor}
					></InlineColorSelector>
				</>
			)}
			{uiSelected == 3 && (
				<>
					<div>
						<Form.Label htmlFor="blockflowControlsBorder">
							Borde de los controles
						</Form.Label>
						<Form.Control
							id="blockflowControlsBorder"
							onChange={setBlockflowControlsBorder}
							defaultValue={blockflowControlsBorder}
						></Form.Control>
					</div>
					<InlineColorSelector
						label={"Color de la fuente del botón"}
						color={blockflowControlsButtonFontColor}
						setColor={setBlockflowControlsButtonFontColor}
					></InlineColorSelector>
					<InlineColorSelector
						label={"Color de fondo del botón"}
						color={blockflowControlsButtonBackgroundColor}
						setColor={setBlockflowControlsButtonBackgroundColor}
					></InlineColorSelector>
					<div>
						<Form.Label htmlFor="blockflowControlsButtonBorder">
							Borde de los botones
						</Form.Label>
						<Form.Control
							id="blockflowControlsButtonBorder"
							onChange={setBlockflowControlsButtonBorder}
							defaultValue={blockflowControlsButtonBorder}
						></Form.Control>
					</div>
					<div>
						<Form.Label htmlFor="blockflowControlsButtonSvgFilter">
							Filtro SVG de los botones
						</Form.Label>
						<Form.Control
							id="blockflowControlsButtonSvgFilter"
							onChange={setBlockflowControlsButtonSvgFilter}
							defaultValue={blockflowControlsButtonSvgFilter}
						></Form.Control>
					</div>
				</>
			)}
			{uiSelected == 4 && (
				<>
					<div>
						<Form.Label htmlFor="blockflowMinimapBorder">
							Borde del minimapa
						</Form.Label>
						<Form.Control
							id="blockflowMinimapBorder"
							onChange={setBlockflowMinimapBorder}
							defaultValue={blockflowMinimapBorder}
						></Form.Control>
					</div>
					<InlineColorSelector
						label={"Color de fondo del minimapa"}
						color={blockflowMinimapBackgroundColor}
						setColor={setBlockflowMinimapBackgroundColor}
					></InlineColorSelector>
				</>
			)}

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
							main: {
								fontColor: mainFontColor,
								fontFamily: mainFontFamily,
								borderRadius: mainBorderRadius,
								backgroundColor: mainDefaultBackground,
								secondaryBackgroundColor: mainSecondaryBackground,
								tertiaryBackgroundColor: mainThirdBackground,
							},
							header: {
								fontColor: headerFontColor,
								fontFamily: headerFontFamily,
								backgroundColor: headerBackgroundColor,
								userImageBorderRadius: headerUserImageBorderRadius,
								userImageBorderWidth: headerUserImageBorderWidth,
								userImageBorderColor: headerUserImageBorderColor,
								actionButtons: {
									borderRadius: headerActionButtonsBorderRadius,
									backgroundColor: headerActionButtonsBackgroundColor,
									svgFilter: headerActionButtonsSvgFilter,
								},
								versionDropdown: {
									fontColor: headerVersionDropdownContainerFontColor,
									fontFamily: headerVersionDropdownContainerFontFamily,
									backgroundColor:
										headerVersionDropdownContainerBackgroundColor,
									boxShadowColor: headerVersionDropdownContainerBoxShadowColor,
								},
							},
							aside: {
								fontColor: asideFontColor,
								fontFamily: asideFontFamily,
								backgroundColor: asideBackgroundColor,
								collapse: {
									fontColor: asideCollapseIconColor,
									backgroundColor: asideCollapseIconBackgroundColor,
								},
								logo: {
									backgroundColor: asideLogoBackgroundColor,
								},
							},
							blockflow: {
								fontColor: blockflowFontColor,
								fontFamily: blockflowFontFamily,
								backgroundColor: blockflowBackgroundColor,
								innerBoxShadowColor: blockflowInnerBoxShadowColor,
								label: {
									fontColor: blockflowLabelFontColor,
									fontFamily: blockflowLabelFontFamily,
									backgroundColor: blockflowLabelBackgroundColor,
								},
								node: {
									borderRadius: blockflowNodeBorderRadius,
									borderWidth: blockflowNodeBorderWidth,
									borderColor: blockflowNodeBorderColor,
									handlesBorderRadius: blockflowHandlesBorderRadius,
								},
								edge: {
									fontColor: blockflowEdgeFontColor,
									backgroundColor: blockflowEdgeBackgroundColor,
									borderRadius: blockflowEdgeBorderRadius,
									borderWidth: blockflowEdgeBorderWidth,
									borderColor: blockflowEdgeBorderColor,
								},
								controls: {
									border: blockflowControlsBorder,
									button: {
										fontColor: blockflowControlsButtonFontColor,
										backgroundColor: blockflowControlsButtonBackgroundColor,
										border: blockflowControlsButtonBorder,
										svgFilter: blockflowControlsButtonSvgFilter,
									},
								},
								minimap: {
									border: blockflowMinimapBorder,
									backgroundColor: blockflowMinimapBackgroundColor,
								},
							},
						},
					});
				}}
			>
				Modificar
			</Button>
		</>
	);
}
