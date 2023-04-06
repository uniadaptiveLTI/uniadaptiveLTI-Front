import { SettingsContext } from "@components/pages/_app";
import { forwardRef, useContext, useEffect } from "react";
import { Form, Dropdown } from "react-bootstrap";

function UserSettings({}, ref) {
	const { settings, setSettings } = useContext(SettingsContext);

	console.log(settings);

	const parsedSettings = JSON.parse(settings);
	let { compact, animations } = parsedSettings;

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
				animations = !animations;
				break;
		}
		let newSettings = parsedSettings;
		newSettings.compact = compact;
		newSettings.animations = animations;
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
					label="Condensar interfaz"
					defaultChecked={compact}
					onClick={handleSettingChange}
				/>
				<Form.Check
					type="switch"
					id="switch-animation"
					label="Animaciones"
					defaultChecked={animations}
					onClick={handleSettingChange}
				/>
			</Form>
		</>
	);
}
const UserSettingsWithRef = forwardRef(UserSettings);
UserSettingsWithRef.displayName = "UserSettings";
export default UserSettingsWithRef;
