import React, { useEffect, useRef, useState } from "react";
import styles from "@components/styles/ConditionModal.module.css";
import { Modal, Button, Form, Row, Col, Container } from "react-bootstrap";
import Condition from "./Condition";
import { faEdit, faPlus, faShuffle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserProfileForm from "./form-components/UserProfileForm";
import CompletionForm from "./form-components/CompletionForm";
import QualificationForm from "./form-components/QualificationForm";
import DateForm from "./form-components/DateForm";
import ConditionsGroupForm from "./form-components/ConditionsGroupForm";
import GroupForm from "./form-components/GroupForm";
import GroupingForm from "./form-components/GroupingForm";
import { uniqueId } from "@components/components/Utils";
import CourseQualificationForm from "./form-components/CourseQualificationForm";
import { useReactFlow } from "reactflow";

function ConditionModal({
	blockData,
	setBlockData,
	blocksData,
	onEdgesDelete,
	showConditionsModal,
	setShowConditionsModal,
}) {
	const reactFlowInstance = useReactFlow();

	const handleClose = () => {
		setBlockData();
		setShowConditionsModal(false);
	};

	const moodleGroups = [
		{ id: "group-1", name: "Grupo A" },
		{ id: "group-2", name: "Grupo B" },
		{ id: "group-3", name: "Grupo C" },
		{ id: "group-4", name: "Grupo D" },
		{ id: "group-5", name: "Grupo E" },
		{ id: "group-6", name: "Grupo F" },
		{ id: "group-7", name: "Grupo G" },
	];

	const moodleGroupings = [
		{ id: "grouping-1", name: "Agrupamiento A" },
		{ id: "grouping-2", name: "Agrupamiento B" },
		{ id: "grouping-3", name: "Agrupamiento C" },
		{ id: "grouping-4", name: "Agrupamiento D" },
		{ id: "grouping-5", name: "Agrupamiento E" },
		{ id: "grouping-6", name: "Agrupamiento F" },
		{ id: "grouping-7", name: "Agrupamiento G" },
	];

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

	const findParentObject = (id, json) => {
		if (json.conditions) {
			for (let i = 0; i < json.conditions.length; i++) {
				const condition = json.conditions[i];

				if (condition.id === id) {
					return json;
				}

				if (condition.conditions) {
					const parent = findParentObject(id, condition);
					if (parent) {
						return parent;
					}
				}
			}
		}

		return null;
	};

	const updateJsonById = (json, id, updatedJson) => {
		if (json.id === id) {
			return { ...json, ...updatedJson };
		}

		if (json.conditions && Array.isArray(json.conditions)) {
			const updatedConditions = json.conditions.map((condition) =>
				updateJsonById(condition, id, updatedJson)
			);

			return { ...json, conditions: updatedConditions };
		}

		return json;
	};

	function insertBeforeSourceId(sourceId, targetJson, json) {
		let insertIndex = -1;
		const updatedConditions = json.conditions.reduce(
			(acc, condition, index) => {
				if (condition.id === sourceId) {
					insertIndex = index;
					return [...acc, targetJson, condition];
				}
				return [...acc, condition];
			},
			[]
		);

		if (insertIndex === -1) {
			updatedConditions.push(targetJson);
		}

		const updatedJson = {
			...json,
			conditions: updatedConditions,
		};

		return updatedJson;
	}

	function insertAfterSourceId(sourceId, targetJson, json) {
		let insertIndex = -1;
		const updatedConditions = json.conditions.reduce(
			(acc, condition, index) => {
				if (condition.id === sourceId) {
					insertIndex = index;
					return [...acc, condition, targetJson];
				}
				return [...acc, condition];
			},
			[]
		);

		if (insertIndex === -1) {
			updatedConditions.push(targetJson);
		}

		const updatedJson = {
			...json,
			conditions: updatedConditions,
		};

		return updatedJson;
	}

	function upCondition(condition) {
		let parentObject;

		if (findParentObject(condition.id, blockData.data.conditions) == null) {
			parentObject = blockData.data.conditions;
		} else {
			parentObject = findParentObject(condition.id, blockData.data.conditions);
		}

		const blockDataCopy = deepCopy(blockData);

		const conditionsList = parentObject.conditions;
		const index = conditionsList.findIndex((item) => item.id === condition.id);
		var updatedArray = [...conditionsList];

		if (index === 0) {
			if (parentObject.id == blockData.data.conditions.id) {
				console.log("PADRE MAIN, VOY A LO MAS BAJO");
				const movedJson = updatedArray.shift();
				updatedArray.push(movedJson);

				// GUARDAR EL updatedArray como conditions de blockData.data.conditions -> blockData.data.conditions.conditions
			} else {
				let parentOfParent;
				if (
					findParentObject(parentObject.id, blockData.data.conditions) == null
				) {
					console.log("MI ABUELO ES EL MAIN");

					parentOfParent = blockData.data.conditions;
				} else {
					console.log("MI ABUELO NO ES EL MAIN");

					parentOfParent = findParentObject(
						parentObject.id,
						blockData.data.conditions
					);
				}

				deleteConditionById(blockData.data.conditions.conditions, condition.id);

				const updatedJson = insertBeforeSourceId(
					parentObject.id,
					condition,
					parentOfParent
				);

				if (updatedJson.id == blockData.data.conditions.id) {
					updatedArray = updatedJson.conditions;
				} else {
					updatedArray = updateJsonById(
						blockDataCopy.data.conditions,
						updatedJson.id,
						updatedJson
					).conditions;
				}
			}
		} else if (index > 0) {
			const movedJson = updatedArray.splice(index, 1)[0];
			const upperJson = updatedArray[index - 1];

			if (upperJson.type === "conditionsGroup") {
				if (!upperJson.conditions) {
					upperJson.conditions = [];
				}
				const existingIndex = upperJson.conditions.findIndex(
					(item) => item.id === movedJson.id
				);
				if (existingIndex === -1) {
					upperJson.conditions.push(movedJson);
				}
			} else {
				updatedArray.splice(index - 1, 0, movedJson);
			}

			if (parentObject.id != blockData.data.conditions.id) {
				updatedArray = updateConditionsById(
					blockDataCopy.data.conditions,
					parentObject.id,
					updatedArray
				).conditions;
			}
		}

		const updatedBlockData = {
			...blockData,
			data: {
				...blockData.data,
				conditions: {
					...blockData.data.conditions,
					conditions: updatedArray,
				},
			},
		};

		setBlockData(updatedBlockData);
	}

	const downCondition = (condition) => {
		let parentObject;

		if (findParentObject(condition.id, blockData.data.conditions) == null) {
			parentObject = blockData.data.conditions;
		} else {
			parentObject = findParentObject(condition.id, blockData.data.conditions);
		}

		const blockDataCopy = deepCopy(blockData);

		const conditionsList = parentObject.conditions;
		const index = conditionsList.findIndex((item) => item.id === condition.id);
		var updatedArray = [...conditionsList];

		if (index === updatedArray.length - 1) {
			if (parentObject.id == blockData.data.conditions.id) {
				console.log("ME VOY ARRIBA DEL TODO");
				const movedJson = updatedArray.pop();
				updatedArray.unshift(movedJson);
			} else {
				console.log("ME SALGO FUERA DE MI GRUPO");

				let parentOfParent;
				if (
					findParentObject(parentObject.id, blockData.data.conditions) == null
				) {
					console.log("MI ABUELO ES EL MAIN");

					parentOfParent = blockData.data.conditions;
				} else {
					console.log("MI ABUELO NO ES EL MAIN");

					parentOfParent = findParentObject(
						parentObject.id,
						blockData.data.conditions
					);
				}

				deleteConditionById(blockData.data.conditions.conditions, condition.id);

				const updatedJson = insertAfterSourceId(
					parentObject.id,
					condition,
					parentOfParent
				);

				if (updatedJson.id == blockData.data.conditions.id) {
					updatedArray = updatedJson.conditions;
				} else {
					updatedArray = updateJsonById(
						blockDataCopy.data.conditions,
						updatedJson.id,
						updatedJson
					).conditions;
				}
			}
		} else {
			console.log("NO SOY EL MAS BAJO");

			const movedJson = updatedArray.splice(index, 1)[0];
			const bottomJson = updatedArray[index];

			if (bottomJson.type === "conditionsGroup") {
				if (!bottomJson.conditions) {
					bottomJson.conditions = [];
				}
				const existingIndex = bottomJson.conditions.findIndex(
					(item) => item.id === movedJson.id
				);

				if (existingIndex === -1) {
					bottomJson.conditions.unshift(movedJson);
				}
			} else {
				updatedArray.splice(index + 1, 0, movedJson);
			}

			if (parentObject.id != blockData.data.conditions.id) {
				updatedArray = updateConditionsById(
					blockDataCopy.data.conditions,
					parentObject.id,
					updatedArray
				).conditions;
			}
		}

		const updatedBlockData = {
			...blockData,
			data: {
				...blockData.data,
				conditions: {
					...blockData.data.conditions,
					conditions: updatedArray,
				},
			},
		};

		setBlockData(updatedBlockData);
	};

	const updateConditionsById = (json, id, updatedConditions) => {
		if (json.id === id) {
			return {
				...json,
				conditions: updatedConditions,
			};
		}

		if (json.conditions && Array.isArray(json.conditions)) {
			const updatedConditionsArray = json.conditions.map((condition) =>
				updateConditionsById(condition, id, updatedConditions)
			);

			return {
				...json,
				conditions: updatedConditionsArray,
			};
		}

		return json;
	};

	const addCondition = (conditionId) => {
		if (blockData.data.conditions.id != conditionId) {
			const foundCondition = findConditionById(
				conditionId,
				blockData.data.conditions.conditions
			);
			setEditing(foundCondition);
		} else {
			setEditing(blockData.data.conditions);
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

		const foundCondition = findConditionById(
			conditionId,
			blockData.data.conditions.conditions
		);

		if (
			foundCondition.type == "completion" ||
			foundCondition.type == "qualification"
		) {
			const nodes = reactFlowInstance.getEdges();

			const nodesUpdated = nodes.filter(
				(node) => node.id === foundCondition.op + "-" + blockData.id
			);

			onEdgesDelete(nodesUpdated);

			reactFlowInstance.setEdges(
				nodes.filter(
					(node) => node.id !== foundCondition.op + "-" + blockData.id
				)
			);
		}

		deleteConditionById(blockDataCopy.data.conditions.conditions, conditionId);

		console.log(blockDataCopy.data.conditions);

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
			case "courseQualification":
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
			case "group":
				break;
			case "grouping":
				break;
			case "userProfile":
				formData.query = conditionQuery.current.value;
				formData.objective = conditionObjective.current.value;
				break;
			case "conditionsGroup":
				break;
			case "role":
				break;
			case "courseCompletion":
				break;
			case "badgeList":
				break;
			case "completion":
				break;
			case "skills":
				break;
			default:
				break;
		}

		formData.id = uniqueId();

		const updatedBlockData = deepCopy(blockData);

		if (edition) {
			formData.id = conditionEdit.id;

			updateConditionById(
				updatedBlockData.data.conditions.conditions,
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

			if (!updatedBlockData.data.conditions) {
				updatedBlockData.data.conditions = updatedCondition;
				setBlockData(updatedBlockData);
			} else {
				if (
					updateConditionById(
						updatedBlockData.data.conditions.conditions,
						updatedCondition.id,
						updatedCondition
					)
				) {
					setBlockData(updatedBlockData);
				} else {
					const updatedJsonObject = {
						...updatedBlockData,
						data: {
							...updatedBlockData.data,
							conditions: updatedCondition,
						},
					};
					setBlockData(updatedJsonObject);
				}
			}
		}
		console.log(blockData);
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
		if (blockData.data.conditions) {
			addCondition(blockData.data.conditions.id);
		} else {
			const firstConditionGroup = {
				type: "conditionsGroup",
				id: parseInt(Date.now() * Math.random()).toString(),
				op: "&",
			};
			setEditing(firstConditionGroup);
		}
	};

	function swapConditionGroup(condition) {
		const updatedBlockData = deepCopy(blockData);
		const swapOperator = condition.op === "&" ? "|" : "&";

		updateConditionOp(
			updatedBlockData.data.conditions,
			condition.id,
			swapOperator
		);
		setBlockData(updatedBlockData);
	}

	function handleUserProfileChange() {
		setUserProfileObjective(conditionObjective.current.value === "");
	}

	function handleDateChange() {
		setDateOperator(conditionOperator.current.value === "");
	}

	function getParentsNode(nodesArray, childId) {
		return nodesArray.filter(
			(node) => node.data.children && node.data.children.includes(childId)
		);
	}

	function updateConditionOp(jsonObj, id, newOp) {
		if (jsonObj.id === id) {
			jsonObj.op = newOp;
			return true;
		} else if (jsonObj.conditions) {
			for (let i = 0; i < jsonObj.conditions.length; i++) {
				if (updateConditionOp(jsonObj.conditions[i], id, newOp)) {
					return true;
				}
			}
		}
		return false;
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
				saveButton.current.disabled = true;
			} else {
				saveButton.current.disabled = false;
			}
		}
	};

	useEffect(() => {
		if (conditionEdit) {
			console.log(conditionEdit);

			if (conditionEdit.type !== "userProfile") {
				setUserProfileObjective(true);
			}
			addCondition(conditionEdit.id);
			setSelectedOption(conditionEdit.type);
		}
	}, [conditionEdit]);

	const conditionsGroupOperatorList = [
		{ value: "&", name: "Se deben cumplir todas" },
		{ value: "|", name: "Solo debe cumplirse una" },
	];

	return (
		<Modal size="xl" show={showConditionsModal} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Precondiciones de "{blockData.data.label}"</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{blockData.data.conditions && !editing && (
					<Container
						style={{
							padding: "10px",
							border: "1px solid #C7C7C7",
							marginBottom: "10px",
						}}
					>
						<Row>
							<Col>
								<div>Tipo: Conjunto de condiciones</div>
								<div>
									<strong>
										{
											conditionsGroupOperatorList.find(
												(item) => item.value === blockData.data.conditions.op
											)?.name
										}
									</strong>
								</div>
							</Col>
							<Col class="col d-flex align-items-center">
								<Button
									variant="light"
									onClick={() => {
										swapConditionGroup(blockData.data.conditions);
									}}
								>
									<div>
										<FontAwesomeIcon icon={faShuffle} />
									</div>
								</Button>
							</Col>
						</Row>
						<Container>
							{blockData.data.conditions.conditions.map((condition) => {
								return (
									<Condition
										condition={condition}
										conditionsList={blockData.data.conditions.conditions}
										upCondition={upCondition}
										downCondition={downCondition}
										deleteCondition={deleteCondition}
										addCondition={addCondition}
										setSelectedOption={setSelectedOption}
										setConditionEdit={setConditionEdit}
										swapConditionGroup={swapConditionGroup}
									></Condition>
								);
							})}
						</Container>
					</Container>
				)}
				{editing &&
					(conditionEdit === undefined ||
					(conditionEdit.type !== "conditionsGroup" &&
						conditionEdit.type !== "completion" &&
						conditionEdit.type !== "qualification") ? (
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
							<option value="courseQualification">
								Calificación total del curso
							</option>
							{moodleGroups.length > 0 && <option value="group">Grupo</option>}
							{moodleGroupings.length > 0 && (
								<option value="grouping">Agrupamiento</option>
							)}
							<option value="userProfile">Perfil de usuario</option>
							<option value="conditionsGroup">Conjunto de condiciones</option>
						</Form.Select>
					) : null)}

				{editing &&
					conditionEdit?.type &&
					(conditionEdit.type == "completion" ||
						conditionEdit.type == "qualification") && (
						<Form.Select
							id="condition-select"
							onChange={handleSelectChange}
							defaultValue={conditionEdit?.type ? conditionEdit?.type : ""}
							required
						>
							<option value="completion">Finalización</option>
							<option value="qualification">Calificación</option>
						</Form.Select>
					)}

				{editing && selectedOption === "date" && (
					<DateForm
						conditionQuery={conditionQuery}
						conditionOperator={conditionOperator}
						conditionEdit={conditionEdit}
						handleDateChange={handleDateChange}
					/>
				)}
				{editing && selectedOption === "qualification" && (
					<QualificationForm
						conditionOperator={conditionOperator}
						conditionQuery={conditionQuery}
						conditionObjective={conditionObjective}
						conditionObjective2={conditionObjective2}
						conditionEdit={conditionEdit}
						parentsNodeArray={parentsNodeArray}
						checkInputs={checkInputs}
					/>
				)}

				{editing && selectedOption === "courseQualification" && (
					<CourseQualificationForm
						conditionOperator={conditionOperator}
						conditionQuery={conditionQuery}
						conditionObjective={conditionObjective}
						conditionObjective2={conditionObjective2}
						conditionEdit={conditionEdit}
						parentsNodeArray={parentsNodeArray}
						checkInputs={checkInputs}
					/>
				)}

				{editing && selectedOption === "completion" && (
					<CompletionForm
						parentsNodeArray={parentsNodeArray}
						conditionOperator={conditionOperator}
						conditionQuery={conditionQuery}
						conditionEdit={conditionEdit}
					/>
				)}

				{editing && selectedOption === "group" && (
					<GroupForm
						conditionOperator={conditionOperator}
						moodleGroups={moodleGroups}
						conditionEdit={conditionEdit}
					/>
				)}
				{editing && selectedOption === "grouping" && (
					<GroupingForm
						conditionOperator={conditionOperator}
						conditionEdit={conditionEdit}
						moodleGroupings={moodleGroupings}
					/>
				)}
				{editing && selectedOption === "userProfile" && (
					<UserProfileForm
						conditionOperator={conditionOperator}
						conditionQuery={conditionQuery}
						conditionObjective={conditionObjective}
						conditionEdit={conditionEdit}
						handleUserProfileChange={handleUserProfileChange}
					/>
				)}
				{editing && selectedOption === "conditionsGroup" && (
					<ConditionsGroupForm
						conditionOperator={conditionOperator}
						conditionEdit={conditionEdit}
					/>
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
