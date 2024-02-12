import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "/styles/ConditionModalMoodle.module.css";
//import { Editor } from "@tinymce/tinymce-react";
import { uniqueId } from "@utils/Utils";
import {
	Modal,
	Button,
	Form,
	Row,
	Col,
	Container,
	FormCheck,
} from "react-bootstrap";
import Criteria from "./Criteria";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShuffle, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useReactFlow } from "reactflow";
import RoleForm from "./form-components/RoleForm";
import CourseCompletionForm from "./form-components/CourseCompletionForm";
import BadgeListForm from "./form-components/BadgeListForm";
import CompletionForm from "./form-components/CompletionForm";
import SkillsForm from "./form-components/SkillsForm";
import { MetaDataContext } from "pages/_app";

function CriteriaModal({
	blockData,
	setBlockData,
	blocksData,
	onEdgesDelete,
	showConditionsModal,
	setShowConditionsModal,
}) {
	const reactFlowInstance = useReactFlow();

	const conditionOperator = useRef(null);
	const objectiveEnabler = useRef(null);
	const conditionObjective = useRef(null);
	const saveButton = useRef(null);

	const [editing, setEditing] = useState(undefined);
	const [selectedOption, setSelectedOption] = useState(null);
	const [conditionEdit, setConditionEdit] = useState(undefined);
	const [checkboxValues, setCheckboxValues] = useState([]);
	const [isDateEnabled, setIsDateEnabled] = useState();

	const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
	const [checkedIds, setCheckedIds] = useState(selectedCheckboxes || []);

	const { metaData, setMetaData } = useContext(MetaDataContext);

	const ROLE_LIST = metaData.role_list;
	const BADGE_LIST = metaData.badges;
	const SKILL_LIST = metaData.skills;

	const [lmsResourceList, setLmsResourceList] = useState([]);

	const addCondition = (conditionId) => {
		if (blockData.data.c.id != conditionId) {
			const FOUND_CONDITION = findConditionById(
				conditionId,
				blockData.data.c.params
			);
			setEditing(FOUND_CONDITION);
		} else {
			setEditing(blockData.data.c);
		}
	};

	const addConditionToMain = () => {
		if (blockData.data.c) {
			addCondition(blockData.data.c.id);
		} else {
			const FIRST_CONDITION_GROUP = {
				type: "conditionsGroup",
				criteriatype: 0,
				id: parseInt(Date.now() * Math.random()).toString(),
				method: "&",
			};
			setEditing(FIRST_CONDITION_GROUP);
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

		for (const CONDITION of conditions) {
			if (CONDITION.params) {
				const INNER_CONDITION = findConditionById(id, CONDITION.c);
				if (INNER_CONDITION) {
					return INNER_CONDITION;
				}
			}
		}

		return null;
	}

	const cancelEditCondition = () => {
		setSelectedOption("");
		setCheckboxValues([]);
		setIsDateEnabled(false);
		setConditionEdit(undefined);
		setEditing(undefined);

		const updatedLmsResourceList = lmsResourceList.map((item) => ({
			...item,
			checkboxEnabled: false,
		}));

		setLmsResourceList(updatedLmsResourceList);
	};

	const handleClose = () => {
		setBlockData();
		setShowConditionsModal(false);

		const UPDATED_LMS_RESOURCE_LIST = lmsResourceList.map((item) => ({
			...item,
			checkboxEnabled: false,
		}));

		setLmsResourceList(UPDATED_LMS_RESOURCE_LIST);
	};

	const handleSelectChange = (event) => {
		setSelectedOption(event.target.value);
		setIsDateEnabled(false);
		setSelectedCheckboxes([]);
		setCheckedIds([]);
		setCheckboxValues([]);

		const UPDATED_LMS_RESOURCE_LIST = lmsResourceList.map((item) => ({
			...item,
			checkboxEnabled: false,
		}));

		setLmsResourceList(UPDATED_LMS_RESOURCE_LIST);
	};

	function deleteConditionById(conditions, id) {
		for (let i = 0; i < conditions.length; i++) {
			const CONDITION = conditions[i];
			if (CONDITION.id === id) {
				conditions.splice(i, 1);
				if (conditions.length === 0) {
					conditions = undefined;
				}
				return true;
			} else if (CONDITION.params) {
				if (deleteConditionById(CONDITION.params, id)) {
					if (CONDITION.params.length === 0) {
						CONDITION.params = undefined;
					}
					return true;
				}
			}
		}
		return false;
	}

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

	const deleteCondition = (conditionId) => {
		// We found the condition to delete
		const FOUND_CONDITION = findConditionById(
			conditionId,
			blockData.data.c.params
		);

		// If clause to check if the condition is completion type
		if (FOUND_CONDITION.type === "completion") {
			// Constant to retrieve the activityList of the completion condition
			const ACTIVITY_LIST = FOUND_CONDITION.params;

			// Get method to retrieve the actual edges
			const EDGES = reactFlowInstance.getEdges();

			// Filter method to get all the edges using the ids inside the activityList
			const edgesToDelete = EDGES.filter((edge) =>
				ACTIVITY_LIST.some(
					(condition) => condition.id + "-" + blockData.id === edge.id
				)
			);

			// Method to delete the children associated with the given edges
			onEdgesDelete(edgesToDelete);

			// Filter method to get all the edges except for those that match the provided IDs
			const FILTERED_EDGES = EDGES.filter(
				(edge) =>
					!ACTIVITY_LIST.some(
						(condition) => edge.id === condition.id + "-" + blockData.id
					)
			);

			// Set method to stablish the new updated edges
			reactFlowInstance.setEdges(FILTERED_EDGES);
		}

		// Method to create a copy of the blockData
		const BLOCKDATA_COPY = deepCopy(blockData);

		// Delete method to delete the condition by ID
		deleteConditionById(BLOCKDATA_COPY.data.c.params, conditionId);

		// Set method to set the updated blockData
		setBlockData(BLOCKDATA_COPY);
	};

	function updateConditionOp(jsonObj, id, newOp) {
		if (jsonObj.id === id) {
			jsonObj.method = newOp;
			return true;
		} else if (jsonObj.params) {
			for (let i = 0; i < jsonObj.params.length; i++) {
				if (updateConditionOp(jsonObj.params[i], id, newOp)) {
					return true;
				}
			}
		}
		return false;
	}

	function swapConditionGroup(condition) {
		const UPDATED_BLOCKDATA = deepCopy(blockData);
		const SWAP_OPERATOR = condition.method === "&" ? "|" : "&";

		updateConditionOp(UPDATED_BLOCKDATA.data.c, condition.id, SWAP_OPERATOR);
		setBlockData(UPDATED_BLOCKDATA);
	}

	useEffect(() => {
		if (conditionEdit) {
			addCondition(conditionEdit.id);
			setSelectedOption(conditionEdit.type);

			if (conditionEdit.type == "completion") {
				setCheckboxValues(conditionEdit.params);

				const TRANSFORMED_DATA = conditionEdit.params.map((item) => ({
					...item,
					checkboxEnabled: item.date !== undefined ? true : false,
				}));

				setLmsResourceList(TRANSFORMED_DATA);
			}
			if (
				conditionEdit.type == "role" ||
				conditionEdit.type == "badgeList" ||
				conditionEdit.type == "skills"
			) {
				setCheckedIds(conditionEdit.params);
			}
			if (conditionEdit.type == "courseCompletion") {
				if (conditionEdit.dateTo) {
					setIsDateEnabled(true);
				} else {
					setIsDateEnabled(false);
				}
			}
		}
	}, [conditionEdit]);

	const handleDateCheckboxChange = () => {
		setIsDateEnabled(!isDateEnabled);
	};

	const handleCheckboxChange = (event) => {
		const { value, checked } = event.target;

		setCheckedIds((prevCheckedIds) =>
			checked
				? [...prevCheckedIds, value]
				: prevCheckedIds.filter((id) => id !== value)
		);
	};

	const handleSecondCheckboxChange = (index) => {
		const UPDATED_LIST = [...lmsResourceList];
		const CURRENT_CHECKBOX = UPDATED_LIST[index];

		const dateInputs = document.querySelectorAll('input[type="date"]');

		for (let i = 0; i < dateInputs.length; i++) {
			if (dateInputs[i].id === CURRENT_CHECKBOX.id.toString()) {
				if (!CURRENT_CHECKBOX.checkboxEnabled) {
					const UPDATED_ARRAY = checkboxValues.map((item) => {
						if (item.id === dateInputs[i].id) {
							return { ...item, date: dateInputs[i].value };
						}
						return item;
					});

					setCheckboxValues(UPDATED_ARRAY);
				} else {
					const UPDATED_ARRAY = checkboxValues.map((item) => {
						if (item.id === dateInputs[i].id) {
							return { ...item, date: undefined };
						}
						return item;
					});

					setCheckboxValues(UPDATED_ARRAY);
				}
				break;
			}
		}

		CURRENT_CHECKBOX.checkboxEnabled = !CURRENT_CHECKBOX.checkboxEnabled;

		setLmsResourceList(UPDATED_LIST);
	};

	const handleDateChange = (index) => {
		const UPDATED_LIST = [...lmsResourceList];
		const CURRENT_CHECKBOX = UPDATED_LIST[index];

		const DATE_INPUTS = document.querySelectorAll('input[type="date"]');

		for (let i = 0; i < DATE_INPUTS.length; i++) {
			if (DATE_INPUTS[i].id === CURRENT_CHECKBOX.id.toString()) {
				if (CURRENT_CHECKBOX.checkboxEnabled) {
					const UPDATED_ARRAY = checkboxValues.map((item) => {
						if (item.id === DATE_INPUTS[i].id) {
							return { ...item, date: DATE_INPUTS[i].value };
						}
						return item;
					});

					setCheckboxValues(UPDATED_ARRAY);
				} else {
					const UPDATED_ARRAY = checkboxValues.map((item) => {
						if (item.id === DATE_INPUTS[i].id) {
							return { ...item, date: undefined };
						}
						return item;
					});

					setCheckboxValues(UPDATED_ARRAY);
				}
				break;
			}
		}

		setLmsResourceList(UPDATED_LIST);
	};

	const handleSubmit = (edition) => {
		const FORM_DATA = {
			type: selectedOption,
			method: edition ? conditionEdit.method : "method",
			id: edition ? conditionEdit.id : uniqueId(),
		};

		switch (selectedOption) {
			case "role":
				FORM_DATA.criteriatype = 2;
				FORM_DATA.method = conditionOperator.current.value;
				FORM_DATA.params = checkedIds;
				break;
			case "courseCompletion":
				FORM_DATA.criteriatype = 4;
				FORM_DATA.method = conditionOperator.current.value;
				if (isDateEnabled) {
					FORM_DATA.dateTo = conditionObjective.current.value;
				} else {
					FORM_DATA.dateTo = undefined;
				}
				break;
			case "badgeList":
				FORM_DATA.criteriatype = 7;
				FORM_DATA.method = conditionOperator.current.value;
				FORM_DATA.params = checkedIds;
				break;
			case "completion":
				FORM_DATA.criteriatype = 1;
				FORM_DATA.params = checkboxValues;
				break;
			case "skills":
				FORM_DATA.criteriatype = 9;
				FORM_DATA.method = conditionOperator.current.value;
				FORM_DATA.params = checkedIds;
				break;
			default:
				break;
		}

		const UPDATED_BLOCKSDATA = deepCopy(blockData);

		if (edition) {
			const UPDATED_BLOCKDATA = {
				...blockData,
				data: {
					...blockData.data,
					c: {
						...blockData.data.c,
						params: blockData.data.c.params.map((condition) => {
							if (condition.id === FORM_DATA.id) {
								return {
									...condition,
									...FORM_DATA,
								};
							}
							return condition;
						}),
					},
				},
			};

			setBlockData(UPDATED_BLOCKDATA);
		} else {
			const UPDATED_CONDITION = {
				...editing,
				params: editing.params ? [...editing.params, FORM_DATA] : [FORM_DATA],
			};

			if (!UPDATED_BLOCKSDATA.data.c) {
				UPDATED_BLOCKSDATA.data.c = UPDATED_CONDITION;
				setBlockData(UPDATED_BLOCKSDATA);
			} else {
				const UPDATED_BLOCKDATA = {
					...blockData,
					data: {
						...blockData.data,
						c: {
							...blockData.data.c,
							params: [...blockData.data.c.params, FORM_DATA],
						},
					},
				};

				setBlockData(UPDATED_BLOCKDATA);
			}
		}

		setSelectedOption("");
		setCheckboxValues([]);
		setSelectedCheckboxes([]);
		setCheckedIds([]);
		setConditionEdit(undefined);
		setEditing(undefined);
	};

	const shouldRenderOption = (type) => {
		const CONDITIONS = blockData.data.c?.params;
		if (CONDITIONS) {
			if (conditionEdit) {
				if (conditionEdit.type == type) {
					return true;
				} else {
					return false;
				}
			} else {
				if (type != "completion") {
					return !CONDITIONS.some((condition) => condition.type === type);
				}
			}
		} else {
			if (type != "completion") {
				return true;
			}
		}
	};

	const allTypesUsed = () => {
		const CONDITIONS = blockData.data.c?.params;
		const TYPES = ["role", "courseCompletion", "badgeList", "skills"];

		return TYPES.every((type) =>
			CONDITIONS?.some((condition) => condition.type === type)
		);
	};

	return (
		<Modal size="xl" show={showConditionsModal} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Precondiciones de "{blockData.data.label}"</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{blockData.data.c &&
					blockData.data.c.params &&
					blockData.data.c.params.length >= 1 &&
					!editing && (
						<Container
							style={{
								padding: "10px",
								border: "1px solid #C7C7C7",
								marginBottom: "10px",
							}}
						>
							<Row className="align-items-center">
								<Col>
									<div>
										A los estudiantes se les concede esta insignia cuando
										finalizan{" "}
										{blockData.data.c.method == "&" && (
											<a>
												<strong>TODOS</strong>{" "}
											</a>
										)}
										{blockData.data.c.method == "|" && (
											<a>
												<strong>CUALQUIERA</strong> de{" "}
											</a>
										)}
										los requisitos enumerados
									</div>
								</Col>
								<Col className="col d-flex align-items-center justify-content-end gap-2">
									<Button
										variant="light"
										onClick={() => {
											swapConditionGroup(blockData.data.c);
										}}
									>
										<div>
											<FontAwesomeIcon icon={faShuffle} />
										</div>
									</Button>
								</Col>
							</Row>
							<Container>
								{blockData.data.c.params.map((condition) => {
									return (
										<Criteria
											condition={condition}
											roleList={ROLE_LIST}
											badgeList={BADGE_LIST}
											skillsList={SKILL_LIST}
											deleteCondition={deleteCondition}
											addCondition={addCondition}
											setSelectedOption={setSelectedOption}
											setConditionEdit={setConditionEdit}
											swapConditionGroup={swapConditionGroup}
										></Criteria>
									);
								})}
							</Container>
						</Container>
					)}
				{editing &&
					(conditionEdit === undefined ||
					conditionEdit.type !== "conditionsGroup" ? (
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
								{shouldRenderOption("role") && (
									<option value="role">Concesión manual por rol</option>
								)}

								{shouldRenderOption("courseCompletion") && (
									<option value="courseCompletion">
										Finalización del curso
									</option>
								)}

								{shouldRenderOption("badgeList") && (
									<option value="badgeList">Insignias otorgadas</option>
								)}

								{shouldRenderOption("skills") && (
									<option value="skills">Competencias</option>
								)}

								{shouldRenderOption("completion") && (
									<option value="completion">
										Finalización de la actividad
									</option>
								)}
							</Form.Select>
							<hr />
						</>
					) : null)}
				{editing && selectedOption === "role" && (
					<RoleForm
						conditionEdit={conditionEdit}
						conditionOperator={conditionOperator}
						handleCheckboxChange={handleCheckboxChange}
						roleList={ROLE_LIST}
					/>
				)}
				{editing && selectedOption === "courseCompletion" && (
					<CourseCompletionForm
						conditionEdit={conditionEdit}
						conditionOperator={conditionOperator}
						objectiveEnabler={objectiveEnabler}
						conditionObjective={conditionObjective}
						handleDateCheckboxChange={handleDateCheckboxChange}
						isDateEnabled={isDateEnabled}
					/>
				)}
				{editing && selectedOption === "badgeList" && (
					<BadgeListForm
						conditionEdit={conditionEdit}
						conditionOperator={conditionOperator}
						selectedBadges={conditionEdit?.badgeList}
						setCheckedIds={setCheckedIds}
						badgeList={BADGE_LIST}
						handleCheckboxChange={handleCheckboxChange}
					/>
				)}

				{editing && selectedOption === "completion" && (
					<CompletionForm
						conditionEdit={conditionEdit}
						conditionOperator={conditionOperator}
						lmsResourceList={lmsResourceList}
						handleDateChange={handleDateChange}
						handleSecondCheckboxChange={handleSecondCheckboxChange}
					/>
				)}
				{editing && selectedOption === "skills" && (
					<SkillsForm
						conditionEdit={conditionEdit}
						conditionOperator={conditionOperator}
						skillsList={SKILL_LIST}
						handleCheckboxChange={handleCheckboxChange}
					/>
				)}
				{!editing && !allTypesUsed() && (
					<Button className="mb-5" variant="light" onClick={addConditionToMain}>
						<div role="button">
							<FontAwesomeIcon className={styles.cModal} icon={faPlus} />
							Crear condición
						</div>
					</Button>
				)}
			</Modal.Body>
			<Modal.Footer>
				{editing && selectedOption && (
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
									handleSubmit(true);
								} else {
									handleSubmit(false);
								}
							}}
							disabled={
								((selectedOption === "badgeList" ||
									selectedOption === "skills" ||
									selectedOption === "role") &&
									checkedIds.length <= 0) ||
								(selectedOption === "courseCompletion" &&
									conditionOperator.current &&
									conditionOperator.current.value.trim() === "")
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

export default CriteriaModal;

/*
<Editor
							onInit={(evt, editor) => (editorRef.current = editor)}
							initialValue="<p>This is the initial content of the editor.</p>"
							init={{
								height: 500,
								menubar: false,
								plugins: [
									"advlist",
									"autolink",
									"lists",
									"link",
									"image",
									"charmap",
									"preview",
									"anchor",
									"searchreplace",
									"visualblocks",
									"code",
									"fullscreen",
									"insertdatetime",
									"media",
									"table",
									"code",
									"help",
									"wordcount",
								],
								toolbar:
									"undo redo | blocks | " +
									"bold italic forecolor | alignleft aligncenter " +
									"alignright alignjustify | bullist numlist outdent indent | " +
									"removeformat | help",
								content_style:
									"body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
							}}
						/>*/
