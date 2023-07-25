import React, { useId } from "react";
import { Form, Row, Col } from "react-bootstrap";

const CompletionForm = ({
	conditionOperator,
	lmsResourceList,
	handleDateChange,
	handleSecondCheckboxChange,
}) => {
	const cId = useId();
	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="p-4"
		>
			<b className="mt-4">Insignias:</b>
			<div className="ms-4 me-0">
				{lmsResourceList.map((option, index) => {
					return (
						<div key={index}>
							<div>{option.name}</div>
							<Row>
								<Col>
									<Form.Control
										id={option.id}
										type="date"
										disabled={!option.checkboxEnabled}
										onChange={() => handleDateChange(index)}
										defaultValue={
											option.date
												? option.date
												: new Date().toISOString().substr(0, 10)
										}
									/>
								</Col>
								<Col>
									<Form.Check
										label="Habilitar"
										checked={option.checkboxEnabled}
										onChange={() => handleSecondCheckboxChange(index)}
									/>
								</Col>
							</Row>
						</div>
					);
				})}
			</div>
		</Form.Group>
	);
};

export default CompletionForm;
