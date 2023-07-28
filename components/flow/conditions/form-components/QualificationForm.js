import { useId } from "react";
import { Form } from "react-bootstrap";

export default function QualificationForm({ gradeConditionType }) {
	const qcid = useId();
	const qsid = useId();
	const mtid = useId();
	const qmid = useId();
	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="p-4"
		>
			<div className="d-flex align-items-center mb-2">
				<Form.Label htmlFor={qcid} style={{ width: "350px" }}>
					Categoría de calificaciones
				</Form.Label>
				<Form.Select id={qcid}></Form.Select>
			</div>
			<div className="d-flex align-items-center mb-2">
				<Form.Label htmlFor={qsid} style={{ width: "350px" }}>
					Calificación para aprobar
				</Form.Label>
				<Form.Control id={qsid}></Form.Control>
			</div>
			<div className="d-flex align-items-center mb-2">
				<Form.Label htmlFor={mtid} style={{ width: "350px" }}>
					Intentos permitidos
				</Form.Label>
				<Form.Control id={mtid}></Form.Control>
			</div>
			<div className="d-flex align-items-center mb-2">
				<Form.Label htmlFor={qmid} style={{ width: "350px" }}>
					Método de calificación
				</Form.Label>
				<Form.Control id={qmid}></Form.Control>
			</div>
		</Form.Group>
	);
}
