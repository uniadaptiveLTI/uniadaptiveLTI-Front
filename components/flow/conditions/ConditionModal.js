import React, { useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function ConditionModal({
	blockData,
	setCMBlockData,
	blocksData,
	showConditionsModal,
	setShowConditionsModal,
	setBlockJson,
}) {
	const handleClose = () => {
		setShowConditionsModal(false);
	};

	const [selectedOption, setSelectedOption] = useState(null);

	const handleSelectChange = (event) => {
		setSelectedOption(event.target.value);
	};

	const conditionOperator = useRef(null);
	const conditionQuery = useRef(null);
	const conditionObjective = useRef(null);
	const conditionObjective2 = useRef(null);

	const saveNewCondition = () => {
		console.log(blockData);
		const formData = { type: selectedOption };
		formData.op = conditionOperator.current.value;
		switch (selectedOption) {
			case "date":
				formData.query = conditionQuery.current.value;
				break;
			case "qualification":
				if (isObjectiveEnabled) {
					formData.objective = conditionObjective.current.value;
				}
				if (isObjective2Enabled) {
					if (isObjectiveEnabled) {
						formData.objective2 = conditionObjective2.current.value;
					} else {
						formData.objective = conditionObjective2.current.value;
					}
				}
				break;
			case "completion":
				formData.query = conditionQuery.current.value;
				break;
			case "userProfile":
				formData.query = conditionQuery.current.value;
				formData.objective = conditionObjective.current.value;
				break;
			case "conditionsGroup":
				formData.operand = document.getElementById("operandInput").value;
				formData.objective = document.getElementById("objectiveInput").value;
				break;
			default:
				break;
		}

		if (!blockData.conditions) {
			blockData.conditions = [formData];
		} else {
			blockData.conditions.push(formData);
		}

		setCMBlockData(blockData);
		setBlockJson(blockData);
	};

	const [isObjectiveEnabled, setIsObjectiveEnabled] = useState(false);
	const [isObjective2Enabled, setIsObjective2Enabled] = useState(false);

	const handleObjectiveCheckboxChange = (event) => {
		setIsObjectiveEnabled(event.target.checked);
	};

	const handleObjective2CheckboxChange = (event) => {
		setIsObjective2Enabled(event.target.checked);
	};

	function getParentsNode(nodesArray, childId) {
		return nodesArray.filter(
			(node) => node.children && node.children.includes(childId)
		);
	}

	const parentsNodeArray = getParentsNode(blocksData, blockData.id);

	return (
		<Modal show={showConditionsModal} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Precondiciones</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{blockData.conditions &&
					blockData.conditions.map((condition) => {
						console.log(blockData.conditions);
						switch (condition.type) {
							case "date":
								return (
									<div className="mb-3">
										<div>Tipo: Fecha</div>
										<div>Consulta: {condition.query}</div>
										<div>Operador: {condition.op}</div>
									</div>
								);
							case "qualification":
								return (
									<div className="mb-3">
										<div>Tipo: Calificación</div>
										<div>Operador: {condition.op}</div>
										<div>Mayor o igual que: {condition.objective}</div>
										{condition.objective2 && (
											<div>Menor que: {condition.objective2}</div>
										)}
									</div>
								);
							case "completion":
								return (
									<div className="mb-3">
										<div>Tipo: Finalización</div>
										<div>Operador: {condition.op}</div>
										<div>Objetivo 1: {condition.query}</div>
									</div>
								);
							case "userProfile":
								return (
									<div className="mb-3">
										<div>Tipo: Perfil de usuario</div>
										<div>Operador: {condition.op}</div>
										<div>Consulta: {condition.query}</div>
									</div>
								);

							case "conditionsGroup":
								break;
							default:
								break;
						}
					})}

				<Form.Select onChange={handleSelectChange}>
					<option value="" disabled selected>
						Escoge un tipo de condición...
					</option>
					<option value="date">Fecha</option>
					<option value="qualification">Calificación</option>
					{parentsNodeArray.length > 0 && (
						<option value="completion">Finalización</option>
					)}
					<option value="userProfile">Perfil de usuario</option>
					<option value="conditionsGroup">Conjunto de condiciones</option>
				</Form.Select>

				{selectedOption === "date" && (
					<Form.Group>
						<Form.Select ref={conditionQuery}>
							<option value="dateFrom">Desde</option>
							<option value="dateTo">Hasta</option>
						</Form.Select>
						<Form.Control ref={conditionOperator} type="date" />
					</Form.Group>
				)}

				{selectedOption === "qualification" && (
					<Form.Group>
						<Form.Select ref={conditionOperator}>
							<option value="fullCourse">Total del curso</option>
							{parentsNodeArray.length > 0 &&
								parentsNodeArray.map((node) => (
									<option key={node.id}>{node.title}</option>
								))}
						</Form.Select>
						<Form.Check
							type="checkbox"
							label="debe ser >="
							onChange={handleObjectiveCheckboxChange}
						/>
						<Form.Control
							ref={conditionObjective}
							type="number"
							disabled={!isObjectiveEnabled}
						/>
						<Form.Check
							type="checkbox"
							label="debe ser <"
							onChange={handleObjective2CheckboxChange}
						/>
						<Form.Control
							ref={conditionObjective2}
							type="number"
							disabled={!isObjective2Enabled}
						/>
					</Form.Group>
				)}

				{selectedOption === "completion" && (
					<Form.Group>
						<Form.Select ref={conditionOperator}>
							{parentsNodeArray.length > 0 &&
								parentsNodeArray.map((node) => (
									<option key={node.id}>{node.title}</option>
								))}
						</Form.Select>
						<Form.Select ref={conditionQuery}>
							<option value="completed">debe estar completa</option>
							<option value="notCompleted">no debe estar completa</option>
							<option value="completedApproved">
								debe estar completa y aprobada
							</option>
							<option value="completedSuspended">
								debe estar completa y suspendida
							</option>
						</Form.Select>
					</Form.Group>
				)}

				{selectedOption === "userProfile" && (
					<Form.Group>
						<Form.Select ref={conditionOperator}>
							<option value="firstName">Nombre</option>
							<option value="lastName">Apellido</option>
							<option value="city">Ciudad</option>
							<option value="department">Departamento</option>
							<option value="address">Dirección</option>
							<option value="emailAddress">Dirección de correo</option>
							<option value="institution">Institución</option>
							<option value="idNumber">Número de ID</option>
							<option value="country">País</option>
							<option value="telephone">Teléfono</option>
							<option value="mobilePhone">Teléfono Movil</option>
						</Form.Select>
						<Form.Select ref={conditionQuery}>
							<option value="equals">es igual a</option>
							<option value="contains">contiene</option>
							<option value="notContains">no contiene</option>
							<option value="startsWith">comienza con</option>
							<option value="endsWith">termina en</option>
							<option value="empty">está vacío</option>
							<option value="notEmpty">no está vacío</option>
						</Form.Select>
						<Form.Control ref={conditionObjective} type="text" />
					</Form.Group>
				)}

				{selectedOption === "conditionsGroup" && (
					<Form.Group>
						<Form.Control type="text" />
						<Form.Control type="number" />
					</Form.Group>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="primary" onClick={saveNewCondition}>
					Save Changes
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default ConditionModal;
