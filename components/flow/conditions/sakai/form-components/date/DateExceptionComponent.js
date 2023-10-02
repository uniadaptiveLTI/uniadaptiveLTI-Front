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
	const cqId = useId();
	const coId = useId();

	const selectExceptionChange = (ref) => {
		setExceptionSelected(ref.current.value);
	};

	const defaultValueFiveMinutes = calculateDefaultDateTime(5);

	const defaultValueTenMinutes = calculateDefaultDateTime(10);

	useLayoutEffect(() => {
		const openingValue = openingDateRef.current.value;
		const dueDate = dueDateRef.current.value;
		console.log(openingValue);
		setDates({
			openingDate: openingValue,
			dueDate: dueDate,
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
					htmlFor={cqId}
					className="me-4"
					style={{ minWidth: "160px" }}
				>
					Fecha de apertura:{" "}
				</Form.Label>
				<Form.Control
					id={cqId}
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
					htmlFor={coId}
					className="me-4"
					style={{ minWidth: "160px" }}
				>
					Fecha de entrega:{" "}
				</Form.Label>
				<Form.Control
					id={coId}
					ref={dueDateRef}
					type="datetime-local"
					onChange={() => {
						dateInputChange("dueDate", dueDateRef);
					}}
					defaultValue={requisiteEdit ? requisiteEdit : defaultValueFiveMinutes}
				/>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-6">
				<Form.Label
					htmlFor={coId}
					className="me-4"
					style={{ minWidth: "160px" }}
				>
					Fecha límite:{" "}
				</Form.Label>
				<Form.Control
					id={coId}
					type="datetime-local"
					ref={closeTimeRef}
					onChange={() => {
						dateInputChange("closeTime", closeTimeRef);
					}}
					defaultValue={requisiteEdit ? requisiteEdit : defaultValueTenMinutes}
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
