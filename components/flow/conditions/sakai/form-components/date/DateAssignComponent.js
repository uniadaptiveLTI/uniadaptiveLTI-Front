import React, { useId } from "react";
import { Form } from "react-bootstrap";

const DateAssignComponent = () => {
	const cqId = useId();
	const coId = useId();

	return (
		<>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Check id="objectiveCheckbox" type="checkbox" />
				<Form.Label
					htmlFor={cqId}
					className="me-4"
					style={{ minWidth: "125px", marginLeft: "20px" }}
				>
					Fecha de apertura:{" "}
				</Form.Label>
				<Form.Control id={coId} type="date" />
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Check id="objectiveCheckbox" type="checkbox" />
				<Form.Label
					htmlFor={coId}
					className="me-4"
					style={{ minWidth: "125px", marginLeft: "20px" }}
				>
					Fecha de entrega:{" "}
				</Form.Label>
				<Form.Control id={coId} type="date" />
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Check id="objectiveCheckbox" type="checkbox" />
				<Form.Label
					htmlFor={coId}
					className="me-4"
					style={{ minWidth: "125px", marginLeft: "20px" }}
				>
					Fecha límite:{" "}
				</Form.Label>
				<Form.Control id={coId} type="date" />
			</div>
		</>
	);
};

export default DateAssignComponent;
