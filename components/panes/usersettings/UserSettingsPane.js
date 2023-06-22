import { useImperativeHandle, forwardRef, useRef, useContext } from "react";
import { SettingsContext } from "@root/pages/_app";
import { Form } from "react-bootstrap";

function UserSettingsPane({ LTISettings }, ref) {
	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	let {
		highContrast,
		reducedAnimations,
		snapping,
		snappingInFragment,
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
			case "switch-snappingInFragment":
				snappingInFragment = !snappingInFragment;
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
		newSettings.snappingInFragment = snappingInFragment;
		newSettings.showDetails = showDetails;
		newSettings.autoExpandMSGBox = autoExpandMSGBox;
		newSettings.autoHideMSGBox = autoHideMSGBox;
		newSettings.autoHideAside = autoHideAside;
		let json = JSON.stringify(newSettings);
		localStorage.setItem("settings", json);
		setSettings(json);
	}

	const accesibilityRef = useRef();
	const blockFlowRef = useRef();
	const InterfaceRef = useRef();
	const peneRef = useRef();
	useImperativeHandle(ref, () => ({
		get accesibility() {
			return { name: accesibilityRef.current.innerText, ref: accesibilityRef };
		},
		get blockFlow() {
			return { name: blockFlowRef.current.innerText, ref: blockFlowRef };
		},
		get Interface() {
			return { name: InterfaceRef.current.innerText, ref: InterfaceRef };
		},
	}));

	return (
		<>
			<Form className="ms-2">
				<h2 ref={accesibilityRef} className="my-4">
					Accesibilidad
				</h2>
				<Form.Check
					type="switch"
					id="switch-highContrast"
					label="Modo de alto contraste"
					className="my-4"
					defaultChecked={highContrast}
					onClick={handleSettingChange}
				/>
				<Form.Check
					type="switch"
					id="switch-animation"
					label="Animaciones reducidas"
					className="my-4"
					defaultChecked={reducedAnimations}
					onClick={handleSettingChange}
				/>
				<h2 ref={blockFlowRef} className="my-4">
					Flujo de bloques
				</h2>
				<Form.Check
					type="switch"
					id="switch-snapping"
					label="Autoajustar bloques a la cuadricula"
					className="my-4"
					defaultChecked={snapping}
					onClick={handleSettingChange}
				/>
				<Form.Check
					type="switch"
					id="switch-snappingInFragment"
					label="Autoajustar a la cuadricula en fragmentos"
					className="my-4"
					defaultChecked={snappingInFragment}
					onClick={handleSettingChange}
					disabled={!snapping}
				/>
				<Form.Check
					type="switch"
					id="switch-showDetails"
					label="Mostrar los detalles de forma estática"
					className="my-4"
					defaultChecked={showDetails}
					onClick={handleSettingChange}
				/>

				<h2 ref={InterfaceRef} className="my-4">
					Interfaz
				</h2>
				<h4 className="my-3">Inspector</h4>
				<Form.Check
					type="switch"
					id="switch-autoHideAside"
					label="Autocontraer el inspector"
					className="my-4"
					defaultChecked={autoHideAside}
					onClick={handleSettingChange}
				/>
				<h4 className="my-3">Caja de mensajes</h4>
				<Form.Check
					type="switch"
					id="switch-autoExpandMSGBox"
					label="Expandir la caja de mensajes automáticamente"
					className="my-4"
					defaultChecked={autoExpandMSGBox}
					onClick={handleSettingChange}
				/>
				<Form.Check
					type="switch"
					id="switch-autoHideMSGBox"
					label="Contraer la caja de mensajes automáticamente"
					className="my-4"
					defaultChecked={autoHideMSGBox}
					onClick={handleSettingChange}
				/>
			</Form>
		</>
	);
}

UserSettingsPane = forwardRef(UserSettingsPane);
export default UserSettingsPane;
