import { SettingsContext } from "@components/pages/_app";
import { forwardRef, useContext, useEffect } from "react";
import { Form, Dropdown } from "react-bootstrap";

function UserSettings({}, ref) {
	const { settings, setSettings } = useContext(SettingsContext);

	const parsedSettings = JSON.parse(settings);
	let {
		highContrast,
		reducedAnimations,
		snapping,
		showDetails,
		autoHideAside,
		autoExpandMSGBox,
		autoHideMSGBox,
	} = parsedSettings;

	/**
	 * Handles a change in the settings.
	 * @param {Event} e - The change event.
	 */
	function handleSettingChange(e) {
		switch (e.target.id) {
			case "switch-highContrast":
				highContrast = !highContrast;
				break;
			case "switch-animation":
				reducedAnimations = !reducedAnimations;
				break;
			case "switch-snapping":
				snapping = !snapping;
				break;
			case "switch-showDetails":
				showDetails = !showDetails;
				break;
			case "switch-autoHideAside":
				autoHideAside = !autoHideAside;
				break;
			case "switch-autoExpandMSGBox":
				autoExpandMSGBox = !autoExpandMSGBox;
				break;
			case "switch-autoHideMSGBox":
				autoHideMSGBox = !autoHideMSGBox;
				break;
		}
		let newSettings = parsedSettings;
		newSettings.highContrast = highContrast;
		newSettings.reducedAnimations = reducedAnimations;
		newSettings.snapping = snapping;
		newSettings.showDetails = showDetails;
		newSettings.autoExpandMSGBox = autoExpandMSGBox;
		newSettings.autoHideMSGBox = autoHideMSGBox;
		newSettings.autoHideAside = autoHideAside;
		let json = JSON.stringify(newSettings);
		sessionStorage.setItem("settings", json);
		setSettings(json);
	}

	return (
		<>
			<Dropdown.Header>Ajustes</Dropdown.Header>
			<Form className="ms-2">
				<Form.Check
					type="switch"
					id="switch-highContrast"
					label="Modo de alto contraste"
					defaultChecked={highContrast}
					onClick={handleSettingChange}
				/>
				<Form.Check
					type="switch"
					id="switch-animation"
					label="Animaciones reducidas"
					defaultChecked={reducedAnimations}
					onClick={handleSettingChange}
				/>
				<Form.Check
					type="switch"
					id="switch-snapping"
					label="Autoajustar bloques a la cuadricula"
					defaultChecked={snapping}
					onClick={handleSettingChange}
				/>
				<Form.Check
					type="switch"
					id="switch-showDetails"
					label="Mostrar los detalles de forma estática"
					defaultChecked={showDetails}
					onClick={handleSettingChange}
				/>
				<Form.Check
					type="switch"
					id="switch-autoHideAside"
					label="Autocontraer el panel de edición"
					defaultChecked={autoHideAside}
					onClick={handleSettingChange}
				/>
				<Form.Check
					type="switch"
					id="switch-autoExpandMSGBox"
					label="Expandir la caja de mensajes automáticamente"
					defaultChecked={autoExpandMSGBox}
					onClick={handleSettingChange}
				/>
				<Form.Check
					type="switch"
					id="switch-autoHideMSGBox"
					label="Contraer la caja de mensajes automáticamente"
					defaultChecked={autoHideMSGBox}
					onClick={handleSettingChange}
				/>
			</Form>
		</>
	);
}
const UserSettingsWithRef = forwardRef(UserSettings);
UserSettingsWithRef.displayName = "UserSettings";
export default UserSettingsWithRef;
