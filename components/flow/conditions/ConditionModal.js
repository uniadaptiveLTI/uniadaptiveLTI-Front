import React, { useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import {
	faSquarePlus,
	faDiagramNext,
	faScissors,
	faClipboard,
	faPaste,
	faTrashCan,
	faDiagramProject,
	faEdit,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ConditionModal({
	blockData,
	setBlockData,
	blocksData,
	showConditionsModal,
	setShowConditionsModal,
	setBlockJson,
}) {
	console.log(blockData);
	const handleClose = () => {
		setShowConditionsModal(false);
	};

	const [editing, setEditing] = useState(undefined);

	const [isObjectiveEnabled, setIsObjectiveEnabled] = useState(false);
	const [isObjective2Enabled, setIsObjective2Enabled] = useState(false);

	const [selectedOption, setSelectedOption] = useState(null);

	const handleSelectChange = (event) => {
		setSelectedOption(event.target.value);
	};

	const conditionOperator = useRef(null);
	const conditionQuery = useRef(null);
	const conditionObjective = useRef(null);
	const conditionObjective2 = useRef(null);

	const addCondition = (conditionId) => {
		if (blockData.conditions.id != conditionId) {
			const foundCondition = blockData.conditions.conditions.find(
				(condition) => condition.id === conditionId
			);

			setEditing(foundCondition);
		} else {
			setEditing(blockData.conditions);
		}
	};

	const deleteCondition = (conditionId) => {
		const updatedConditions = blockData.conditions.filter(
			(condition) => condition.id !== conditionId
		);

		const updatedBlockData = { ...blockData, conditions: updatedConditions };

		if (updatedConditions.length === 0) {
			updatedBlockData.conditions = undefined;
		}

		setBlockData(updatedBlockData);
	};

	const cancelEditCondition = () => {
		setIsObjectiveEnabled(true);
		setIsObjective2Enabled(false);
		setSelectedOption("");
		setEditing(undefined);
	};

	const saveNewCondition = () => {
		const formData = { type: selectedOption };

		const uniqueId = parseInt(Date.now() * Math.random()).toString();

		formData.id = uniqueId;

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
				break;
			default:
				break;
		}

		console.log(blockData);
		console.log(formData);
		console.log(editing);

		const updatedCondition = {
			...editing,
			conditions: editing.conditions
				? [...editing.conditions, formData]
				: [formData],
		};

		console.log(updatedCondition);

		if (!blockData.conditions) {
			updateBlockData(updatedCondition);
		} else {
			if (updatedCondition.id == blockData.conditions.id) {
				updateBlockData(updatedCondition);
			} else {
				const existingConditions = blockData.conditions;

				const updatedConditionIndex = existingConditions.conditions.findIndex(
					(condition) => condition.id === updatedCondition.id
				);

				const newConditions = {
					...existingConditions,
					conditions: existingConditions.conditions.map((condition, index) =>
						index === updatedConditionIndex ? updatedCondition : condition
					),
				};

				console.log(newConditions);

				const updatedJsonObject = {
					...blockData,
					conditions: newConditions,
				};

				console.log(updatedJsonObject);

				setIsObjectiveEnabled(true);
				setIsObjective2Enabled(false);
				setSelectedOption("");
				setEditing(undefined);
				setBlockData(updatedJsonObject);
			}
		}
	};

	const updateBlockData = (updatedCondition) => {
		const updatedJsonObject = { ...blockData, conditions: updatedCondition };
		console.log(updatedJsonObject);

		setIsObjectiveEnabled(true);
		setIsObjective2Enabled(false);
		setSelectedOption("");
		setEditing(undefined);
		setBlockData(updatedJsonObject);
	};

	const addConditionToMain = () => {
		if (blockData.conditions) {
			addCondition(blockData.conditions.id);
		} else {
			const firstConditionGroup = {
				type: "conditionsGroup",
				id: parseInt(Date.now() * Math.random()).toString(),
				op: "&",
			};

			setEditing(firstConditionGroup);
		}
	};

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
				{!editing && (
					<Button className="mb-3" variant="light" onClick={addConditionToMain}>
						<div role="button">
							<FontAwesomeIcon icon={faPlus} />
							Crear condición
						</div>
					</Button>
				)}
				{blockData.conditions &&
					!editing &&
					blockData.conditions.conditions.map((condition) => {
						switch (condition.type) {
							case "date":
								return (
									<div id={condition.id} className="mb-3">
										<div>Tipo: Fecha</div>
										<div>Consulta: {condition.query}</div>
										<div>Operador: {condition.op}</div>
										<Button
											variant="light"
											onClick={() => deleteCondition(condition.id)}
										>
											<div>
												<FontAwesomeIcon icon={faTrashCan} />
												Eliminar bloque...
											</div>
										</Button>
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
										<Button
											variant="light"
											onClick={() => deleteCondition(condition.id)}
										>
											<div>
												<FontAwesomeIcon onclick icon={faTrashCan} />
												Eliminar bloque...
											</div>
										</Button>
									</div>
								);
							case "completion":
								return (
									<div className="mb-3">
										<div>Tipo: Finalización</div>
										<div>Operador: {condition.op}</div>
										<div>Objetivo 1: {condition.query}</div>
										<Button
											variant="light"
											onClick={() => deleteCondition(condition.id)}
										>
											<div>
												<FontAwesomeIcon icon={faTrashCan} />
												Eliminar bloque...
											</div>
										</Button>
									</div>
								);
							case "userProfile":
								return (
									<div className="mb-3">
										<div>Tipo: Perfil de usuario</div>
										<div>Operador: {condition.op}</div>
										<div>Consulta: {condition.query}</div>
										<Button
											variant="light"
											onClick={() => deleteCondition(condition.id)}
										>
											<div>
												<FontAwesomeIcon icon={faTrashCan} />
												Eliminar condición...
											</div>
										</Button>
									</div>
								);

							case "conditionsGroup":
								return (
									<div className="mb-3">
										<div>Tipo: Conjunto de condiciones</div>
										<div>Operador: {condition.op}</div>
										<Button
											className="mb-3"
											variant="light"
											onClick={() => addCondition(condition.id)}
										>
											<div role="button">
												<FontAwesomeIcon icon={faPlus} />
												Crear condición
											</div>
										</Button>
									</div>
								);
							default:
								break;
						}
					})}

				{editing && (
					<Form.Select onChange={handleSelectChange} defaultValue="" required>
						<option value="" disabled>
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
				)}

				{editing && selectedOption === "date" && (
					<Form.Group>
						<Form.Select ref={conditionQuery}>
							<option value="dateFrom">Desde</option>
							<option value="dateTo">Hasta</option>
						</Form.Select>
						<Form.Control
							ref={conditionOperator}
							type="date"
							defaultValue={new Date().toISOString().substr(0, 10)}
						/>
					</Form.Group>
				)}

				{editing && selectedOption === "qualification" && (
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
							defaultChecked
						/>
						<Form.Control
							ref={conditionObjective}
							type="number"
							min="0"
							max="10"
							defaultValue={5}
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
							min="0"
							max="10"
							disabled={!isObjective2Enabled}
						/>
					</Form.Group>
				)}

				{editing && selectedOption === "completion" && (
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

				{editing && selectedOption === "userProfile" && (
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

				{editing && selectedOption === "conditionsGroup" && (
					<Form.Group>
						<Form.Select ref={conditionOperator}>
							<option value="&">Se deben cumplir todas</option>
							<option value="|">Solo debe cumplirse una</option>
						</Form.Select>
					</Form.Group>
				)}
			</Modal.Body>
			<Modal.Footer>
				{editing && (
					<div>
						<Button variant="primary" onClick={cancelEditCondition}>
							Cancelar edición
						</Button>
						<Button
							variant="primary"
							onClick={saveNewCondition}
							disabled={selectedOption === "" || !selectedOption}
						>
							Guardar condición
						</Button>
					</div>
				)}
			</Modal.Footer>
		</Modal>
	);
}

export default ConditionModal;
