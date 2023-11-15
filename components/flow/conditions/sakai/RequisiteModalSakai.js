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
import { parseDate, uniqueId } from "@utils/Utils";
import DateExceptionComponent from "@components/flow/conditions/sakai/condition-components/DateExceptionComponent";
import GroupComponent from "@components/flow/conditions/sakai/condition-components/GroupComponent";
import GradeComponent from "@components/flow/conditions/sakai/condition-components/GradeComponent";
import { getAutomaticReusableStyles } from "@utils/Colors";
import { reOrderSakaiRequisites } from "@utils/Sakai";

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
			// FUTURE FEATURE EDIT DATE EXCEPTION??
			switch (conditionEdit.type) {
				case "date":
				case "dateException":
					const INITIAL_DATES = {
						openingDate: conditionEdit.openingDate,
						dueDate: conditionEdit.dueDate,
					};
					setDates(INITIAL_DATES);
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
	const groupsRef = metaData.sakai_groups.map(() => useRef(null));
	const exceptionSelectRef = useRef(null);
	const exceptionEntityRef = useRef(null);
	const pointRef = useRef(null);

	const INITIAL_DATES = {
		openingDate: undefined,
		dueDate: undefined,
		closeTime: undefined,
	};

	const [initalGroups, setInitalGroups] = useState([]);

	const VISIBILITY_ARRAY = [
		"forum",
		"html",
		"resource",
		"text",
		"url",
		"folder",
	];

	const [dates, setDates] = useState(INITIAL_DATES);
	const [errorForm, setErrorForm] = useState();

	useEffect(() => {
		if (dates) {
			let message = [];
			if (
				dates["openingDate"] !== "" &&
				dates["dueDate"] !== "" &&
				dates["closeTime"] !== ""
			) {
				const OPENING_DATE_REF_VALUE = new Date(dates["openingDate"]);
				const DUE_DATE_REF_VALUE = new Date(dates["dueDate"]);

				if (OPENING_DATE_REF_VALUE >= DUE_DATE_REF_VALUE) {
					message.push({
						id: 1,
						message:
							"La fecha de apertura no debe ser superior o igual a la fecha de entrega",
					});
				} else {
					message = message.filter((item) => item.id !== 2);
				}

				if (dates["closeTime"]) {
					const CLOSED_TIME_REF_VALUE = new Date(dates["closeTime"]);

					if (DUE_DATE_REF_VALUE >= CLOSED_TIME_REF_VALUE) {
						message.push({
							id: 2,
							message:
								"La fecha de entrega no debe ser superior o igual a la fecha límite",
						});
					} else {
						message = message.filter((item) => item.id !== 2);
					}

					if (OPENING_DATE_REF_VALUE >= CLOSED_TIME_REF_VALUE) {
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
				message.push({
					id: 4,
					message: "Todas los campos deben poseer un formato de fecha correcto",
				});
			}
			setErrorForm(message);
		}
	}, [dates]);

	const cancelEditCondition = () => {
		setDates(INITIAL_DATES);
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

		const FOUND_CONDITION = conditions.find(
			(condition) => condition.itemId === id
		);
		if (FOUND_CONDITION) {
			return FOUND_CONDITION;
		}

		for (const CONDITION of conditions) {
			if (CONDITION.subConditions) {
				const INNER_CONDITION = findConditionById(id, CONDITION.subConditions);
				if (INNER_CONDITION) {
					return INNER_CONDITION;
				}
			}
		}

		return null;
	}

	const deleteRequisite = (requisiteId, isRequisite) => {
		const UPDATED_BLOCKDATA = { ...blockData };

		if (isRequisite) {
			const REQUISITE_ARRAY_FILTERED = UPDATED_BLOCKDATA.data.requisites.filter(
				(item) => item.id !== requisiteId
			);

			UPDATED_BLOCKDATA.data.requisites = REQUISITE_ARRAY_FILTERED;
		} else {
			const foundCondition = findConditionById(
				requisiteId,
				blockData.data.gradeRequisites.subConditions
			);
			UPDATED_BLOCKDATA.data.gradeRequisites?.subConditions?.forEach(
				(logicalSet) => {
					logicalSet.subConditions = logicalSet.subConditions?.filter(
						(cond) => cond.itemId !== requisiteId
					);
				}
			);

			const EDGES = reactFlowInstance.getEdges();

			const EDGES_UPDATED = EDGES.filter(
				(edge) => edge.id === foundCondition.itemId + "-" + blockData.id
			);

			onEdgesDelete(EDGES_UPDATED);
		}

		setBlockData(UPDATED_BLOCKDATA);
	};

	// FIXME: CHANGE DATETIME FROM THE BACK
	const saveNewCondition = () => {
		const FORM_DATA = { type: editing };
		switch (editing) {
			case "date":
				FORM_DATA.id = uniqueId();
				if (dates.openingDate) {
					FORM_DATA.openingDate = openingDateRef.current.value;
				}

				if (dates.dueDate) {
					FORM_DATA.dueDate = dueDateRef.current.value;
				}

				if (!VISIBILITY_ARRAY.includes(blockData.type) && dates.closeTime) {
					FORM_DATA.closeTime = closeTimeRef.current.value;
				}

				break;
			case "dateException":
				FORM_DATA.id = uniqueId();
				if (blockData.type == "exam") {
					FORM_DATA.op = exceptionSelectRef.current.value;
					FORM_DATA.entityId = exceptionEntityRef.current.value;
					FORM_DATA.openingDate = openingDateRef.current.value;
					FORM_DATA.dueDate = dueDateRef.current.value;
					FORM_DATA.closeTime = closeTimeRef.current.value;
				}
				break;
			case "group":
				FORM_DATA.id = uniqueId();
				FORM_DATA.groupList = initalGroups;
				break;
			case "SCORE":
				FORM_DATA.itemId = uniqueId();
				FORM_DATA.argument = Number(pointRef.current.value);
				FORM_DATA.operator = exceptionSelectRef.current.value;
		}

		const UPDATED_BLOCKDATA = { ...blockData };

		if (conditionEdit) {
			if (editing == "group") {
				FORM_DATA.id = conditionEdit.id;
				const GROUP_REQUISITE = UPDATED_BLOCKDATA.data.requisites.find(
					(item) => item.type === "group"
				);

				GROUP_REQUISITE.groupList = FORM_DATA.groupList;

				setBlockData(UPDATED_BLOCKDATA);
			} else if (editing == "date") {
				FORM_DATA.id = conditionEdit.id;
				let dateRequisite = UPDATED_BLOCKDATA.data.requisites.find(
					(item) => item.type === "date"
				);

				dateRequisite = FORM_DATA;

				setBlockData({
					...UPDATED_BLOCKDATA,
					data: {
						...UPDATED_BLOCKDATA.data,
						requisites: UPDATED_BLOCKDATA.data.requisites.map((item) =>
							item.type === "date" ? dateRequisite : item
						),
					},
				});
			} else {
				FORM_DATA.itemId = conditionEdit.itemId;
				UPDATED_BLOCKDATA.data.gradeRequisites.subConditions.forEach(
					(logicalSet) => {
						let conditionIndex = logicalSet.subConditions.findIndex(
							(cond) => cond.itemId === conditionEdit.itemId
						);

						if (conditionIndex !== -1) {
							logicalSet.subConditions[conditionIndex] = {
								...logicalSet.subConditions[conditionIndex],
								...FORM_DATA,
							};
						}
					}
				);
			}
		} else {
			if (!UPDATED_BLOCKDATA.data.requisites) {
				UPDATED_BLOCKDATA.data.requisites = [];
			}

			UPDATED_BLOCKDATA.data.requisites.push(FORM_DATA);

			const REORDERED_LIST = reOrderSakaiRequisites(
				UPDATED_BLOCKDATA.data.requisites
			);

			UPDATED_BLOCKDATA.data.requisites = REORDERED_LIST;
			setBlockData(UPDATED_BLOCKDATA);
		}

		cancelEditCondition();
	};

	function hasRequisiteType(type) {
		return blockData.data?.requisites?.some(
			(requisitesItem) => requisitesItem.type === type
		);
	}

	const DATE_REQUISITE = blockData.data.requisites?.filter(
		(item) => item.type === "date"
	);

	const GROUP_LIST = blockData.data.requisites?.find(
		(item) => item.type === "group"
	);

	const MODAL_SIZE = blockData.type === "exam" ? "xl" : "lg";

	return (
		<Modal size={MODAL_SIZE} show={showRequisitesModal} onHide={handleClose}>
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
											onClick={() => setConditionEdit(DATE_REQUISITE[0])}
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
												deleteRequisite(DATE_REQUISITE[0].id, true)
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
										sakaiGroups={metaData.sakai_groups}
										sakaiUsers={metaData.user_members}
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
													onClick={() => setConditionEdit(GROUP_LIST)}
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
													onClick={() => deleteRequisite(GROUP_LIST.id, true)}
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
												sakaiGroups={metaData.sakai_groups}
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
						visibilityArray={VISIBILITY_ARRAY}
						openingDateRef={openingDateRef}
						dueDateRef={dueDateRef}
						closeTimeRef={closeTimeRef}
						editing={editing}
						exceptionSelectRef={exceptionSelectRef}
						exceptionEntityRef={exceptionEntityRef}
						exceptionSelected={exceptionSelected}
						setExceptionSelected={setExceptionSelected}
						sakaiGroups={metaData.sakai_groups}
						sakaiUsers={metaData.user_members}
						conditionEdit={conditionEdit}
					></DateForm>
				)}

				{editing && editing == "group" && (
					<GroupForm
						groupsRef={groupsRef}
						blockData={blockData}
						sakaiGroups={metaData.sakai_groups}
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
