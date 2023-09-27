import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "@root/styles/ConditionModalMoodle.module.css";
//import { Editor } from "@tinymce/tinymce-react";
import { uniqueId, searchConditionForTypes } from "@utils/Utils";
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

	const roleList = metaData.role_list;
	const badgeList = metaData.badges;
	const skillsList = metaData.skills;

	const [lmsResourceList, setLmsResourceList] = useState([]);

	const addCondition = (conditionId) => {
		if (blockData.data.c.id != conditionId) {
			const foundCondition = findConditionById(
				conditionId,
				blockData.data.c.params
			);
			setEditing(foundCondition);
		} else {
			setEditing(blockData.data.c);
		}
	};

	const addConditionToMain = () => {
		if (blockData.data.c) {
			addCondition(blockData.data.c.id);
		} else {
			const firstConditionGroup = {
				type: "conditionsGroup",
				criteriatype: 0,
				id: parseInt(Date.now() * Math.random()).toString(),
				method: "&",
			};
			setEditing(firstConditionGroup);
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
			if (condition.params) {
				const innerCondition = findConditionById(id, condition.c);
				if (innerCondition) {
					return innerCondition;
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

		const updatedLmsResourceList = lmsResourceList.map((item) => ({
			...item,
			checkboxEnabled: false,
		}));

		setLmsResourceList(updatedLmsResourceList);
	};

	const handleSelectChange = (event) => {
		setSelectedOption(event.target.value);
		setIsDateEnabled(false);
		setSelectedCheckboxes([]);
		setCheckedIds([]);
		setCheckboxValues([]);

		const updatedLmsResourceList = lmsResourceList.map((item) => ({
			...item,
			checkboxEnabled: false,
		}));

		setLmsResourceList(updatedLmsResourceList);
	};

	function deleteConditionById(conditions, id) {
		for (let i = 0; i < conditions.length; i++) {
			const condition = conditions[i];
			if (condition.id === id) {
				conditions.splice(i, 1);
				if (conditions.length === 0) {
					conditions = undefined;
				}
				return true;
			} else if (condition.params) {
				if (deleteConditionById(condition.params, id)) {
					if (condition.params.length === 0) {
						condition.params = undefined;
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
		const foundCondition = findConditionById(
			conditionId,
			blockData.data.c.params
		);

		// If clause to check if the condition is completion type
		if (foundCondition.type === "completion") {
			// Constant to retrieve the activityList of the completion condition
			const activityList = foundCondition.params;

			// Get method to retrieve the actual edges
			const edges = reactFlowInstance.getEdges();

			// Filter method to get all the edges using the ids inside the activityList
			const edgesToDelete = edges.filter((edge) =>
				activityList.some(
					(condition) => condition.id + "-" + blockData.id === edge.id
				)
			);

			// Method to delete the children associated with the given edges
			onEdgesDelete(edgesToDelete);

			// Filter method to get all the edges except for those that match the provided IDs
			const filteredEdges = edges.filter(
				(edge) =>
					!activityList.some(
						(condition) => edge.id === condition.id + "-" + blockData.id
					)
			);

			// Set method to stablish the new updated edges
			reactFlowInstance.setEdges(filteredEdges);
		}

		// Method to create a copy of the blockData
		const blockDataCopy = deepCopy(blockData);

		// Delete method to delete the condition by ID
		deleteConditionById(blockDataCopy.data.c.params, conditionId);

		// Set method to set the updated blockData
		setBlockData(blockDataCopy);
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
		console.log(condition);
		const updatedBlockData = deepCopy(blockData);
		const swapOperator = condition.method === "&" ? "|" : "&";

		updateConditionOp(updatedBlockData.data.c, condition.id, swapOperator);
		setBlockData(updatedBlockData);
	}

	useEffect(() => {
		if (conditionEdit) {
			addCondition(conditionEdit.id);
			setSelectedOption(conditionEdit.type);

			if (conditionEdit.type == "completion") {
				setCheckboxValues(conditionEdit.params);

				const transformedData = conditionEdit.params.map((item) => ({
					...item,
					checkboxEnabled: item.date !== undefined ? true : false,
				}));

				setLmsResourceList(transformedData);
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
		const updatedList = [...lmsResourceList];
		const currentCheckbox = updatedList[index];

		const dateInputs = document.querySelectorAll('input[type="date"]');

		for (let i = 0; i < dateInputs.length; i++) {
			if (dateInputs[i].id === currentCheckbox.id.toString()) {
				if (!currentCheckbox.checkboxEnabled) {
					const updatedArray = checkboxValues.map((item) => {
						if (item.id === dateInputs[i].id) {
							return { ...item, date: dateInputs[i].value };
						}
						return item;
					});

					setCheckboxValues(updatedArray);
				} else {
					const updatedArray = checkboxValues.map((item) => {
						if (item.id === dateInputs[i].id) {
							return { ...item, date: undefined };
						}
						return item;
					});

					setCheckboxValues(updatedArray);
				}
				break;
			}
		}

		currentCheckbox.checkboxEnabled = !currentCheckbox.checkboxEnabled;

		setLmsResourceList(updatedList);
	};

	const handleDateChange = (index) => {
		const updatedList = [...lmsResourceList];
		const currentCheckbox = updatedList[index];

		const dateInputs = document.querySelectorAll('input[type="date"]');

		for (let i = 0; i < dateInputs.length; i++) {
			if (dateInputs[i].id === currentCheckbox.id.toString()) {
				if (currentCheckbox.checkboxEnabled) {
					const updatedArray = checkboxValues.map((item) => {
						if (item.id === dateInputs[i].id) {
							return { ...item, date: dateInputs[i].value };
						}
						return item;
					});

					setCheckboxValues(updatedArray);
				} else {
					const updatedArray = checkboxValues.map((item) => {
						if (item.id === dateInputs[i].id) {
							return { ...item, date: undefined };
						}
						return item;
					});

					setCheckboxValues(updatedArray);
				}
				break;
			}
		}

		setLmsResourceList(updatedList);
	};

	const handleSubmit = (edition) => {
		const formData = {
			type: selectedOption,
			method: edition ? conditionEdit.method : "method",
			id: edition ? conditionEdit.id : uniqueId(),
		};

		switch (selectedOption) {
			case "role":
				formData.criteriatype = 2;
				formData.method = conditionOperator.current.value;
				formData.params = checkedIds;
				break;
			case "courseCompletion":
				formData.criteriatype = 4;
				formData.method = conditionOperator.current.value;
				if (isDateEnabled) {
					formData.dateTo = conditionObjective.current.value;
				} else {
					formData.dateTo = undefined;
				}
				break;
			case "badgeList":
				formData.criteriatype = 7;
				formData.method = conditionOperator.current.value;
				formData.params = checkedIds;
				break;
			case "completion":
				formData.criteriatype = 1;
				formData.params = checkboxValues;
				break;
			case "skills":
				formData.criteriatype = 9;
				formData.method = conditionOperator.current.value;
				formData.params = checkedIds;
				break;
			default:
				break;
		}

		const updatedBlockData = deepCopy(blockData);

		if (edition) {
			const updatedBlockData = {
				...blockData,
				data: {
					...blockData.data,
					c: {
						...blockData.data.c,
						params: blockData.data.c.params.map((condition) => {
							if (condition.id === formData.id) {
								return {
									...condition,
									...formData,
								};
							}
							return condition;
						}),
					},
				},
			};

			setBlockData(updatedBlockData);
		} else {
			const updatedCondition = {
				...editing,
				params: editing.params ? [...editing.params, formData] : [formData],
			};

			if (!updatedBlockData.data.c) {
				updatedBlockData.data.c = updatedCondition;
				setBlockData(updatedBlockData);
			} else {
				const updatedBlockData = {
					...blockData,
					data: {
						...blockData.data,
						c: {
							...blockData.data.c,
							params: [...blockData.data.c.params, formData],
						},
					},
				};

				setBlockData(updatedBlockData);
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
		const conditions = blockData.data.c?.params;
		if (conditions) {
			if (conditionEdit) {
				if (conditionEdit.type == type) {
					return true;
				} else {
					return false;
				}
			} else {
				if (type != "completion") {
					return !conditions.some((condition) => condition.type === type);
				}
			}
		} else {
			if (type != "completion") {
				return true;
			}
		}
	};

	const allTypesUsed = () => {
		const conditions = blockData.data.c?.params;
		const types = ["role", "courseCompletion", "badgeList", "skills"];

		return types.every((type) =>
			conditions?.some((condition) => condition.type === type)
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
											roleList={roleList}
											badgeList={badgeList}
											skillsList={skillsList}
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
						roleList={roleList}
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
						badgeList={badgeList}
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
						skillsList={skillsList}
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
