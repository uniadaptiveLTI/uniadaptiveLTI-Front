import {
	faCalendarAlt,
	faCalendarXmark,
	faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useContext, useRef, useState } from "react";
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
import Requisite from "@conditionsSakai/Requisite";
import DateForm from "@conditionsSakai/form-components/DateForm";
import GroupForm from "@conditionsSakai/form-components/GroupForm";
import styles from "@root/styles/RequisiteModalSakai.module.css";
import { MetaDataContext } from "@root/pages/_app.js";
import DateComponent from "@conditionsSakai/condition-components/DateComponent";
import { parseDate, uniqueId } from "@utils/Utils";
import DateExceptionComponent from "@conditionsSakai/condition-components/DateExceptionComponent";
import GroupComponent from "@conditionsSakai/condition-components/GroupComponent";

function RequisiteModalSakai({
	blockData,
	setBlockData,
	blocksData,
	onEdgesDelete,
	showRequisitesModal,
	setShowRequisitesModal,
}) {
	const { metaData, setMetaData } = useContext(MetaDataContext);

	const [key, setKey] = useState();

	const [editing, setEditing] = useState(undefined);
	const [conditionEdit, setConditionEdit] = useState(undefined);
	const [exceptionSelected, setExceptionSelected] = useState("user");

	useEffect(() => {
		if (conditionEdit) {
			// FUTURE FEATURE EDIT DATE EXCEPTION??
			if (
				conditionEdit.type == "date" ||
				conditionEdit.type == "dateException"
			) {
				initialDates.openingDate = conditionEdit.openingDate;
				initialDates.dueDate = conditionEdit.dueDate;
				setDates(initialDates);
			} else {
				setInitalGroups(conditionEdit.groupList);
			}
			setEditing(conditionEdit.type);
		}
	}, [conditionEdit]);

	const openingDateRef = useRef(null);
	const dueDateRef = useRef(null);
	const groupsRef = metaData.groups.map(() => useRef(null));
	const exceptionSelectRef = useRef(null);
	const exceptionEntityRef = useRef(null);

	const initialDates = {
		openingDate: undefined,
		dueDate: undefined,
	};

	const sakaiUsers = [
		{ id: 1, name: "David" },
		{ id: 2, name: "Javi" },
		{ id: 3, name: "Juanma" },
	];

	const [initalGroups, setInitalGroups] = useState([]);

	const visibilityArray = [
		"exam",
		"forum",
		"html",
		"resource",
		"text",
		"url",
		"folder",
	];

	const [dates, setDates] = useState(initialDates);

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

	const deleteRequisite = (requisiteId) => {
		const updatedBlockData = { ...blockData };

		const requisiteArrayFiltered = updatedBlockData.data.requisites.filter(
			(item) => item.id !== requisiteId
		);

		updatedBlockData.data.requisites = requisiteArrayFiltered;

		setBlockData(updatedBlockData);
	};

	// FIXME: CHANGE DATETIME FROM THE BACK
	const saveNewCondition = () => {
		const formData = { type: editing };
		formData.id = uniqueId();

		switch (editing) {
			case "date":
				if (visibilityArray.includes(blockData.type)) {
					if (dates.openingDate) {
						formData.openingDate = openingDateRef.current.value;
					}

					if (dates.dueDate) {
						formData.dueDate = dueDateRef.current.value;
					}
				}
				break;
			case "dateException":
				if (blockData.type == "exam") {
					formData.op = exceptionSelectRef.current.value;
					formData.entityId = Number(exceptionEntityRef.current.value);

					if (dates.openingDate) {
						formData.openingDate = openingDateRef.current.value;
						if (dueDateRef.current.disabled) {
							const selectedDate = new Date(openingDateRef.current.value);
							selectedDate.setMonth(selectedDate.getMonth() + 1);
							formData.dueDate = selectedDate.toISOString().slice(0, 16);
						}
					}

					if (dates.dueDate) {
						formData.dueDate = dueDateRef.current.value;
						if (openingDateRef.current.disabled) {
							const currentDate = new Date();
							currentDate.setHours(0, 0, 0, 0);

							const year = currentDate.getFullYear();
							const month = String(currentDate.getMonth() + 1).padStart(2, "0");
							const day = String(currentDate.getDate()).padStart(2, "0");

							const formattedDate = `${year}-${month}-${day}T00:00`;

							formData.openingDate = formattedDate;
						}
					}
				}
				break;
			case "group":
				formData.groupList = initalGroups;
				break;
		}

		const updatedBlockData = { ...blockData };

		if (conditionEdit) {
			if (editing == "group") {
				const groupRequisite = updatedBlockData.data.requisites.find(
					(item) => item.type === "group"
				);

				groupRequisite.groupList = formData.groupList;

				setBlockData(updatedBlockData);
			} else {
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
			}
		} else {
			if (!updatedBlockData.data.requisites) {
				updatedBlockData.data.requisites = [];
			}

			updatedBlockData.data.requisites.push(formData);

			setBlockData(updatedBlockData);
		}

		cancelEditCondition();
	};

	function hasRequisiteType(type) {
		return blockData.data?.requisites?.some(
			(requisitesItem) => requisitesItem.type === type
		);
	}

	return (
		<Modal size="xl" show={showRequisitesModal} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Prerequisitos de "{blockData.data.label}"</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{!editing && (
					<Tabs
						defaultActiveKey="date"
						activeKey={key}
						onSelect={(k) => setKey(k)}
					>
						<Tab
							eventKey="date"
							title={
								<div className="text-success border-success">
									Fecha de disponibilidad
								</div>
							}
						>
							{hasRequisiteType("date") && (
								<DateComponent
									requisites={blockData.data.requisites}
									parseDate={parseDate}
									setConditionEdit={setConditionEdit}
									deleteRequisite={deleteRequisite}
								></DateComponent>
							)}

							{!editing && !hasRequisiteType("date") && (
								<Button
									className="mb-5"
									variant="light"
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
								className="border-danger"
								title={<div>Exepciones de fecha</div>}
							>
								{hasRequisiteType("dateException") && (
									<DateExceptionComponent
										requisites={blockData.data.requisites}
										sakaiGroups={metaData.groups}
										sakaiUsers={sakaiUsers}
										parseDate={parseDate}
										deleteRequisite={deleteRequisite}
									></DateExceptionComponent>
								)}
								{!editing && blockData.type == "exam" && (
									<Button
										className="mb-5"
										variant="light"
										onClick={() => {
											addConditionToMain("dateException");
										}}
									>
										<FontAwesomeIcon
											className={styles.cModal}
											icon={faCalendarXmark}
										/>
										Establecer excepción de fecha
									</Button>
								)}
							</Tab>
						)}
						{!editing && blockData.type != "folder" && (
							<Tab
								eventKey="group"
								className="border-warning"
								title={<div>Grupos con permisos de acceso</div>}
							>
								{hasRequisiteType("group") && (
									<GroupComponent
										requisites={blockData.data.requisites}
										sakaiGroups={metaData.groups}
										setConditionEdit={setConditionEdit}
										deleteRequisite={deleteRequisite}
									></GroupComponent>
								)}
								{!editing &&
									!hasRequisiteType("group") &&
									blockData.type != "folder" && (
										<Button
											className="mb-5"
											variant="light"
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
					</Tabs>
				)}

				{editing && (editing == "date" || editing == "dateException") && (
					<DateForm
						blockData={blockData}
						dates={dates}
						setDates={setDates}
						visibilityArray={visibilityArray}
						openingDateRef={openingDateRef}
						dueDateRef={dueDateRef}
						editing={editing}
						exceptionSelectRef={exceptionSelectRef}
						exceptionEntityRef={exceptionEntityRef}
						exceptionSelected={exceptionSelected}
						setExceptionSelected={setExceptionSelected}
						sakaiGroups={metaData.groups}
						sakaiUsers={sakaiUsers}
						conditionEdit={conditionEdit}
					></DateForm>
				)}

				{editing && editing == "group" && (
					<GroupForm
						groupsRef={groupsRef}
						blockData={blockData}
						sakaiGroups={metaData.groups}
						initalGroups={initalGroups}
						setInitalGroups={setInitalGroups}
						conditionEdit={conditionEdit}
					></GroupForm>
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
					<Button
						onClick={saveNewCondition}
						variant="primary"
						disabled={
							((editing == "date" || editing == "dateException") &&
								dates.openingDate === undefined &&
								dates.dueDate === undefined) ||
							dates.openingDate === "" ||
							dates.dueDate === "" ||
							(editing == "group" &&
								(initalGroups == undefined || initalGroups.length <= 0))
						}
					>
						Guardar
					</Button>
				)}
			</Modal.Footer>
		</Modal>
	);
}

export default RequisiteModalSakai;
