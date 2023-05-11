import { Form } from "react-bootstrap";

const DateForm = ({
	conditionQuery,
	conditionOperator,
	conditionEdit,
	handleDateChange,
}) => {
	return (
		<Form.Group>
			<Form.Select ref={conditionQuery} defaultValue={conditionEdit?.query}>
				<option value="dateFrom">Desde</option>
				<option value="dateTo">Hasta</option>
			</Form.Select>
			<Form.Control
				ref={conditionOperator}
				type="date"
				onChange={handleDateChange}
				defaultValue={
					conditionEdit && conditionEdit.type === "date"
						? conditionEdit.op
						: new Date().toISOString().substr(0, 10)
				}
			/>
		</Form.Group>
	);
};

export default DateForm;
