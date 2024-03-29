import React from "react";
import { Form } from "react-bootstrap";

const GroupingForm = ({
	conditionOperator,
	conditionEdit,
	moodleGroupings,
}) => {
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
				<Form.Label className="me-4" style={{ minWidth: "125px" }}>
					Grupo:{" "}
				</Form.Label>
				<Form.Select
					ref={conditionOperator}
					defaultValue={conditionEdit?.groupingId}
				>
					{moodleGroupings.length > 0 &&
						moodleGroupings.map((grouping) => (
							<option value={grouping.id} key={grouping.id}>
								{grouping.name}
							</option>
						))}
				</Form.Select>
			</div>
		</Form.Group>
	);
};

export default GroupingForm;
