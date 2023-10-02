import React, { useId, useLayoutEffect } from "react";
import { Alert, Form } from "react-bootstrap";

const DateLimitComponent = ({
	conditionEdit,
	errorForm,
	openingDateRef,
	dueDateRef,
	closeTimeRef,
	setDates,
	calculateDefaultDateTime,
	dateInputChange,
}) => {
	const cqId = useId();
	const coId = useId();

	const defaultValueFiveMinutes =
		conditionEdit?.openingDate || calculateDefaultDateTime(5);

	const defaultValueTenMinutes =
		conditionEdit?.openingDate || calculateDefaultDateTime(10);

	useLayoutEffect(() => {
		const openingValue = openingDateRef.current.value;
		const dueDate = dueDateRef.current.value;
		const closeTime = closeTimeRef.current.value;

		setDates({
			openingDate: openingValue,
			dueDate: dueDate,
			closeTime: closeTime,
		});
	}, []);

	return (
		<>
			<div className="d-flex align-items-baseline col-12 col-lg-8 col-xl-8">
				<Form.Label
					htmlFor={cqId}
					className="me-4"
					style={{ minWidth: "160px" }}
				>
					Fecha de apertura:{" "}
				</Form.Label>
				<Form.Control
					id={coId}
					type="datetime-local"
					ref={openingDateRef}
					onChange={() => {
						dateInputChange("openingDate", openingDateRef);
					}}
					defaultValue={
						conditionEdit?.openingDate
							? conditionEdit.openingDate
							: new Date().toISOString().slice(0, 16)
					}
				/>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-8 col-xl-8">
				<Form.Label
					htmlFor={coId}
					className="me-4"
					style={{ minWidth: "160px" }}
				>
					Fecha de entrega:{" "}
				</Form.Label>
				<Form.Control
					id={coId}
					type="datetime-local"
					ref={dueDateRef}
					onChange={() => {
						dateInputChange("dueDate", dueDateRef);
					}}
					defaultValue={
						conditionEdit?.dueDate
							? conditionEdit.dueDate
							: defaultValueFiveMinutes
					}
				/>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-8 col-xl-8">
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
					defaultValue={
						conditionEdit?.closeTime
							? conditionEdit.closeTime
							: defaultValueTenMinutes
					}
				/>
			</div>
			{errorForm && errorForm.length >= 1 && (
				<Alert variant={"danger"}>
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

export default DateLimitComponent;
