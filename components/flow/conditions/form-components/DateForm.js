import { useId } from "react";
import { Form } from "react-bootstrap";

const DateForm = ({
	conditionQuery,
	conditionOperator,
	conditionEdit,
	handleDateChange,
}) => {
	const cqId = useId();
	const coId = useId();
	return (
		<Form.Group className="d-flex flex-column gap-2 m-4 me-0">
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Label
					htmlFor={cqId}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					Condición:{" "}
				</Form.Label>
				<Form.Select
					id={cqId}
					ref={conditionQuery}
					defaultValue={conditionEdit?.d}
				>
					<option value=">=">Desde</option>
					<option value="<">Hasta</option>
				</Form.Select>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Label
					htmlFor={coId}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					Fecha:{" "}
				</Form.Label>
				<Form.Control
					ref={conditionOperator}
					id={coId}
					type="date"
					onChange={handleDateChange}
					defaultValue={
						conditionEdit && conditionEdit.type === "date"
							? conditionEdit.t
							: new Date().toISOString().substr(0, 10)
					}
				/>
			</div>
		</Form.Group>
	);
};

export default DateForm;
