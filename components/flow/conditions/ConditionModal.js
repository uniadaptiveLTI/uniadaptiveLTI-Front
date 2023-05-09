import React, { useEffect, useRef, useState } from "react";
import styles from "@components/styles/ConditionModal.module.css";
import { Modal, Button, Form } from "react-bootstrap";
import Condition from "./Condition";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ConditionModal({
	blockData,
	setBlockData,
	blocksData,
	showConditionsModal,
	setShowConditionsModal,
}) {
	const handleClose = () => {
		setBlockData();
		setShowConditionsModal(false);
	};

	const [editing, setEditing] = useState(undefined);
	const [conditionEdit, setConditionEdit] = useState(undefined);

	const [userProfileObjective, setUserProfileObjective] = useState(true);
	const [dateOperator, setDateOperator] = useState(false);

	const [selectedOption, setSelectedOption] = useState(null);

	const handleSelectChange = (event) => {
		setSelectedOption(event.target.value);
	};

	const saveButton = useRef(null);
	const conditionOperator = useRef(null);
	const conditionQuery = useRef(null);
	const conditionObjective = useRef(null);
	const conditionObjective2 = useRef(null);

	const parentsNodeArray = getParentsNode(blocksData, blockData.id);

	const addCondition = (conditionId) => {
		if (blockData.conditions.id != conditionId) {
			const foundCondition = findConditionById(
				conditionId,
				blockData.conditions.conditions
			);
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
		setSelectedOption("");
		setConditionEdit(undefined);
		setEditing(undefined);
	};

	const saveNewCondition = (edition) => {
		const formData = { type: selectedOption };

		formData.op = conditionOperator.current.value;
		switch (selectedOption) {
			case "date":
				formData.query = conditionQuery.current.value;
				break;
			case "qualification":
				if (!conditionObjective.current.disabled) {
					formData.objective = conditionObjective.current.value;
				}
				if (!conditionObjective2.current.disabled) {
					formData.objective2 = conditionObjective2.current.value;
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

		const uniqueId = parseInt(Date.now() * Math.random()).toString();
		formData.id = uniqueId;

		const updatedBlockData = deepCopy(blockData);

		if (edition) {
			formData.id = conditionEdit.id;
			if (conditionEdit.type == "conditionsGroup") {
				formData.conditions = conditionEdit.conditions;
			}

			updateConditionById(
				updatedBlockData.conditions.conditions,
				formData.id,
				formData
			);

			setBlockData(updatedBlockData);
		} else {
			const updatedCondition = {
				...editing,
				conditions: editing.conditions
					? [...editing.conditions, formData]
					: [formData],
			};

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
		}
		setSelectedOption("");
		setConditionEdit(undefined);
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

	function handleUserProfileChange() {
		setUserProfileObjective(conditionObjective.current.value === "");
	}

	function handleDateChange() {
		setDateOperator(conditionOperator.current.value === "");
	}

	function getParentsNode(nodesArray, childId) {
		return nodesArray.filter(
			(node) => node.children && node.children.includes(childId)
		);
	}

	const checkInputs = () => {
		if (event.target.type === "checkbox") {
			if (event.target.id === "objectiveCheckbox") {
				var condition = conditionObjective.current.disabled;
				conditionObjective.current.disabled = !condition;
			} else if (event.target.id === "objective2Checkbox") {
				var condition = conditionObjective2.current.disabled;
				conditionObjective2.current.disabled = !condition;
			}
		}

		const objValue = conditionObjective.current?.value;
		const obj2Value = conditionObjective2.current?.value;
		const isObjEmpty = !objValue && objValue !== 0;
		const isObj2Empty = !obj2Value && obj2Value !== 0;

		const isDisabled = conditionObjective.current?.disabled;
		const isDisabled2 = conditionObjective2.current?.disabled;

		if (!isDisabled) {
			if (isObjEmpty) {
				saveButton.current.disabled = true;
			} else {
				saveButton.current.disabled = false;
			}
		}
		if (!isDisabled2) {
			if (isObj2Empty) {
				saveButton.current.disabled = true;
			} else {
				saveButton.current.disabled = false;
			}
		}
		if (isDisabled && isDisabled2) {
			saveButton.current.disabled = true;
		}

		if (!isDisabled && !isDisabled2) {
			if (isObjEmpty || isObj2Empty) {
				console.log("ALGUNO VACIO");
				saveButton.current.disabled = true;
			} else {
				saveButton.current.disabled = false;
			}
		}
	};

	useEffect(() => {
		if (conditionEdit) {
			if (conditionEdit.type !== "userProfile") {
				setUserProfileObjective(true);
			}
			addCondition(conditionEdit.id);
			setSelectedOption(conditionEdit.type);
		}
	}, [conditionEdit]);

	return (
		<Modal size="xl" show={showConditionsModal} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Precondiciones de "{blockData.title}"</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{blockData.conditions &&
					!editing &&
					blockData.conditions.conditions.map((condition) => {
						return (
							<Condition
								condition={condition}
								deleteCondition={deleteCondition}
								addCondition={addCondition}
								setSelectedOption={setSelectedOption}
								setConditionEdit={setConditionEdit}
							></Condition>
						);
					})}
				{editing &&
					(conditionEdit === undefined ||
					conditionEdit.type !== "conditionsGroup" ? (
						<Form.Select
							id="condition-select"
							onChange={handleSelectChange}
							defaultValue={conditionEdit?.type ? conditionEdit?.type : ""}
							required
						>
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
					) : null)}
				{editing && selectedOption === "date" && (
					<Form.Group>
						<Form.Select
							ref={conditionQuery}
							defaultValue={conditionEdit?.query}
						>
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
				)}
				{editing && selectedOption === "qualification" && (
					<Form.Group>
						<Form.Select
							ref={conditionOperator}
							defaultValue={conditionEdit?.op}
						>
							<option value="fullCourse">Total del curso</option>
							{parentsNodeArray.length > 0 &&
								parentsNodeArray.map((node) => (
									<option key={node.id}>{node.title}</option>
								))}
						</Form.Select>
						<Form.Check
							id="objectiveCheckbox"
							type="checkbox"
							label="debe ser >="
							onChange={checkInputs}
							defaultChecked={
								conditionEdit && conditionEdit.objective
									? true
									: false || !conditionEdit
							}
						/>
						<Form.Control
							ref={conditionObjective}
							type="number"
							min="0"
							max="10"
							defaultValue={
								conditionEdit && conditionEdit.objective !== undefined
									? conditionEdit.objective
									: 5
							}
							disabled={conditionEdit && !conditionEdit.objective}
							onChange={checkInputs}
						/>
						<Form.Check
							id="objective2Checkbox"
							type="checkbox"
							label="debe ser <"
							defaultChecked={
								conditionEdit && conditionEdit.objective2
									? true
									: false || false
							}
							onChange={checkInputs}
						/>
						<Form.Control
							ref={conditionObjective2}
							type="number"
							min="0"
							max="10"
							defaultValue={
								conditionEdit && conditionEdit.objective2 !== undefined
									? conditionEdit.objective2
									: 5
							}
							disabled={!conditionEdit || !conditionEdit.objective2}
							onChange={checkInputs}
						/>
					</Form.Group>
				)}
				{editing && selectedOption === "completion" && (
					<Form.Group>
						<Form.Select
							ref={conditionOperator}
							defaultValue={conditionEdit?.op}
						>
							{parentsNodeArray.length > 0 &&
								parentsNodeArray.map((node) => (
									<option key={node.id}>{node.title}</option>
								))}
						</Form.Select>
						<Form.Select
							ref={conditionQuery}
							defaultValue={conditionEdit?.query}
						>
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
						<Form.Select
							ref={conditionOperator}
							defaultValue={conditionEdit?.op}
						>
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
						<Form.Select
							ref={conditionQuery}
							defaultValue={conditionEdit?.query}
						>
							<option value="equals">es igual a</option>
							<option value="contains">contiene</option>
							<option value="notContains">no contiene</option>
							<option value="startsWith">comienza con</option>
							<option value="endsWith">termina en</option>
							<option value="empty">está vacío</option>
							<option value="notEmpty">no está vacío</option>
						</Form.Select>
						<Form.Control
							ref={conditionObjective}
							onChange={handleUserProfileChange}
							defaultValue={
								conditionEdit?.type === "userProfile"
									? conditionEdit?.objective
									: ""
							}
							type="text"
						/>
					</Form.Group>
				)}
				{editing && selectedOption === "conditionsGroup" && (
					<Form.Group>
						<Form.Select
							ref={conditionOperator}
							defaultValue={conditionEdit?.op}
						>
							<option value="&">Se deben cumplir todas</option>
							<option value="|">Solo debe cumplirse una</option>
						</Form.Select>
					</Form.Group>
				)}
				{!editing && (
					<Button className="mb-5" variant="light" onClick={addConditionToMain}>
						<div role="button">
							<FontAwesomeIcon className={styles.cModal} icon={faPlus} />
							Crear condición
						</div>
					</Button>
				)}
			</Modal.Body>
			<Modal.Footer>
				{editing && (
					<div>
						<Button variant="primary" onClick={cancelEditCondition}>
							Cancelar
						</Button>
						<Button
							ref={saveButton}
							variant="primary"
							onClick={() => {
								if (conditionEdit) {
									saveNewCondition(true);
								} else {
									saveNewCondition(false);
								}
							}}
							disabled={
								selectedOption === "" ||
								!selectedOption ||
								(selectedOption === "userProfile" && userProfileObjective) ||
								(selectedOption === "date" && dateOperator)
							}
						>
							Guardar
						</Button>
					</div>
				)}
			</Modal.Footer>
		</Modal>
	);
}

export default ConditionModal;
