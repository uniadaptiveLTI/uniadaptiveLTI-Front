import React, { useId, useLayoutEffect } from "react";
import { Alert, Form } from "react-bootstrap";

const DateCommonComponent = ({
	conditionEdit,
	errorForm,
	openingDateRef,
	dueDateRef,
	setDates,
	calculateDefaultDateTime,
	dateInputChange,
}) => {
	const CONDITION_QUERY_ID = useId();
	const CONDITION_OPERATOR_ID = useId();

	const DEFAULT_VALUE_5_MINUTES =
		conditionEdit?.openingDate || calculateDefaultDateTime(5);

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
				<Form.Label
					htmlFor={CONDITION_QUERY_ID}
					className="me-4"
					style={{ minWidth: "125px", marginLeft: "20px" }}
				>
					Desde:{" "}
				</Form.Label>
				<Form.Control
					id={CONDITION_QUERY_ID}
					ref={openingDateRef}
					onChange={() => {
						dateInputChange("openingDate", openingDateRef);
					}}
					// FIXME: CHANGE TO SERVER DATE TIME
					defaultValue={
						conditionEdit?.openingDate
							? conditionEdit.openingDate
							: new Date().toISOString().slice(0, 16)
					}
					type="datetime-local"
				/>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-6">
				<Form.Label
					htmlFor={CONDITION_OPERATOR_ID}
					className="me-4"
					style={{ minWidth: "125px", marginLeft: "20px" }}
				>
					Hasta:{" "}
				</Form.Label>
				<Form.Control
					id={CONDITION_OPERATOR_ID}
					ref={dueDateRef}
					type="datetime-local"
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

export default DateCommonComponent;
