import React from "react";
import { Form } from "react-bootstrap";

const GroupingForm = ({
	conditionOperator,
	conditionEdit,
	moodleGroupings,
}) => {
	return (
		<Form.Group>
			<Form.Select ref={conditionOperator} defaultValue={conditionEdit?.op}>
				{moodleGroupings.length > 0 &&
					moodleGroupings.map((grouping) => (
						<option key={grouping.id}>{grouping.name}</option>
					))}
			</Form.Select>
		</Form.Group>
	);
};

export default GroupingForm;
