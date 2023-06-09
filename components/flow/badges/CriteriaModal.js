import React, { useEffect, useRef, useState } from "react";
import styles from "@root/styles/ConditionModal.module.css";
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

function ConditionModal({
	blockData,
	setBlockData,
	blocksData,
	showConditionsModal,
	setShowConditionsModal,
}) {
	const conditionOperator = useRef(null);
	const objectiveEnabler = useRef(null);
	const conditionObjective = useRef(null);
	const saveButton = useRef(null);

	const [editing, setEditing] = useState(undefined);
	const [selectedOption, setSelectedOption] = useState(null);
	const [conditionEdit, setConditionEdit] = useState(undefined);

	const conditionsGroupOperatorList = [
		{ value: "&", name: "Se deben cumplir todas" },
		{ value: "|", name: "Solo debe cumplirse una" },
	];

	const roleList = [
		{ id: "98123", name: "Gestor" },
		{ id: "78134", name: "Profesor" },
		{ id: "89422", name: "Profesor sin permisos de edición" },
	];

	const badgeList = [
		{ id: "89562", name: "Insignia 1" },
		{ id: "24312", name: "Insignia 2" },
		{ id: "68456", name: "Insignia 3" },
	];

	const skillsList = [
		{ id: "89562", name: "Competencia 1" },
		{ id: "24312", name: "Competencia 2" },
		{ id: "68456", name: "Competencia 3" },
	];

	const [lmsResourceList, setLmsResourceList] = useState([
		{
			id: "1",
			name: "Cuestionario 1",
			section: 1,
			indentation: 1,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "2",
			name: "Cuestionario 2",
			section: 1,
			indentation: 2,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "3",
			name: "Cuestionario 3",
			section: 1,
			indentation: 3,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "4",
			name: "Cuestionario 4",
			section: 1,
			indentation: 4,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "5",
			name: "Tarea 1",
			section: 2,
			indentation: 1,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "6",
			name: "Tarea 2",
			section: 2,
			indentation: 2,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "7",
			name: "Tarea 3",
			section: 2,
			indentation: 3,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "8",
			name: "Tarea 3",
			section: 2,
			indentation: 3,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "9",
			name: "Taller 1",
			usectionnit: 3,
			indentation: 1,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "10",
			name: "Taller 2",
			section: 3,
			indentation: 2,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "11",
			name: "Taller 3",
			section: 3,
			indentation: 3,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "12",
			name: "Consulta 1",
			section: 4,
			indentation: 1,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "13",
			name: "Consulta 2",
			section: 4,
			indentation: 2,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
		{
			id: "14",
			name: "Consulta 3",
			section: 4,
			indentation: 3,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		},
	]);

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

	const cancelEditCondition = () => {
		setSelectedOption("");
		setCheckboxValues([]);
		setIsDateEnabled(false);
		setConditionEdit(undefined);
		setEditing(undefined);

		const updatedLmsResourceList = lmsResourceList.map((item) => ({
			...item,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		}));

		setLmsResourceList(updatedLmsResourceList);
	};

	const handleClose = () => {
		setBlockData();
		setShowConditionsModal(false);

		const updatedLmsResourceList = lmsResourceList.map((item) => ({
			...item,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
		}));

		setLmsResourceList(updatedLmsResourceList);
	};

	const handleSelectChange = (event) => {
		setSelectedOption(event.target.value);
		setIsDateEnabled(false);
		setCheckboxValues([]);

		const updatedLmsResourceList = lmsResourceList.map((item) => ({
			...item,
			firstCheckboxEnabled: false,
			secondCheckboxEnabled: false,
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
		const blockDataCopy = deepCopy(blockData);

		deleteConditionById(blockDataCopy.data.conditions.conditions, conditionId);

		console.log(blockDataCopy);
		setBlockData(blockDataCopy);
	};

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

	function swapConditionGroup(condition) {
		const updatedBlockData = deepCopy(blockData);
		const swapOperator = condition.op === "&" ? "|" : "&";

		updateConditionOp(
			updatedBlockData.data.conditions,
			condition.id,
			swapOperator
		);
		console.log(updatedBlockData);
		setBlockData(updatedBlockData);
	}

	useEffect(() => {
		console.log(blockData);
		if (conditionEdit) {
			console.log(conditionEdit);
			addCondition(conditionEdit.id);
			setSelectedOption(conditionEdit.type);
		}
	}, [conditionEdit]);

	const [isDateEnabled, setIsDateEnabled] = useState(false);

	const handleCheckboxChange = (event) => {
		if (selectedOption === "courseCompletion") {
			setIsDateEnabled(!isDateEnabled);
		}

		const { value, checked } = event.target;

		if (selectedOption === "completion") {
			const resource = lmsResourceList.find(
				(item) => item.id === value.toString()
			);

			if (checked) {
				setCheckboxValues([
					...checkboxValues,
					{
						id: resource.id,
						name: resource.name,
						section: resource.section,
						indentation: resource.indentation,
					},
				]);
			} else {
				const updatedValues = checkboxValues.filter((val) => val.id !== value);
				if (updatedValues.length === 0) {
					setCheckboxValues([]);
				} else {
					setCheckboxValues(updatedValues);
				}
			}
		} else {
			if (checked) {
				setCheckboxValues([
					...checkboxValues,
					{
						id: value,
					},
				]);
			} else {
				const updatedValues = checkboxValues.filter((val) => val.id !== value);
				if (updatedValues.length === 0) {
					setCheckboxValues([]);
				} else {
					setCheckboxValues(updatedValues);
				}
			}
		}
	};

	const handleFirstCheckboxChange = (event, index) => {
		handleCheckboxChange(event);

		const updatedList = [...lmsResourceList];
		const currentCheckbox = updatedList[index];
		currentCheckbox.firstCheckboxEnabled =
			!currentCheckbox.firstCheckboxEnabled;

		if (!currentCheckbox.firstCheckboxEnabled) {
			currentCheckbox.secondCheckboxEnabled = false;
		}

		setLmsResourceList(updatedList);
	};

	const handleSecondCheckboxChange = (index) => {
		const updatedList = [...lmsResourceList];
		const currentCheckbox = updatedList[index];

		const dateInputs = document.querySelectorAll('input[type="date"]');

		for (let i = 0; i < dateInputs.length; i++) {
			if (dateInputs[i].id === currentCheckbox.id.toString()) {
				if (!currentCheckbox.secondCheckboxEnabled) {
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

		currentCheckbox.secondCheckboxEnabled =
			!currentCheckbox.secondCheckboxEnabled;

		if (currentCheckbox.secondCheckboxEnabled) {
			currentCheckbox.firstCheckboxEnabled = true;
		}

		setLmsResourceList(updatedList);
	};

	const [checkboxValues, setCheckboxValues] = useState([]);

	const handleSubmit = (edition) => {
		const formData = { id: uniqueId(), type: selectedOption };

		formData.op = conditionOperator.current.value;
		switch (selectedOption) {
			case "role":
				formData.roleList = checkboxValues;
				break;
			case "courseCompletion":
				if (objectiveEnabler.current.checked) {
					formData.dateTo = conditionObjective.current.value;
				}
				break;
			case "badgeList":
				formData.badgeList = checkboxValues;
				break;
			case "completion":
				const sortedData = checkboxValues.sort((a, b) => {
					if (a.section === b.section) {
						return a.indentation - b.indentation;
					}
					return a.section - b.section;
				});

				formData.activityList = sortedData;
				break;
			case "skills":
				formData.skillsList = checkboxValues;
				break;
			default:
				break;
		}

		if (edition) {
			const updatedBlockData = {
				...blockData,
				data: {
					...blockData.data,
					conditions: {
						...blockData.data.conditions,
						conditions: blockData.data.conditions.conditions.map(
							(condition) => {
								if (condition.id === formData.id) {
									return {
										...condition,
										...formData,
									};
								}
								return condition;
							}
						),
					},
				},
			};
			setBlockData(updatedBlockData);
		} else {
			const updatedBlockData = {
				...blockData,
				data: {
					...blockData.data,
					conditions: {
						...blockData.data.conditions,
						conditions: [...blockData.data.conditions.conditions, formData],
					},
				},
			};
			setBlockData(updatedBlockData);
		}

		console.log(formData);
		setSelectedOption("");
		setCheckboxValues([]);
		setConditionEdit(undefined);
		setEditing(undefined);
	};

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
							<Col class="col-md-10">
								<div>
									A los estudiantes se les concede esta insignia cuando
									finalizan{" "}
									{blockData.data.conditions.op == "&" && (
										<a>
											<strong>TODOS</strong>{" "}
										</a>
									)}
									{blockData.data.conditions.op == "|" && (
										<a>
											<strong>CUALQUIERA</strong> de{" "}
										</a>
									)}
									los requisitos enumerados
								</div>
							</Col>
							<Col class="col-md-2 d-flex align-items-center">
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
						<Form.Select
							id="condition-select"
							onChange={handleSelectChange}
							defaultValue={conditionEdit?.type ? conditionEdit?.type : ""}
							required
						>
							<option value="" disabled>
								Escoge un tipo de condición...
							</option>
							<option value="role">Concesión manual por rol</option>
							<option value="courseCompletion">Finalización del curso</option>
							<option value="badgeList">Insignias otorgadas</option>
							<option value="completion">Finalización de la actividad</option>
							<option value="skills">Competencias</option>
						</Form.Select>
					) : null)}
				{editing && selectedOption === "role" && (
					<Form.Group>
						<Form.Select
							ref={conditionOperator}
							defaultValue={conditionEdit?.op}
						>
							<option value="&">
								Todos los roles seleccionados otorgan la insignia
							</option>
							<option value="|">Cualquiera de </option>
						</Form.Select>
						{roleList.map((option) => {
							return (
								<div>
									<Form.Check
										onChange={handleCheckboxChange}
										value={option.id}
										label={option.name}
										defaultChecked={conditionEdit?.roleList.some(
											(role) => role.id === option.id
										)}
									></Form.Check>
								</div>
							);
						})}
					</Form.Group>
				)}
				{editing && selectedOption === "courseCompletion" && (
					<Form.Group>
						<Form.Control
							ref={conditionOperator}
							type="number"
							min="0"
							max="10"
							defaultValue={
								conditionEdit
									? conditionEdit.type === "courseCompletion"
										? conditionEdit.op !== undefined
											? conditionEdit.op
											: 5
										: 5
									: 5
							}
						/>
						<Row>
							<Col>
								<Form.Check
									ref={objectiveEnabler}
									onChange={handleCheckboxChange}
									defaultChecked={
										conditionEdit && conditionEdit.type === "date"
											? false
												? false
												: true
											: true
									}
								/>
							</Col>
							<Col xs={6}>
								<Form.Control
									ref={conditionObjective}
									type="date"
									defaultValue={
										conditionEdit && conditionEdit.type === "date"
											? conditionEdit.date
												? conditionEdit.date
												: new Date().toISOString().substr(0, 10)
											: new Date().toISOString().substr(0, 10)
									}
									disabled={!isDateEnabled}
								/>
							</Col>
						</Row>
					</Form.Group>
				)}
				{editing && selectedOption === "badgeList" && (
					<Form.Group>
						<Form.Select
							ref={conditionOperator}
							defaultValue={conditionEdit?.op}
						>
							<option value="&">
								Se deben obtener todas las insignias seleccionadas
							</option>
							<option value="|">
								Se debe obtener alguna de las insignias seleccionadas{" "}
							</option>
						</Form.Select>
						{badgeList.map((option) => {
							return (
								<div>
									<Form.Check
										onChange={handleCheckboxChange}
										value={option.id}
										label={option.name}
									></Form.Check>
								</div>
							);
						})}
					</Form.Group>
				)}
				{editing && selectedOption === "completion" && (
					<Form.Group>
						<Form.Select
							ref={conditionOperator}
							defaultValue={conditionEdit?.op}
						>
							<option value="&">
								Todas las actividades seleccionadas están finalizadas
							</option>
							<option value="|">
								Cualquier actividad seleccionada está finalizada
							</option>
						</Form.Select>
						{lmsResourceList.map((option, index) => {
							return (
								<div key={index}>
									<Form.Check
										value={option.id}
										label={option.name}
										checked={option.firstCheckboxEnabled}
										onChange={(event) =>
											handleFirstCheckboxChange(event, index)
										}
									/>
									<Row>
										<Col>
											<Form.Control
												id={option.id}
												type="date"
												disabled={
													!option.secondCheckboxEnabled ||
													!option.firstCheckboxEnabled
												}
												defaultValue={new Date().toISOString().substr(0, 10)}
											/>
										</Col>
										<Col>
											<Form.Check
												label="Habilitar"
												checked={option.secondCheckboxEnabled}
												disabled={!option.firstCheckboxEnabled}
												onChange={() => handleSecondCheckboxChange(index)}
											/>
										</Col>
									</Row>
								</div>
							);
						})}
					</Form.Group>
				)}
				{editing && selectedOption === "skills" && (
					<Form.Group>
						<Form.Select
							ref={conditionOperator}
							defaultValue={conditionEdit?.op}
						>
							<option value="&">
								Se deben obtener todas las insignias seleccionadas
							</option>
							<option value="|">
								Se debe obtener alguna de las insignias seleccionadas{" "}
							</option>
						</Form.Select>
						{skillsList.map((option) => {
							return (
								<div>
									<Form.Check
										onChange={handleCheckboxChange}
										value={option.id}
										label={option.name}
									></Form.Check>
								</div>
							);
						})}
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
									handleSubmit(true);
								} else {
									handleSubmit(false);
								}
							}}
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
