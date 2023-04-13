import { SettingsContext } from "@components/pages/_app";
import { forwardRef, useContext, useEffect } from "react";
import { Form, Dropdown } from "react-bootstrap";

function UserSettings({}, ref) {
	const { settings, setSettings } = useContext(SettingsContext);

	const parsedSettings = JSON.parse(settings);
	let { compact, reducedAnimations, autoExpandMSGBox, autoHideMSGBox } =
		parsedSettings;

	/**
	 * Handles a change in the settings.
	 * @param {Event} e - The change event.
	 */
	function handleSettingChange(e) {
		switch (e.target.id) {
			case "switch-compact":
				compact = !compact;
				break;
			case "switch-animation":
				reducedAnimations = !reducedAnimations;
				break;
			case "switch-autoExpandMSGBox":
				autoExpandMSGBox = !autoExpandMSGBox;
				break;
			case "switch-autoHideMSGBox":
				autoHideMSGBox = !autoHideMSGBox;
				break;
		}
		let newSettings = parsedSettings;
		newSettings.compact = compact;
		newSettings.reducedAnimations = reducedAnimations;
		newSettings.autoExpandMSGBox = autoExpandMSGBox;
		newSettings.autoHideMSGBox = autoHideMSGBox;
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
					id="switch-compact"
					label="Condensar diagrama de bloques"
					defaultChecked={compact}
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
