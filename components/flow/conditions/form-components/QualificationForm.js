import { useId } from "react";
import { Form } from "react-bootstrap";

export default function QualificationForm() {
	const qcid = useId();
	const qsid = useId();
	const mtid = useId();
	const qmid = useId();
	return (
		<Form>
			<div className="d-flex align-items-center">
				<Form.Label htmlFor={qcid}>Categoría de calificaciones</Form.Label>
				<Form.Select id={qcid}></Form.Select>
			</div>
			<div className="d-flex align-items-center">
				<Form.Label htmlFor={qsid}>Calificación para aprobar</Form.Label>
				<Form.Control id={qsid}></Form.Control>
			</div>
			<div className="d-flex align-items-center">
				<Form.Label htmlFor={mtid}>Intentos permitidos</Form.Label>
				<Form.Control id={mtid}></Form.Control>
			</div>
			<div className="d-flex align-items-center">
				<Form.Label htmlFor={qmid}>Método de calificación</Form.Label>
				<Form.Control id={qmid}></Form.Control>
			</div>
		</Form>
	);
}
