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
	const CONDITION_QUERY_ID = useId();
	const CONDITION_OPERATOR_ID = useId();

	const DEFAULT_VALUE_5_MINUTES =
		conditionEdit?.openingDate || calculateDefaultDateTime(5);

	const DEFAULT_VALUE_10_MINUTES =
		conditionEdit?.openingDate || calculateDefaultDateTime(10);

	useLayoutEffect(() => {
		const OPENING_VALUE = openingDateRef.current.value;
		const DUE_DATE = dueDateRef.current.value;
		const CLOSE_TIME = closeTimeRef.current.value;

		setDates({
			openingDate: OPENING_VALUE,
			dueDate: DUE_DATE,
			closeTime: CLOSE_TIME,
		});
	}, []);

	return (
		<>
			<div className="d-flex align-items-baseline col-12 col-lg-8 col-xl-8">
				<Form.Label
					htmlFor={CONDITION_QUERY_ID}
					className="me-4"
					style={{ minWidth: "160px" }}
				>
					Fecha de apertura:{" "}
				</Form.Label>
				<Form.Control
					id={CONDITION_OPERATOR_ID}
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
					htmlFor={CONDITION_OPERATOR_ID}
					className="me-4"
					style={{ minWidth: "160px" }}
				>
					Fecha de entrega:{" "}
				</Form.Label>
				<Form.Control
					id={CONDITION_OPERATOR_ID}
					type="datetime-local"
					ref={dueDateRef}
					onChange={() => {
						dateInputChange("dueDate", dueDateRef);
					}}
					defaultValue={
						conditionEdit?.dueDate
							? conditionEdit.dueDate
							: DEFAULT_VALUE_5_MINUTES
					}
				/>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-8 col-xl-8">
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
						conditionEdit?.closeTime
							? conditionEdit.closeTime
							: DEFAULT_VALUE_10_MINUTES
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
