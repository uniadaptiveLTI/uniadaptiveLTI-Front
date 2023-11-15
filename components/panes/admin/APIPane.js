import styles from "/styles/AdminPane.module.css";
import { useId, useRef } from "react";
import { Button, Form } from "react-bootstrap";

export default function APIPane({ modifySettings, LTISettings }) {
	const backURLDOM = useRef(null);
	const visibleAdminButtonDOM = useRef(null);
	const devModeDOM = useRef(null);
	const devFilesDOM = useRef(null);

	const BACK_URL_ID = useId();
	const VISIBLE_ADMIN_BUTTON_ID = useId();
	const DEV_MODE_ID = useId();
	const DEV_FILES_ID = useId();
	return (
		<>
			<h2 className="my-4">Funcionalidad</h2>
			<Form>
				<Form.Label htmlFor={BACK_URL_ID}>Dirección del Back End</Form.Label>
				<Form.Control
					type="url"
					ref={backURLDOM}
					id={BACK_URL_ID}
					defaultValue={LTISettings.back_url}
				></Form.Control>
				<Form.Check
					type="switch"
					ref={visibleAdminButtonDOM}
					id={VISIBLE_ADMIN_BUTTON_ID}
					defaultChecked={LTISettings.visibleAdminButton}
					label={
						"Mostrar un botón de acceso al panel de administración desde los ajustes de usuario (Si es deshabilitado, solo se podrá acceder por URL)"
					}
				></Form.Check>
				<h4 className="my-4">Opciones de desarrollo</h4>
				<p>
					Estas opciones afectan a todo el servidor y no están diseñadas para
					entornos de desarrollo.
				</p>
				<Form.Check
					type="switch"
					ref={devModeDOM}
					id={DEV_MODE_ID}
					defaultChecked={LTISettings.debugging.dev_mode}
					label={"Mostrar información extra de depuración. (DEV_MODE)"}
				></Form.Check>
				<Form.Check
					type="switch"
					ref={devFilesDOM}
					id={DEV_FILES_ID}
					defaultChecked={LTISettings.debugging.dev_files}
					label={
						"Utilizar archivos de desarrollo. (Permite desarrollar el Front End sin tener una conexión con el Back End) (DEV_FILES)"
					}
				></Form.Check>
				<details className={styles.detailBox + " my-2"}>
					<summary>JSON de configuración</summary>
					{JSON.stringify(LTISettings, null, "\t")}
				</details>

				<Button
					className="mt-2"
					onClick={() => {
						modifySettings({
							back_url: backURLDOM.current.value,
							visibleAdminButton: visibleAdminButtonDOM.current.checked,
							debugging: {
								dev_mode: devModeDOM.current.checked,
								dev_files: devFilesDOM.current.checked,
							},
						});
					}}
				>
					Modificar
				</Button>
			</Form>
		</>
	);
}
