import {
	faCalendarAlt,
	faCalendarXmark,
	faEdit,
	faTrashCan,
	faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, {
	useEffect,
	useContext,
	useRef,
	useState,
	useLayoutEffect,
} from "react";
import {
	Modal,
	Button,
	Form,
	Row,
	Col,
	Container,
	Tabs,
	Tab,
} from "react-bootstrap";
import { useReactFlow } from "reactflow";
import DateForm from "@components/flow/conditions/sakai/form-components/DateForm";
import GroupForm from "@components/flow/conditions/sakai/form-components/GroupForm";
import GradeForm from "@components/flow/conditions/sakai/form-components/GradeForm";
import styles from "/styles/RequisiteModalSakai.module.css";
import { MetaDataContext } from "/pages/_app.js";
import DateComponent from "@components/flow/conditions/sakai/condition-components/DateComponent";
import { parseDate, uniqueId, reOrderSakaiRequisites } from "@utils/Utils";
import DateExceptionComponent from "@components/flow/conditions/sakai/condition-components/DateExceptionComponent";
import GroupComponent from "@components/flow/conditions/sakai/condition-components/GroupComponent";
import GradeComponent from "@components/flow/conditions/sakai/condition-components/GradeComponent";
import { getAutomaticReusableStyles } from "@utils/Colors";

function RequisiteModalSakai({
	blockData,
	setBlockData,
	blocksData,
	onEdgesDelete,
	showRequisitesModal,
	setShowRequisitesModal,
}) {
	const { metaData, setMetaData } = useContext(MetaDataContext);
	const reactFlowInstance = useReactFlow();

	const [key, setKey] = useState();

	const [editing, setEditing] = useState(undefined);
	const [conditionEdit, setConditionEdit] = useState(undefined);
	const [exceptionSelected, setExceptionSelected] = useState("user");

	useEffect(() => {
		if (conditionEdit) {
			console.log(conditionEdit);
			// FUTURE FEATURE EDIT DATE EXCEPTION??
			switch (conditionEdit.type) {
				case "date":
				case "dateException":
					const initialDates = {
						openingDate: conditionEdit.openingDate,
						dueDate: conditionEdit.dueDate,
					};
					setDates(initialDates);
					break;
				case "group":
					setInitalGroups(conditionEdit.groupList);
					break;
				case "SCORE":
					// Handle 'SCORE' case if needed
					break;
				default:
					break;
			}
			setEditing(conditionEdit.type);
		}
	}, [conditionEdit]);

	const openingDateRef = useRef(null);
	const dueDateRef = useRef(null);
	const closeTimeRef = useRef(null);
	const groupsRef = metaData.groups.map(() => useRef(null));
	const exceptionSelectRef = useRef(null);
	const exceptionEntityRef = useRef(null);
	const pointRef = useRef(null);

	const initialDates = {
		openingDate: undefined,
		dueDate: undefined,
		closeTime: undefined,
	};

	const [initalGroups, setInitalGroups] = useState([]);

	const visibilityArray = [
		"forum",
		"html",
		"resource",
		"text",
		"url",
		"folder",
	];

	const [dates, setDates] = useState(initialDates);
	const [errorForm, setErrorForm] = useState();

	useEffect(() => {
		if (dates) {
			let message = [];
			if (
				dates["openingDate"] !== "" &&
				dates["dueDate"] !== "" &&
				dates["closeTime"] !== ""
			) {
				const openingDateRefValue = new Date(dates["openingDate"]);
				const dueDateRefValue = new Date(dates["dueDate"]);

				if (openingDateRefValue >= dueDateRefValue) {
					message.push({
						id: 1,
						message:
							"La fecha de apertura no debe ser superior o igual a la fecha de entrega",
					});
				} else {
					message = message.filter((item) => item.id !== 2);
				}

				if (dates["closeTime"]) {
					console.log("CLOSE TIME DEFINED");
					const closeTimeRefValue = new Date(dates["closeTime"]);

					if (dueDateRefValue >= closeTimeRefValue) {
						message.push({
							id: 2,
							message:
								"La fecha de entrega no debe ser superior o igual a la fecha límite",
						});
					} else {
						message = message.filter((item) => item.id !== 2);
					}

					if (openingDateRefValue >= closeTimeRefValue) {
						console.log(openingDateRefValue, closeTimeRefValue);
						message.push({
							id: 3,
							message:
								"La fecha de apertura no debe ser superior o igual a la fecha límite",
						});
					} else {
						message = message.filter((item) => item.id !== 3);
					}
				}
			} else {
				console.log("Fecha vacia");
				message.push({
					id: 4,
					message: "Todas los campos deben poseer un formato de fecha correcto",
				});
			}

			console.log(message);
			setErrorForm(message);
		}
	}, [dates]);

	const cancelEditCondition = () => {
		setDates(initialDates);
		setInitalGroups([]);
		setEditing(undefined);
		setExceptionSelected("user");
		setConditionEdit(undefined);
		setKey(editing);
	};

	const handleClose = () => {
		setBlockData();
		setShowRequisitesModal(false);
	};

	const addConditionToMain = (op) => {
		setEditing(op);
	};

	function findConditionById(id, conditions) {
		if (!conditions) {
			return null;
		}

		const foundCondition = conditions.find(
			(condition) => condition.itemId === id
		);
		if (foundCondition) {
			return foundCondition;
		}

		for (const condition of conditions) {
			if (condition.subConditions) {
				const innerCondition = findConditionById(id, condition.subConditions);
				if (innerCondition) {
					return innerCondition;
				}
			}
		}

		return null;
	}

	const deleteRequisite = (requisiteId, isRequisite) => {
		const updatedBlockData = { ...blockData };

		if (isRequisite) {
			const requisiteArrayFiltered = updatedBlockData.data.requisites.filter(
				(item) => item.id !== requisiteId
			);

			updatedBlockData.data.requisites = requisiteArrayFiltered;
		} else {
			const foundCondition = findConditionById(
				requisiteId,
				blockData.data.gradeRequisites.subConditions
			);
			console.log(updatedBlockData.data.gradeRequisites);
			updatedBlockData.data.gradeRequisites?.subConditions?.forEach(
				(logicalSet) => {
					logicalSet.subConditions = logicalSet.subConditions?.filter(
						(cond) => cond.itemId !== requisiteId
					);
				}
			);

			const edges = reactFlowInstance.getEdges();

			const edgesUpdated = edges.filter(
				(edge) => edge.id === foundCondition.itemId + "-" + blockData.id
			);

			onEdgesDelete(edgesUpdated);
		}

		setBlockData(updatedBlockData);
	};

	// FIXME: CHANGE DATETIME FROM THE BACK
	const saveNewCondition = () => {
		const formData = { type: editing };
		switch (editing) {
			case "date":
				formData.id = uniqueId();
				if (dates.openingDate) {
					formData.openingDate = openingDateRef.current.value;
				}

				if (dates.dueDate) {
					formData.dueDate = dueDateRef.current.value;
				}

				if (!visibilityArray.includes(blockData.type) && dates.closeTime) {
					formData.closeTime = closeTimeRef.current.value;
				}

				break;
			case "dateException":
				formData.id = uniqueId();
				if (blockData.type == "exam") {
					formData.op = exceptionSelectRef.current.value;
					formData.entityId = exceptionEntityRef.current.value;
					formData.openingDate = openingDateRef.current.value;
					formData.dueDate = dueDateRef.current.value;
					formData.closeTime = closeTimeRef.current.value;
				}
				break;
			case "group":
				formData.id = uniqueId();
				formData.groupList = initalGroups;
				break;
			case "SCORE":
				formData.itemId = uniqueId();
				formData.argument = Number(pointRef.current.value);
				formData.operator = exceptionSelectRef.current.value;
		}

		console.log(formData);

		const updatedBlockData = { ...blockData };

		if (conditionEdit) {
			if (editing == "group") {
				formData.id = conditionEdit.id;
				const groupRequisite = updatedBlockData.data.requisites.find(
					(item) => item.type === "group"
				);

				groupRequisite.groupList = formData.groupList;

				setBlockData(updatedBlockData);
			} else if (editing == "date") {
				formData.id = conditionEdit.id;
				let dateRequisite = updatedBlockData.data.requisites.find(
					(item) => item.type === "date"
				);

				dateRequisite = formData;

				setBlockData({
					...updatedBlockData,
					data: {
						...updatedBlockData.data,
						requisites: updatedBlockData.data.requisites.map((item) =>
							item.type === "date" ? dateRequisite : item
						),
					},
				});
			} else {
				formData.itemId = conditionEdit.itemId;
				updatedBlockData.data.gradeRequisites.subConditions.forEach(
					(logicalSet) => {
						let conditionIndex = logicalSet.subConditions.findIndex(
							(cond) => cond.itemId === conditionEdit.itemId
						);

						if (conditionIndex !== -1) {
							logicalSet.subConditions[conditionIndex] = {
								...logicalSet.subConditions[conditionIndex],
								...formData,
							};
						}
					}
				);
				console.log(updatedBlockData.data.gradeRequisites);
			}
		} else {
			if (!updatedBlockData.data.requisites) {
				updatedBlockData.data.requisites = [];
			}

			updatedBlockData.data.requisites.push(formData);

			const reOrderedList = reOrderSakaiRequisites(
				updatedBlockData.data.requisites
			);

			updatedBlockData.data.requisites = reOrderedList;
			setBlockData(updatedBlockData);
		}

		cancelEditCondition();
	};

	function hasRequisiteType(type) {
		return blockData.data?.requisites?.some(
			(requisitesItem) => requisitesItem.type === type
		);
	}

	const dateRequisite = blockData.data.requisites?.filter(
		(item) => item.type === "date"
	);

	const groupList = blockData.data.requisites?.find(
		(item) => item.type === "group"
	);

	const modalSize = blockData.type === "exam" ? "xl" : "lg";

	return (
		<Modal size={modalSize} show={showRequisitesModal} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Prerequisitos de "{blockData.data.label}"</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{!editing && (
					<Tabs
						className={`${styles.key} d-flex justify-content-center mb-3 `}
						defaultActiveKey="date"
						activeKey={key}
						onSelect={(k) => setKey(k)}
					>
						<Tab
							eventKey="date"
							title={
								<div
									className={`${
										key !== "date" ? "text-secondary" : "text-dark"
									}`}
								>
									Fecha de disponibilidad
								</div>
							}
						>
							{hasRequisiteType("date") && (
								<>
									<div className="d-flex gap-1">
										<Button
											variant="light"
											style={getAutomaticReusableStyles(
												"light",
												true,
												true,
												false
											)}
											onClick={() => setConditionEdit(dateRequisite[0])}
										>
											<FontAwesomeIcon
												className={styles.cModal}
												icon={faEdit}
											/>
											Editar
										</Button>
										<Button
											variant="light"
											style={getAutomaticReusableStyles(
												"light",
												true,
												true,
												false
											)}
											onClick={() =>
												deleteRequisite(dateRequisite[0].itemId, true)
											}
										>
											<FontAwesomeIcon
												className={styles.cModal}
												icon={faTrashCan}
											/>
											Borrar
										</Button>
									</div>
									<DateComponent
										requisites={blockData.data.requisites}
										parseDate={parseDate}
										setConditionEdit={setConditionEdit}
										deleteRequisite={deleteRequisite}
									></DateComponent>
								</>
							)}

							{!editing && !hasRequisiteType("date") && (
								<Button
									variant="light"
									style={getAutomaticReusableStyles("light", true, true, false)}
									onClick={() => {
										addConditionToMain("date");
									}}
								>
									<FontAwesomeIcon
										className={styles.cModal}
										icon={faCalendarAlt}
									/>
									Establecer fecha de disponibilidad
								</Button>
							)}
						</Tab>
						{!editing && blockData.type == "exam" && (
							<Tab
								eventKey="dateException"
								className="border-success"
								title={
									<div
										className={`${
											key !== "dateException" ? "text-secondary" : "text-dark"
										} enabledKey`}
									>
										Exepciones de fecha
									</div>
								}
							>
								{!editing && blockData.type == "exam" && (
									<Button
										variant="light"
										style={getAutomaticReusableStyles(
											"light",
											true,
											true,
											false
										)}
										onClick={() => {
											addConditionToMain("dateException");
										}}
									>
										<FontAwesomeIcon
											className={styles.cModal}
											icon={faCalendarXmark}
										/>
										Establecer nueva excepción de fecha
									</Button>
								)}
								{hasRequisiteType("dateException") && (
									<DateExceptionComponent
										requisites={blockData.data.requisites}
										sakaiGroups={metaData.sakaiGroups}
										sakaiUsers={metaData.userMembersSakai}
										parseDate={parseDate}
										deleteRequisite={deleteRequisite}
									></DateExceptionComponent>
								)}
							</Tab>
						)}
						{!editing &&
							blockData.type !== "folder" &&
							blockData.type !== "forum" && (
								<Tab
									eventKey="group"
									className={`${
										styles[`${key === "group" ? "keyDisabled" : ""}`]
									}`}
									title={
										<div
											className={`${
												key !== "group" ? "text-secondary" : "text-dark"
											}`}
										>
											Grupos con permisos de acceso
										</div>
									}
								>
									{hasRequisiteType("group") && (
										<>
											<div className="d-flex gap-1">
												<Button
													variant="light"
													style={getAutomaticReusableStyles(
														"light",
														true,
														true,
														false
													)}
													onClick={() => setConditionEdit(groupList)}
												>
													<FontAwesomeIcon
														className={styles.cModal}
														icon={faEdit}
													/>
													Editar
												</Button>
												<Button
													variant="light"
													style={getAutomaticReusableStyles(
														"light",
														true,
														true,
														false
													)}
													onClick={() => deleteRequisite(groupList.id, true)}
												>
													<FontAwesomeIcon
														className={styles.cModal}
														icon={faTrashCan}
													/>
													Borrar
												</Button>
											</div>
											<GroupComponent
												requisites={blockData.data.requisites}
												sakaiGroups={metaData.sakaiGroups}
												setConditionEdit={setConditionEdit}
												deleteRequisite={deleteRequisite}
											></GroupComponent>
										</>
									)}
									{!editing &&
										!hasRequisiteType("group") &&
										blockData.type != "folder" && (
											<Button
												variant="light"
												style={getAutomaticReusableStyles(
													"light",
													true,
													true,
													false
												)}
												onClick={() => {
													addConditionToMain("group");
												}}
											>
												<FontAwesomeIcon
													className={styles.cModal}
													icon={faUserGroup}
												/>
												Establecer condición de grupo
											</Button>
										)}
								</Tab>
							)}
						{!editing && (
							<Tab
								eventKey="SCORE"
								title={
									<div
										className={`${
											key !== "SCORE" ? "text-secondary" : "text-dark"
										}`}
									>
										Calificación requerida
									</div>
								}
							>
								{blockData.data.gradeRequisites && (
									<GradeComponent
										blockData={blockData}
										setBlockData={setBlockData}
										gradeConditions={blockData.data.gradeRequisites}
										setConditionEdit={setConditionEdit}
										deleteRequisite={deleteRequisite}
									></GradeComponent>
								)}
								{!blockData.data.gradeRequisites && (
									<div>
										Actualmente no existe ninguna condición de calificación
										asociada a este bloque, para crear una, deberás realizar una
										línea o conexión entre otro bloque y este para que se genere
										una condición de obligatoriedad de tipo calificación
									</div>
								)}
							</Tab>
						)}
					</Tabs>
				)}

				{editing && (editing == "date" || editing == "dateException") && (
					<DateForm
						blockData={blockData}
						errorForm={errorForm}
						dates={dates}
						setDates={setDates}
						visibilityArray={visibilityArray}
						openingDateRef={openingDateRef}
						dueDateRef={dueDateRef}
						closeTimeRef={closeTimeRef}
						editing={editing}
						exceptionSelectRef={exceptionSelectRef}
						exceptionEntityRef={exceptionEntityRef}
						exceptionSelected={exceptionSelected}
						setExceptionSelected={setExceptionSelected}
						sakaiGroups={metaData.sakaiGroups}
						sakaiUsers={metaData.userMembersSakai}
						conditionEdit={conditionEdit}
					></DateForm>
				)}

				{editing && editing == "group" && (
					<GroupForm
						groupsRef={groupsRef}
						blockData={blockData}
						sakaiGroups={metaData.sakaiGroups}
						initalGroups={initalGroups}
						setInitalGroups={setInitalGroups}
						conditionEdit={conditionEdit}
					></GroupForm>
				)}
				{editing && editing == "SCORE" && (
					<GradeForm
						conditionEdit={conditionEdit}
						exceptionSelectRef={exceptionSelectRef}
						pointRef={pointRef}
					></GradeForm>
				)}
			</Modal.Body>
			<Modal.Footer>
				{editing && (
					<div>
						<Button
							variant="danger"
							className="me-2"
							onClick={cancelEditCondition}
						>
							Cancelar
						</Button>
					</div>
				)}
				{editing && (
					<>
						<Button
							onClick={saveNewCondition}
							variant="primary"
							disabled={
								errorForm.length >= 1 ||
								(editing == "group" &&
									(initalGroups == undefined || initalGroups.length <= 0))
							}
						>
							Guardar
						</Button>
					</>
				)}
			</Modal.Footer>
		</Modal>
	);
}

export default RequisiteModalSakai;
