import { useId } from "react";
import { Form } from "react-bootstrap";

const DateForm = ({
	conditionQuery,
	conditionOperator,
	conditionEdit,
	handleDateChange,
}) => {
	const CONDITION_QUERY_ID = useId();
	const CONDITION_OPERATOR_ID = useId();
	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="d-flex flex-column gap-2 p-4"
		>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Label
					htmlFor={CONDITION_QUERY_ID}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					Condición:{" "}
				</Form.Label>
				<Form.Select
					id={CONDITION_QUERY_ID}
					ref={conditionQuery}
					defaultValue={conditionEdit?.d}
				>
					<option value=">=">Desde</option>
					<option value="<">Hasta</option>
				</Form.Select>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Label
					htmlFor={CONDITION_OPERATOR_ID}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					Fecha:{" "}
				</Form.Label>
				<Form.Control
					ref={conditionOperator}
					id={CONDITION_OPERATOR_ID}
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
