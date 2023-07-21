import React, { useRef, useState, useEffect } from "react";
import { Form, Col, Row } from "react-bootstrap";

const CourseCompletionForm = ({
	conditionEdit,
	conditionOperator,
	objectiveEnabler,
	conditionObjective,
	handleCheckboxChange,
	isDateEnabled,
}) => {
	return (
		<Form.Group>
			<Form.Control
				ref={conditionOperator}
				type="number"
				min="0"
				max="10"
				defaultValue={
					conditionEdit
						? conditionEdit.type === "courseCompletion"
							? conditionEdit.op !== undefined
								? conditionEdit.op
								: 5
							: 5
						: 5
				}
			/>
			<Row>
				<Col>
					<Form.Check
						ref={objectiveEnabler}
						onChange={handleCheckboxChange}
						defaultChecked={
							conditionEdit && conditionEdit.type === "date"
								? false
									? false
									: true
								: true
						}
					/>
				</Col>
				<Col xs={6}>
					<Form.Control
						ref={conditionObjective}
						type="date"
						defaultValue={
							conditionEdit && conditionEdit.type === "date"
								? conditionEdit.date
									? conditionEdit.date
									: new Date().toISOString().substr(0, 10)
								: new Date().toISOString().substr(0, 10)
						}
						disabled={!isDateEnabled}
					/>
				</Col>
			</Row>
		</Form.Group>
	);
};

export default CourseCompletionForm;
