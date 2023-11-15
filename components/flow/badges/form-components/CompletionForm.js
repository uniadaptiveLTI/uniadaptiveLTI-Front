import React, { useId } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { useReactFlow } from "reactflow";

const CompletionForm = ({
	conditionOperator,
	lmsResourceList,
	handleDateChange,
	handleSecondCheckboxChange,
}) => {
	const CONDITION_ID = useId();

	const reactFlowInstance = useReactFlow();

	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="p-4"
		>
			<div>
				<b className="mt-4">Bloques:</b>
			</div>
			<div className="me-0">
				{lmsResourceList.map((option, index) => {
					const NODES = reactFlowInstance.getNodes();

					const NODE = NODES.find((node) => node.id === option.id);
					return (
						<div key={index}>
							<div>{NODE.data.label}</div>
							<Row style={{ marginBottom: "0.125rem" }}>
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
