import {
	useImperativeHandle,
	forwardRef,
	useRef,
	useContext,
	RefObject,
} from "react";
import { SettingsContext } from "pages/_app";
import { Form } from "react-bootstrap";

export interface UserSettingsPaneRef {
	accesibility: {
		name?: string;
		ref: RefObject<HTMLElement>;
	};
	blockFlow: {
		name?: string;
		ref: RefObject<HTMLElement>;
	};
	interface: {
		name?: string;
		ref: RefObject<HTMLElement>;
	};
}

const UserSettingsPane = forwardRef<UserSettingsPaneRef>((props, ref) => {
	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	let {
		highContrast,
		reducedAnimations,
		snapping,
		snappingInFragment,
		showDetails,
		autoHideAside,
		hoverConditions,
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
			case "switch-hoverConditions":
				hoverConditions = !hoverConditions;
				break;
		}
		let newSettings = parsedSettings;
		newSettings.highContrast = highContrast;
		newSettings.reducedAnimations = reducedAnimations;
		newSettings.snapping = snapping;
		newSettings.snappingInFragment = snappingInFragment;
		newSettings.showDetails = showDetails;
		newSettings.autoHideAside = autoHideAside;
		newSettings.hoverConditions = hoverConditions;
		let json = JSON.stringify(newSettings);
		localStorage.setItem("settings", json);
		setSettings(json);
	}

	const accesibilityRef = useRef();
	const blockFlowRef = useRef();
	const interfaceRef = useRef();
	useImperativeHandle(ref, () => ({
		get accesibility() {
			return {
				name: accesibilityRef.current
					? (accesibilityRef.current as HTMLElement).innerText
					: "",
				ref: accesibilityRef,
			};
		},
		get blockFlow() {
			return {
				name: blockFlowRef.current
					? (blockFlowRef.current as HTMLElement).innerText
					: "",
				ref: blockFlowRef,
			};
		},
		get interface() {
			return {
				name: interfaceRef.current
					? (interfaceRef.current as HTMLElement).innerText
					: "",
				ref: interfaceRef,
			};
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
				<h4 className="my-3">Mapa</h4>
				<Form.Check
					type="switch"
					id="switch-snapping"
					label="Autoajustar bloques a la cuadrícula"
					className="my-4"
					defaultChecked={snapping}
					onClick={handleSettingChange}
				/>
				<Form.Check
					type="switch"
					id="switch-snappingInFragment"
					label="Autoajustar a la cuadrícula en fragmentos"
					className="my-4"
					defaultChecked={snappingInFragment}
					onClick={handleSettingChange}
					disabled={!snapping}
				/>
				<h4 className="my-3">Bloques</h4>
				<Form.Check
					type="switch"
					id="switch-showDetails"
					label="Mostrar los detalles de forma estática"
					className="my-4"
					defaultChecked={showDetails}
					onClick={handleSettingChange}
				/>
				<Form.Check
					type="switch"
					id="switch-hoverConditions"
					label={
						hoverConditions
							? "Priorizar mostrar el resumen de las condiciones al pasar el ratón sobre el bloque seleccionado"
							: "Priorizar mostrar el resumen de los ajustes de finalización al pasar el ratón sobre el bloque seleccionado"
					}
					className="my-4"
					defaultChecked={hoverConditions}
					onClick={handleSettingChange}
				/>

				<h2 ref={interfaceRef} className="my-4">
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
			</Form>
		</>
	);
});

export default UserSettingsPane;
