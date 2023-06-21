import { useId, useRef } from "react";
import { Button, Form } from "react-bootstrap";

export default function APIPane({ modifySettings, LTISettings }) {
	const backURLDOM = useRef(null);
	const backURLId = useId();
	return (
		<>
			<h2>Funcionalidad</h2>
			<Form>
				<Form.Label htmlFor={backURLId}>Dirección del Back End</Form.Label>
				<Form.Control
					type="url"
					ref={backURLDOM}
					id={backURLId}
					defaultValue={LTISettings.back_url}
				></Form.Control>
				<Button
					onClick={() => modifySettings({ back_url: backURLDOM.current.value })}
				>
					Modificar
				</Button>
			</Form>
		</>
	);
}
