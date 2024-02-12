import React, { useEffect, useContext, useRef, useState } from "react";
import styles from "/styles/ConditionModalMoodle.module.css";
import { Modal, Button, Form, Row, Col, Container } from "react-bootstrap";
import { getNodeById } from "@utils/Nodes";
import Condition from "./Condition";
import {
	faEdit,
	faEye,
	faEyeSlash,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getParentsNode } from "@utils/Nodes";
import ProfileForm from "@components/flow//conditions/moodle/form-components/ProfileForm";
import CompletionForm from "@components/flow/conditions/moodle/form-components/CompletionForm";
import GradeForm from "@components/flow//conditions/moodle/form-components/GradeForm";
import DateForm from "@components/flow//conditions/moodle/form-components/DateForm";
import ConditionsGroupForm from "@components/flow//conditions/moodle/form-components/ConditionsGroupForm";
import GroupForm from "@components/flow//conditions/moodle/form-components/GroupForm";
import GroupingForm from "@components/flow//conditions/moodle/form-components/GroupingForm";
import { uniqueId, findCompletionAndGrade } from "@utils/Utils";
import CourseGradeForm from "./form-components/CourseGradeForm";
import { useReactFlow } from "reactflow";
import { MetaDataContext } from "pages/_app.tsx";

function ConditionModalMoodle({
	blockData,
	setBlockData,
	blocksData,
	onEdgesDelete,
	showConditionsModal,
	setShowConditionsModal,
}) {
	const reactFlowInstance = useReactFlow();
	const { metaData, setMetaData } = useContext(MetaDataContext);

	const handleClose = () => {
		setBlockData();
		setShowConditionsModal(false);
	};

	const MOODLE_GROUPS = metaData.groups;

	const MOODLE_GROUPINGS = metaData.groupings;

	const [editing, setEditing] = useState(undefined);
	const [conditionEdit, setConditionEdit] = useState(undefined);

	const [profileObjective, setProfileObjective] = useState(true);
	const [operatorChange, setOperatorChange] = useState("");
	const [dateOperator, setDateOperator] = useState(false);

	const [selectedOption, setSelectedOption] = useState(null);

	const handleSelectChange = (event) => {
		setSelectedOption(event.target.value);
	};

	const saveButton = useRef(null);
	const conditionOperator = useRef(null);
	const conditionSubOperator = useRef(null);
	const conditionQuery = useRef(null);
	const conditionObjective = useRef(null);
	const conditionObjective2 = useRef(null);

	const PARENTS_NODE_ARRAY = getParentsNode(blocksData, blockData.id);

	const findParentObject = (id, json) => {
		if (json.c) {
			for (let i = 0; i < json.c.length; i++) {
				const condition = json.c[i];

				if (condition.id === id) {
					return json;
				}

				if (condition.c) {
					const PARENT = findParentObject(id, condition);
					if (PARENT) {
						return PARENT;
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

		if (json.c && Array.isArray(json.c)) {
			const UPDATED_CONDITIONS = json.c.map((condition) =>
				updateJsonById(condition, id, updatedJson)
			);

			return { ...json, c: UPDATED_CONDITIONS };
		}

		return json;
	};

	function insertBeforeSourceId(sourceId, targetJson, json) {
		let insertIndex = -1;
		const UPDATED_CONDITIONS = json.c.reduce((acc, condition, index) => {
			if (condition.id === sourceId) {
				insertIndex = index;
				return [...acc, targetJson, condition];
			}
			return [...acc, condition];
		}, []);

		if (insertIndex === -1) {
			UPDATED_CONDITIONS.push(targetJson);
		}

		const UPDATED_JSON = {
			...json,
			c: UPDATED_CONDITIONS,
		};

		return UPDATED_JSON;
	}

	function insertAfterSourceId(sourceId, targetJson, json) {
		let insertIndex = -1;
		const UPDATED_CONDITIONS = json.c.reduce((acc, condition, index) => {
			if (condition.id === sourceId) {
				insertIndex = index;
				return [...acc, condition, targetJson];
			}
			return [...acc, condition];
		}, []);

		if (insertIndex === -1) {
			UPDATED_CONDITIONS.push(targetJson);
		}

		const UPDATED_JSON = {
			...json,
			c: UPDATED_CONDITIONS,
		};

		return UPDATED_JSON;
	}

	function upCondition(condition) {
		let parentObject;

		if (findParentObject(condition.id, blockData.data.c) == null) {
			parentObject = blockData.data.c;
		} else {
			parentObject = findParentObject(condition.id, blockData.data.c);
		}

		const BLOCKDATA_COPY = deepCopy(blockData);

		const CONDITIONS_LIST = parentObject.c;
		const CONDITION_INDEX = CONDITIONS_LIST.findIndex(
			(item) => item.id === condition.id
		);
		let updatedArray = [...CONDITIONS_LIST];

		if (CONDITION_INDEX === 0) {
			if (parentObject.id == blockData.data.c.id) {
				const MOVED_JSON = updatedArray.shift();
				updatedArray.push(MOVED_JSON);

				// GUARDAR EL updatedArray como conditions de blockData.data.c -> blockData.data.c.c
			} else {
				let parentOfParent;
				if (findParentObject(parentObject.id, blockData.data.c) == null) {
					parentOfParent = blockData.data.c;
				} else {
					parentOfParent = findParentObject(parentObject.id, blockData.data.c);
				}

				deleteConditionById(blockData.data.c.c, condition.id);

				const UPDATED_JSON = insertBeforeSourceId(
					parentObject.id,
					condition,
					parentOfParent
				);

				if (UPDATED_JSON.id == blockData.data.c.id) {
					updatedArray = UPDATED_JSON.c;
				} else {
					updatedArray = updateJsonById(
						BLOCKDATA_COPY.data.c,
						UPDATED_JSON.id,
						UPDATED_JSON
					).c;
				}
			}
		} else if (CONDITION_INDEX > 0) {
			const MOVED_JSON = updatedArray.splice(CONDITION_INDEX, 1)[0];
			const UPPER_JSON = updatedArray[CONDITION_INDEX - 1];

			if (UPPER_JSON.type === "conditionsGroup") {
				if (!UPPER_JSON.c) {
					UPPER_JSON.c = [];
				}
				const EXISTING_INDEX = UPPER_JSON.c.findIndex(
					(item) => item.id === MOVED_JSON.id
				);
				if (EXISTING_INDEX === -1) {
					UPPER_JSON.c.push(MOVED_JSON);
				}
			} else {
				updatedArray.splice(CONDITION_INDEX - 1, 0, MOVED_JSON);
			}

			if (parentObject.id != blockData.data.c.id) {
				updatedArray = updateConditionsById(
					BLOCKDATA_COPY.data.c,
					parentObject.id,
					updatedArray
				).c;
			}
		}

		const UPDATED_BLOCKDATA = {
			...blockData,
			data: {
				...blockData.data,
				c: {
					...blockData.data.c,
					c: updatedArray,
				},
			},
		};

		setBlockData(UPDATED_BLOCKDATA);
	}

	const downCondition = (condition) => {
		let parentObject;

		if (findParentObject(condition.id, blockData.data.c) == null) {
			parentObject = blockData.data.c;
		} else {
			parentObject = findParentObject(condition.id, blockData.data.c);
		}

		const BLOCKDATA_COPY = deepCopy(blockData);

		const CONDITIONS_LIST = parentObject.c;
		const index = CONDITIONS_LIST.findIndex((item) => item.id === condition.id);
		var updatedArray = [...CONDITIONS_LIST];

		if (index === updatedArray.length - 1) {
			if (parentObject.id == blockData.data.c.id) {
				const MOVED_JSON = updatedArray.pop();
				updatedArray.unshift(MOVED_JSON);
			} else {
				let parentOfParent;
				if (findParentObject(parentObject.id, blockData.data.c) == null) {
					parentOfParent = blockData.data.c;
				} else {
					parentOfParent = findParentObject(parentObject.id, blockData.data.c);
				}

				deleteConditionById(blockData.data.c.c, condition.id);

				const UPDATED_JSON = insertAfterSourceId(
					parentObject.id,
					condition,
					parentOfParent
				);

				if (UPDATED_JSON.id == blockData.data.c.id) {
					updatedArray = UPDATED_JSON.c;
				} else {
					updatedArray = updateJsonById(
						BLOCKDATA_COPY.data.c,
						UPDATED_JSON.id,
						UPDATED_JSON
					).c;
				}
			}
		} else {
			const MOVED_JSON = updatedArray.splice(index, 1)[0];
			const BOTTOM_JSON = updatedArray[index];

			if (BOTTOM_JSON.type === "conditionsGroup") {
				if (!BOTTOM_JSON.c) {
					BOTTOM_JSON.c = [];
				}
				const EXISTING_INDEX = BOTTOM_JSON.c.findIndex(
					(item) => item.id === MOVED_JSON.id
				);

				if (EXISTING_INDEX === -1) {
					BOTTOM_JSON.c.unshift(MOVED_JSON);
				}
			} else {
				updatedArray.splice(index + 1, 0, MOVED_JSON);
			}

			if (parentObject.id != blockData.data.c.id) {
				updatedArray = updateConditionsById(
					BLOCKDATA_COPY.data.c,
					parentObject.id,
					updatedArray
				).c;
			}
		}

		const UPDATED_BLOCKDATA = {
			...blockData,
			data: {
				...blockData.data,
				c: {
					...blockData.data.c,
					c: updatedArray,
				},
			},
		};

		setBlockData(UPDATED_BLOCKDATA);
	};

	const updateConditionsById = (json, id, updatedConditions) => {
		if (json.id === id) {
			return {
				...json,
				c: updatedConditions,
			};
		}

		if (json.c && Array.isArray(json.c)) {
			const UPDATED_CONDITION_ARRAY = json.c.map((condition) =>
				updateConditionsById(condition, id, updatedConditions)
			);

			return {
				...json,
				c: UPDATED_CONDITION_ARRAY,
			};
		}

		return json;
	};

	const addCondition = (conditionId) => {
		if (blockData.data.c.id != conditionId) {
			const FOUND_CONDITION = findConditionById(
				conditionId,
				blockData.data.c.c
			);
			setEditing(FOUND_CONDITION);
		} else {
			setEditing(blockData.data.c);
		}
	};

	function findConditionById(id, conditions) {
		if (!conditions) {
			return null;
		}

		const FOUND_CONDITION = conditions.find((condition) => condition.id === id);
		if (FOUND_CONDITION) {
			return FOUND_CONDITION;
		}

		for (const condition of conditions) {
			if (condition.c) {
				const innerCondition = findConditionById(id, condition.c);
				if (innerCondition) {
					return innerCondition;
				}
			}
		}

		return null;
	}

	function deleteConditionById(conditions, id) {
		for (let i = 0; i < conditions.length; i++) {
			const CONDITION = conditions[i];
			if (CONDITION.id === id) {
				conditions.splice(i, 1);
				if (conditions.length === 0) {
					conditions = undefined;
				}
				return true;
			} else if (CONDITION.c) {
				if (deleteConditionById(CONDITION.c, id)) {
					if (CONDITION.c.length === 0) {
						CONDITION.c = undefined;
					}
					return true;
				}
			}
		}
		return false;
	}

	function updateConditionById(conditions, id, newCondition) {
		for (let i = 0; i < (conditions?.length || 0); i++) {
			const CONDITION = conditions[i];
			if (CONDITION.id === id) {
				conditions[i] = newCondition;
				return true;
			} else if (CONDITION.c) {
				if (updateConditionById(CONDITION.c, id, newCondition)) {
					return true;
				}
			}
		}
		return false;
	}

	const deleteCondition = (conditionId) => {
		const BLOCKDATA_COPY = deepCopy(blockData);

		const FOUND_CONDITION = findConditionById(conditionId, blockData.data.c.c);

		const CONDITION_COPY = deepCopy(FOUND_CONDITION);

		const EDGES = reactFlowInstance.getEdges();

		if (
			FOUND_CONDITION.type == "completion" ||
			FOUND_CONDITION.type == "grade"
		) {
			const EDGES_UPDATED = EDGES.filter(
				(edge) => edge.id === FOUND_CONDITION.cm + "-" + blockData.id
			);

			// Delete the children
			onEdgesDelete(EDGES_UPDATED);

			reactFlowInstance.setEdges(
				EDGES.filter(
					(edge) => edge.id !== FOUND_CONDITION.cm + "-" + blockData.id
				)
			);
		} else if (FOUND_CONDITION.type == "conditionsGroup" && FOUND_CONDITION.c) {
			const TARGET_TYPES = ["grade", "completion"];
			const MATCHING_OBJECTS = [];

			const COMPLETIONS_AND_GRADES = findCompletionAndGrade(FOUND_CONDITION);

			const FILTERED_CHILDREN = EDGES.filter((edge) =>
				COMPLETIONS_AND_GRADES.some(
					(condition) => edge.id === condition.cm + "-" + blockData.id
				)
			);

			onEdgesDelete(FILTERED_CHILDREN);

			const FILTERED_EDGES = EDGES.filter(
				(edge) =>
					!MATCHING_OBJECTS.some(
						(condition) => edge.id === condition.cm + "-" + blockData.id
					)
			);

			reactFlowInstance.setEdges(FILTERED_EDGES);
		}

		deleteConditionById(BLOCKDATA_COPY.data.c.c, conditionId);

		setBlockData(BLOCKDATA_COPY);
	};

	const cancelEditCondition = () => {
		setSelectedOption("");
		setOperatorChange("");
		setProfileObjective(true);
		setConditionEdit(undefined);
		setEditing(undefined);
	};

	const saveNewCondition = (edition) => {
		const FORM_DATA = { type: selectedOption };
		FORM_DATA.showc = true;
		switch (selectedOption) {
			case "date":
				FORM_DATA.t = conditionOperator.current.value;
				FORM_DATA.d = conditionQuery.current.value;
				break;
			case "grade":
				FORM_DATA.cm = conditionOperator.current.value;

				if (!conditionObjective.current.disabled) {
					FORM_DATA.min = Number(conditionObjective.current.value);
				}
				if (!conditionObjective2.current.disabled) {
					FORM_DATA.max = Number(conditionObjective2.current.value);
				}
				break;
			case "courseGrade":
				FORM_DATA.courseId = Number(metaData.course_id);

				if (!conditionObjective.current.disabled) {
					FORM_DATA.min = Number(conditionObjective.current.value);
				}
				if (!conditionObjective2.current.disabled) {
					FORM_DATA.max = Number(conditionObjective2.current.value);
				}
				break;
			case "completion":
				FORM_DATA.cm = conditionOperator.current.value;
				FORM_DATA.e = Number(conditionQuery.current.value);
				break;
			case "group":
				{
					const CONDITION_OPERATOR = conditionOperator.current.value;
					const OPERATOR =
						CONDITION_OPERATOR !== "anyGroup"
							? Number(CONDITION_OPERATOR)
							: undefined;

					FORM_DATA.groupId = OPERATOR;
				}
				break;
			case "grouping":
				FORM_DATA.groupingId = Number(conditionOperator.current.value);
				break;
			case "profile":
				let op = conditionOperator.current.value;

				FORM_DATA.sf = conditionQuery.current.value;
				FORM_DATA.op = op;

				if (op != "isempty" && op != "isnotempty") {
					FORM_DATA.v = conditionObjective.current.value;
				}
				break;
			case "conditionsGroup":
				{
					const OPERATOR = conditionOperator.current.value;
					const SUBOPERATOR = conditionSubOperator.current.value;

					if (OPERATOR == "!") {
						FORM_DATA.op = OPERATOR + String(SUBOPERATOR);
					} else {
						FORM_DATA.op = SUBOPERATOR;
					}
				}
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

		FORM_DATA.id = uniqueId();

		const UPDATED_BLOCKDATA = deepCopy(blockData);
		if (edition) {
			FORM_DATA.id = conditionEdit.id;
			if (FORM_DATA.type == "conditionsGroup") {
				FORM_DATA.c = conditionEdit.c;
			}

			if (FORM_DATA.id == blockData.data.c.id) {
				UPDATED_BLOCKDATA.data.c = FORM_DATA;
			} else {
				updateConditionById(
					UPDATED_BLOCKDATA.data.c.c,
					FORM_DATA.id,
					FORM_DATA
				);
			}

			setBlockData(UPDATED_BLOCKDATA);
		} else {
			const UPDATED_CONDITION = {
				...editing,
				c: editing.c ? [...editing.c, FORM_DATA] : [FORM_DATA],
			};

			if (!UPDATED_BLOCKDATA.data.c) {
				UPDATED_BLOCKDATA.data.c = UPDATED_CONDITION;
				setBlockData(UPDATED_BLOCKDATA);
			} else {
				if (
					updateConditionById(
						UPDATED_BLOCKDATA.data.c.c,
						UPDATED_CONDITION.id,
						UPDATED_CONDITION
					)
				) {
					setBlockData(UPDATED_BLOCKDATA);
				} else {
					const UPDATED_JSON_OBJECT = {
						...UPDATED_BLOCKDATA,
						data: {
							...UPDATED_BLOCKDATA.data,
							c: UPDATED_CONDITION,
						},
					};
					setBlockData(UPDATED_JSON_OBJECT);
				}
			}
		}

		setSelectedOption("");
		setOperatorChange("");
		setProfileObjective(true);
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
		if (blockData.data.c) {
			addCondition(blockData.data.c.id);
		} else {
			const FIRST_CONDITION_GROUP = {
				type: "conditionsGroup",
				id: parseInt(Date.now() * Math.random()).toString(),
				op: "&",
			};
			setEditing(FIRST_CONDITION_GROUP);
		}
	};

	function swapConditionParam(condition, param) {
		const UPDATED_BLOCKDATA = deepCopy(blockData);
		let swapParameter = undefined;

		if (param == "op") {
			swapParameter = condition.op === "&" ? "|" : "&";
		} else if (param == "showc") {
			swapParameter = condition.showc === true ? false : true;
		}

		updateConditionParam(
			UPDATED_BLOCKDATA.data.c,
			condition.id,
			param,
			swapParameter
		);
		setBlockData(UPDATED_BLOCKDATA);
	}

	function handleProfileChange() {
		setProfileObjective(conditionObjective.current.value === "");
	}

	function handleDateChange() {
		setDateOperator(conditionOperator.current.value === "");
	}

	function updateConditionParam(jsonObj, id, param, newParam) {
		if (jsonObj.id === id) {
			jsonObj[param] = newParam;
			return true;
		} else if (jsonObj.c) {
			for (let i = 0; i < jsonObj.c.length; i++) {
				if (updateConditionParam(jsonObj.c[i], id, param, newParam)) {
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

		const OBJECT_VALUE = conditionObjective.current?.value;
		const OBJECT2_VALUE = conditionObjective2.current?.value;
		const IS_OBJECT_EMPTY = !OBJECT_VALUE && OBJECT_VALUE !== 0;
		const IS_OBJECT2_EMPTY = !OBJECT2_VALUE && OBJECT2_VALUE !== 0;

		const IS_OBJECT_DISABLED = conditionObjective.current?.disabled;
		const IS_OBJECT2_DISABLED = conditionObjective2.current?.disabled;

		if (!IS_OBJECT_DISABLED) {
			if (IS_OBJECT_EMPTY) {
				saveButton.current.disabled = true;
			} else {
				saveButton.current.disabled = false;
			}

			if (
				(OBJECT_VALUE < 0 || OBJECT_VALUE > 0) &&
				(conditionEdit.type == "grade" || conditionEdit.type == "courseGrade")
			) {
				saveButton.current.disabled = true;
			} else {
				saveButton.current.disabled = false;
			}
		}
		if (!IS_OBJECT2_DISABLED) {
			if (IS_OBJECT2_EMPTY) {
				saveButton.current.disabled = true;
			} else {
				saveButton.current.disabled = false;
			}

			if (
				(OBJECT2_VALUE < 0 || OBJECT2_VALUE > 0) &&
				(conditionEdit.type == "grade" || conditionEdit.type == "courseGrade")
			) {
				saveButton.current.disabled = true;
			} else {
				saveButton.current.disabled = false;
			}
		}
		if (IS_OBJECT_DISABLED && IS_OBJECT2_DISABLED) {
			saveButton.current.disabled = true;
		}

		if (!IS_OBJECT_DISABLED && !IS_OBJECT2_DISABLED) {
			if (IS_OBJECT_EMPTY || IS_OBJECT2_EMPTY) {
				saveButton.current.disabled = true;
			} else {
				saveButton.current.disabled = false;
			}

			if (
				OBJECT2_VALUE <= OBJECT_VALUE &&
				(conditionEdit.type == "grade" || conditionEdit.type == "courseGrade")
			) {
				saveButton.current.disabled = true;
			} else {
				saveButton.current.disabled = false;
			}
		}
	};

	useEffect(() => {
		if (conditionEdit) {
			if (conditionEdit.type !== "profile") {
				setProfileObjective(true);
			}
			addCondition(conditionEdit.id);
			setSelectedOption(conditionEdit.type);
		}
	}, [conditionEdit]);

	const CONDITIONS_GROUP_OPERATOR_LIST = [
		{ value: "&", name: "Deben cumplirse todas" },
		{ value: "|", name: "Solo debe cumplirse una" },
		{ value: "!&", name: "No se deben cumplir todas" },
		{ value: "!|", name: "No debe cumplirse alguna" },
	];

	return (
		<Modal size="xl" show={showConditionsModal} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Precondiciones de "{blockData.data.label}"</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{blockData.data.c &&
					blockData.data.c.c &&
					blockData.data.c.c.length >= 1 &&
					!editing && (
						<Container
							style={{
								padding: "10px",
								border: "1px solid #C7C7C7",
								marginBottom: "10px",
							}}
						>
							<Row className="align-items-center">
								{blockData.data.c.op !== "&" &&
									blockData.data.c.op !== "!|" && (
										<Col className="col-1">
											<Button
												variant="light"
												onClick={() =>
													swapConditionParam(blockData.data.c, "showc")
												}
											>
												<div>
													{blockData.data.c.showc ? (
														<FontAwesomeIcon icon={faEye} />
													) : (
														<FontAwesomeIcon icon={faEyeSlash} />
													)}
												</div>
											</Button>
										</Col>
									)}
								<Col>
									<div>Tipo: Conjunto de condiciones</div>
									<div>
										<strong>
											{
												CONDITIONS_GROUP_OPERATOR_LIST.find(
													(item) => item.value === blockData.data.c.op
												)?.name
											}
										</strong>
									</div>
								</Col>
								<Col className="col d-flex align-items-center justify-content-end gap-2">
									<Button
										variant="light"
										onClick={() => {
											setConditionEdit(blockData.data.c);
										}}
									>
										<div>
											<FontAwesomeIcon icon={faEdit} />
										</div>
									</Button>
								</Col>
							</Row>
							<Container>
								{blockData.data.c.c.map((condition) => {
									return (
										<Condition
											key={condition.id}
											condition={condition}
											conditionsList={blockData.data.c}
											upCondition={upCondition}
											downCondition={downCondition}
											deleteCondition={deleteCondition}
											addCondition={addCondition}
											setSelectedOption={setSelectedOption}
											setConditionEdit={setConditionEdit}
											swapConditionParam={swapConditionParam}
											moodleGroups={MOODLE_GROUPS}
											moodleGroupings={MOODLE_GROUPINGS}
											conditionsGroupOperatorList={
												CONDITIONS_GROUP_OPERATOR_LIST
											}
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
						conditionEdit.type !== "grade") ? (
						<>
							<Form.Label htmlFor="condition-select">Precondición:</Form.Label>
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
								<option value="courseGrade">
									Calificación total del curso
								</option>
								{MOODLE_GROUPS.length > 0 && (
									<option value="group">Grupo</option>
								)}
								{MOODLE_GROUPINGS.length > 0 && (
									<option value="grouping">Agrupamiento</option>
								)}
								<option value="profile">Perfil de usuario</option>
								<option value="conditionsGroup">Conjunto de condiciones</option>
							</Form.Select>
							<hr />
						</>
					) : null)}

				{editing &&
					conditionEdit?.type &&
					(conditionEdit.type == "completion" ||
						conditionEdit.type == "grade") && (
						<>
							<Form.Label htmlFor="condition-select">Precondición:</Form.Label>
							<Form.Select
								id="condition-select"
								onChange={handleSelectChange}
								defaultValue={conditionEdit?.type ? conditionEdit?.type : ""}
								required
							>
								<option value="completion">Finalización</option>
								{(getNodeById(conditionEdit.cm, reactFlowInstance.getNodes())
									.type == "quiz" ||
									getNodeById(conditionEdit.cm, reactFlowInstance.getNodes())
										.type == "assign" ||
									getNodeById(conditionEdit.cm, reactFlowInstance.getNodes())
										.type == "workshop" ||
									getNodeById(conditionEdit.cm, reactFlowInstance.getNodes())
										.type == "forum") && (
									<option value="grade">Calificación</option>
								)}
							</Form.Select>
							<hr />
						</>
					)}

				{editing && selectedOption === "date" && (
					<DateForm
						conditionQuery={conditionQuery}
						conditionOperator={conditionOperator}
						conditionEdit={conditionEdit}
						handleDateChange={handleDateChange}
					/>
				)}
				{editing && selectedOption === "grade" && (
					<GradeForm
						conditionOperator={conditionOperator}
						conditionQuery={conditionQuery}
						conditionObjective={conditionObjective}
						conditionObjective2={conditionObjective2}
						conditionEdit={conditionEdit}
						parentsNodeArray={PARENTS_NODE_ARRAY}
						checkInputs={checkInputs}
						nodes={reactFlowInstance.getNodes()}
					/>
				)}

				{editing && selectedOption === "courseGrade" && (
					<CourseGradeForm
						conditionOperator={conditionOperator}
						conditionQuery={conditionQuery}
						conditionObjective={conditionObjective}
						conditionObjective2={conditionObjective2}
						conditionEdit={conditionEdit}
						parentsNodeArray={PARENTS_NODE_ARRAY}
						checkInputs={checkInputs}
					/>
				)}

				{editing && selectedOption === "completion" && (
					<CompletionForm
						parentsNodeArray={PARENTS_NODE_ARRAY}
						conditionOperator={conditionOperator}
						conditionQuery={conditionQuery}
						conditionEdit={conditionEdit}
						nodes={reactFlowInstance.getNodes()}
					/>
				)}

				{editing && selectedOption === "group" && MOODLE_GROUPS.length > 0 && (
					<GroupForm
						conditionOperator={conditionOperator}
						moodleGroups={MOODLE_GROUPS}
						conditionEdit={conditionEdit}
					/>
				)}
				{editing &&
					selectedOption === "grouping" &&
					MOODLE_GROUPINGS.length > 0 && (
						<GroupingForm
							conditionOperator={conditionOperator}
							conditionEdit={conditionEdit}
							moodleGroupings={MOODLE_GROUPINGS}
						/>
					)}
				{editing && selectedOption === "profile" && (
					<ProfileForm
						conditionOperator={conditionOperator}
						conditionQuery={conditionQuery}
						conditionObjective={conditionObjective}
						conditionEdit={conditionEdit}
						handleProfileChange={handleProfileChange}
						operatorChange={operatorChange}
						setOperatorChange={setOperatorChange}
						setProfileObjective={setProfileObjective}
					/>
				)}
				{editing && selectedOption === "conditionsGroup" && (
					<ConditionsGroupForm
						conditionEdit={conditionEdit}
						conditionOperator={conditionOperator}
						conditionSubOperator={conditionSubOperator}
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
						<Button
							variant="danger"
							onClick={cancelEditCondition}
							className="me-2"
						>
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
								(selectedOption === "profile" &&
									profileObjective &&
									operatorChange !== "isempty" &&
									operatorChange !== "isnotempty") ||
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

export default ConditionModalMoodle;
