import React, { useRef, useState, useEffect } from "react";
import { useId } from "react";
import { Form, Col, Row } from "react-bootstrap";

const CourseCompletionForm = ({
	conditionEdit,
	conditionOperator,
	objectiveEnabler,
	conditionObjective,
	handleCheckboxChange,
	isDateEnabled,
}) => {
	const ccId = useId();
	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
		>
			<div className="d-flex flex-row gap-2 align-items-baseline col-12 col-lg-9 col-xl-7">
				<Form.Label
					htmlFor={ccId}
					className="flex-grow-1 p-4"
					style={{ width: "300px" }}
				>
					Calificación mínima:{" "}
				</Form.Label>
				<Form.Control
					id={ccId}
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
			</div>
			<div className="d-flex flex-row gap-2 align-items-baseline col-lg-6 col-xl-4 ms-4 mb-4 me-0">
				<Form.Check
					ref={objectiveEnabler}
					onChange={handleCheckboxChange}
					label="Fecha mínima: "
					style={{ width: "350px" }}
					defaultChecked={
						conditionEdit && conditionEdit.type === "date"
							? false
								? false
								: true
							: true
					}
				/>

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
			</div>
		</Form.Group>
	);
};

export default CourseCompletionForm;
