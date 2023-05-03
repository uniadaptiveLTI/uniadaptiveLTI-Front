import React, { useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Condition from "./Condition";
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
			const foundCondition = findConditionById(
				conditionId,
				blockData.conditions.conditions
			);
			console.log(foundCondition);
			setEditing(foundCondition);
		} else {
			setEditing(blockData.conditions);
		}
	};

	function findConditionById(id, conditions) {
		if (!conditions) {
			return null;
		}

		const foundCondition = conditions.find((condition) => condition.id === id);
		if (foundCondition) {
			return foundCondition;
		}

		for (const condition of conditions) {
			if (condition.conditions) {
				const innerCondition = findConditionById(id, condition.conditions);
				if (innerCondition) {
					console.log();
					return innerCondition;
				}
			}
		}

		return null;
	}

	function deleteConditionById(conditions, id) {
		for (let i = 0; i < conditions.length; i++) {
			const condition = conditions[i];
			if (condition.id === id) {
				conditions.splice(i, 1);
				if (conditions.length === 0) {
					conditions = undefined;
				}
				return true;
			} else if (condition.conditions) {
				if (deleteConditionById(condition.conditions, id)) {
					if (condition.conditions.length === 0) {
						condition.conditions = undefined;
					}
					return true;
				}
			}
		}
		return false;
	}

	function updateConditionById(conditions, id, newCondition) {
		for (let i = 0; i < conditions.length; i++) {
			const condition = conditions[i];
			if (condition.id === id) {
				conditions[i] = newCondition;
				return true;
			} else if (condition.conditions) {
				if (updateConditionById(condition.conditions, id, newCondition)) {
					return true;
				}
			}
		}
		return false;
	}

	const deleteCondition = (conditionId) => {
		const blockDataCopy = deepCopy(blockData);

		deleteConditionById(blockDataCopy.conditions.conditions, conditionId);

		setBlockData(blockDataCopy);
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

		const updatedBlockData = deepCopy(blockData);
		console.log(updatedBlockData);

		console.log(updatedCondition);

		if (!updatedBlockData.conditions) {
			updatedBlockData.conditions = updatedCondition;

			setBlockData(updatedBlockData);
		} else {
			if (
				updateConditionById(
					updatedBlockData.conditions.conditions,
					updatedCondition.id,
					updatedCondition
				)
			) {
				setBlockData(updatedBlockData);
			} else {
				const updatedJsonObject = {
					...updatedBlockData,
					conditions: updatedCondition,
				};

				setBlockData(updatedJsonObject);
			}
		}

		setIsObjectiveEnabled(true);
		setIsObjective2Enabled(false);
		setSelectedOption("");
		setEditing(undefined);
	};

	function deepCopy(obj) {
		if (Array.isArray(obj)) {
			return obj.map((item) => deepCopy(item));
		} else if (typeof obj === "object" && obj !== null) {
			return Object.fromEntries(
				Object.entries(obj).map(([key, value]) => [key, deepCopy(value)])
			);
		} else {
			return obj;
		}
	}

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
						console.log(condition);
						return (
							<Condition
								condition={condition}
								deleteCondition={deleteCondition}
								addCondition={addCondition}
							></Condition>
						);
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
