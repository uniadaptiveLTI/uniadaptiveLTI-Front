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
	const cqId = useId();
	const coId = useId();

	const defaultValueFiveMinutes =
		conditionEdit?.openingDate || calculateDefaultDateTime(5);

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
				<Form.Label
					htmlFor={cqId}
					className="me-4"
					style={{ minWidth: "125px", marginLeft: "20px" }}
				>
					Desde:{" "}
				</Form.Label>
				<Form.Control
					id={cqId}
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
					htmlFor={coId}
					className="me-4"
					style={{ minWidth: "125px", marginLeft: "20px" }}
				>
					Hasta:{" "}
				</Form.Label>
				<Form.Control
					id={coId}
					ref={dueDateRef}
					type="datetime-local"
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
