import React, { useId, useLayoutEffect } from "react";
import { Alert, Form } from "react-bootstrap";

const DateExceptionComponent = ({
	errorForm,
	openingDateRef,
	dueDateRef,
	closeTimeRef,
	exceptionSelectRef,
	exceptionEntityRef,
	setDates,
	requisiteEdit,
	exceptionSelected,
	setExceptionSelected,
	sakaiGroups,
	sakaiUsers,
	calculateDefaultDateTime,
	dateInputChange,
}) => {
	const CONDIITON_QUERY_ID = useId();
	const CONDITION_OPERATOR_ID = useId();

	const selectExceptionChange = (ref) => {
		setExceptionSelected(ref.current.value);
	};

	const DEFAULT_VALUE_5_MINUTES = calculateDefaultDateTime(5);

	const DEFAULT_VALUE_10_MINUTES = calculateDefaultDateTime(10);

	useLayoutEffect(() => {
		const OPENING_VALUE = openingDateRef.current.value;
		const DUE_DATE = dueDateRef.current.value;
		setDates({
			openingDate: OPENING_VALUE,
			dueDate: DUE_DATE,
		});
	}, []);

	return (
		<>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-6">
				<Form.Select
					ref={exceptionSelectRef}
					onChange={() => {
						selectExceptionChange(exceptionSelectRef);
					}}
				>
					<option value="user">Usuario</option>
					<option value="group">Grupo</option>
				</Form.Select>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-6">
				<Form.Select ref={exceptionEntityRef}>
					{!exceptionSelected ||
						(exceptionSelected === "user" &&
							sakaiUsers.map((user) => (
								<option key={user.id} value={user.id}>
									{user.name}
								</option>
							)))}
					{exceptionSelected === "group" &&
						sakaiGroups.map((group) => (
							<option key={group.id} value={group.id}>
								{group.name}
							</option>
						))}
				</Form.Select>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-6">
				<Form.Label
					htmlFor={CONDIITON_QUERY_ID}
					className="me-4"
					style={{ minWidth: "160px" }}
				>
					Fecha de apertura:{" "}
				</Form.Label>
				<Form.Control
					id={CONDIITON_QUERY_ID}
					ref={openingDateRef}
					onChange={() => {
						dateInputChange("openingDate", openingDateRef);
					}}
					// FIXME: CHANGE TO SERVER DATE TIME
					defaultValue={
						requisiteEdit
							? requisiteEdit
							: new Date().toISOString().slice(0, 16)
					}
					type="datetime-local"
				/>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-6">
				<Form.Label
					htmlFor={CONDITION_OPERATOR_ID}
					className="me-4"
					style={{ minWidth: "160px" }}
				>
					Fecha de entrega:{" "}
				</Form.Label>
				<Form.Control
					id={CONDITION_OPERATOR_ID}
					ref={dueDateRef}
					type="datetime-local"
					onChange={() => {
						dateInputChange("dueDate", dueDateRef);
					}}
					defaultValue={requisiteEdit ? requisiteEdit : DEFAULT_VALUE_5_MINUTES}
				/>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-6">
				<Form.Label
					htmlFor={CONDITION_OPERATOR_ID}
					className="me-4"
					style={{ minWidth: "160px" }}
				>
					Fecha límite:{" "}
				</Form.Label>
				<Form.Control
					id={CONDITION_OPERATOR_ID}
					type="datetime-local"
					ref={closeTimeRef}
					onChange={() => {
						dateInputChange("closeTime", closeTimeRef);
					}}
					defaultValue={
						requisiteEdit ? requisiteEdit : DEFAULT_VALUE_10_MINUTES
					}
				/>
			</div>
			{errorForm && errorForm.length >= 1 && (
				<Alert variant={"danger"} style={{ marginBottom: "0px" }}>
					<ul style={{ marginBottom: "0px" }}>
						{errorForm.map((error) => (
							<li key={error.id}>{error.message}</li>
						))}
					</ul>
				</Alert>
			)}
		</>
	);
};

export default DateExceptionComponent;
